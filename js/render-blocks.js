// js/render-blocks.js : renders content blocks (SPEC.md §4) to HTML, and
// builds a parallel text index (same traversal, same ids) used by search.js
// to scroll to + highlight a specific block after a search-result click.
//
// Design note: renderBlocks() and buildTextIndex() are both thin wrappers
// around processBlocks(), which walks the block tree exactly once. This
// guarantees the ids used to render <... data-blk="b3"> and the ids used in
// the search index can never drift apart, since they come from the same pass.
import { icon } from './icons.js';

const SECTION_HEADINGS = {
  simple: 'הסבר פשוט',
  deep: 'הסבר עמוק יותר',
  life: 'דוגמה מהחיים',
  drop: 'דוגמה מחנות אונליין',
  visual: 'תרשים או טבלה',
  mistakes: 'טעויות נפוצות',
  videos: 'סרטונים',
};

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Inline markup: **bold**, [[term-id|shown text]] -> glossary popover trigger,
// {{src:id}} -> small superscript source chip.
export function parseInline(text) {
  if (!text) return '';
  let s = escapeHtml(text);
  s = s.replace(/\{\{src:([\w-]+)\}\}/g, (m, id) => `<button type="button" class="src-chip" data-src="${id}">מקור</button>`);
  s = s.replace(/\[\[([\w-]+)\|([^\]]+)\]\]/g, (m, id, shown) => `<button type="button" class="term-link" data-term="${id}">${shown}</button>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return s;
}

// Strip markup down to plain text, for the search index (keeps [[..|shown]]'s
// shown text and drops the {{src:id}} chip entirely).
export function stripMarkup(text) {
  if (!text) return '';
  return String(text)
    .replace(/\{\{src:[\w-]+\}\}/g, '')
    .replace(/\[\[[\w-]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1');
}

export function moneyText(amount) {
  const n = Number(amount) || 0;
  const neg = n < 0;
  const abs = Math.abs(n);
  const numStr = Number.isInteger(abs)
    ? abs.toLocaleString('en-US')
    : abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${neg ? '−' : ''}${numStr} ₪`;
}

// calc result: money by default; a block can set resultSuffix (e.g. 'הזמנות')
// for a result that is a count and not an amount of shekels.
export function calcResultText(result, suffix) {
  const n = Number.isFinite(result) ? result : 0;
  if (suffix === undefined || suffix === null || suffix === '₪') return moneyText(n);
  const str = Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return suffix ? `${str} ${suffix}` : str;
}

export function moneyHtml(amount, extraClass = '') {
  return `<span class="v ${extraClass}" dir="ltr">${moneyText(amount)}</span>`;
}

function evalFormula(formula, ids, values) {
  try {
    // Sandboxed: only the declared input ids are in scope as arguments.
    // The formula string comes from our own content files, not user input.
    const fn = new Function(...ids, `"use strict"; return (${formula});`);
    return fn(...ids.map((id) => Number(values[id])));
  } catch (e) {
    return NaN;
  }
}

function ownText(b) {
  switch (b.t) {
    case 'p':
    case 'warn':
      return stripMarkup(b.text);
    case 'law':
      return b.text ? stripMarkup(b.text) : '';
    case 'list':
      return (b.items || []).map(stripMarkup).join(' ');
    case 'table':
      return [b.caption, ...(b.head || []), ...(b.rows || []).flat(), b.note]
        .filter(Boolean)
        .map(String)
        .map(stripMarkup)
        .join(' ');
    case 'receipt':
      return [b.title, ...(b.rows || []).map((r) => r.label), b.total && b.total.label, b.note]
        .filter(Boolean)
        .map(stripMarkup)
        .join(' ');
    case 'compare':
      return (b.columns || [])
        .map((c) => [c.title, ...(c.points || [])].filter(Boolean).map(stripMarkup).join(' '))
        .join(' ');
    case 'flow':
      return (b.steps || [])
        .map((s) => [s.label, s.sub].filter(Boolean).map(stripMarkup).join(' '))
        .join(' ');
    case 'calc':
      return [b.title, ...(b.inputs || []).map((i) => i.label), b.resultLabel, b.explain]
        .filter(Boolean)
        .map(stripMarkup)
        .join(' ');
    default:
      return '';
  }
}

function formatCheckedLine(checkedISO, asOf) {
  if (!checkedISO) return '';
  const [y, m, d] = checkedISO.split('-').map(Number);
  const year = asOf || String(y);
  return `נכון ל-${year} | נבדק ${d}.${m}.${y}`;
}

// blocks: array of §4 block objects. ctx: { checked, getSource, idPrefix }
export function processBlocks(blocks, ctx = {}) {
  const index = [];
  let counter = 0;
  const prefix = ctx.idPrefix || 'b';
  const nextId = () => `${prefix}${counter++}`;

  function renderList(list) {
    return (list || []).map(renderOne).join('');
  }

  function boxBody(b) {
    return b.text ? `<p>${parseInline(b.text)}</p>` : renderList(b.children || []);
  }

  function renderLaw(b, id) {
    const sources = b.sources || [];
    const srcHtml = sources
      .map((sid) => {
        const src = ctx.getSource ? ctx.getSource(sid) : null;
        const label = src ? `${src.org}: ${src.title}` : sid;
        const href = src ? src.url : '#';
        return `<a class="src-ref" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;
      })
      .join('');
    const checkedLine = formatCheckedLine(ctx.checked, b.asOf);
    return `<div class="box law" data-blk="${id}">
      <div class="tag">${icon('scale')}מה החוק אומר</div>
      ${boxBody(b)}
      ${srcHtml ? `<div class="src-list">${srcHtml}</div>` : ''}
      ${checkedLine ? `<span class="checked-line">${escapeHtml(checkedLine)}</span>` : ''}
    </div>`;
  }

  function renderListBlock(b, id) {
    const tag = b.ordered ? 'ol' : 'ul';
    const items = (b.items || []).map((it) => `<li>${parseInline(it)}</li>`).join('');
    return `<${tag} class="blk-list" data-blk="${id}">${items}</${tag}>`;
  }

  function renderTable(b, id) {
    const head = (b.head || []).map((h) => `<th>${parseInline(String(h))}</th>`).join('');
    const rows = (b.rows || [])
      .map((r) => `<tr>${r.map((c) => `<td>${parseInline(String(c))}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="table-wrap" data-blk="${id}">
      <table class="blk-table">
        ${b.caption ? `<caption>${parseInline(b.caption)}</caption>` : ''}
        <thead><tr>${head}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${b.note ? `<p class="table-note">${parseInline(b.note)}</p>` : ''}
    </div>`;
  }

  function renderReceipt(b, id) {
    const rows = (b.rows || [])
      .map((r) => `<div class="r-row"><span>${parseInline(r.label)}</span><span class="dots"></span>${moneyHtml(r.amount)}</div>`)
      .join('');
    const total = b.total
      ? `<div class="r-row r-total"><span>${parseInline(b.total.label)}</span><span class="dots"></span>${moneyHtml(b.total.amount)}</div>`
      : '';
    return `<div class="receipt" data-blk="${id}">
      ${b.title ? `<div class="r-title">${parseInline(b.title)}</div>` : ''}
      ${rows}${total}
      ${b.note ? `<p class="r-note">${parseInline(b.note)}</p>` : ''}
    </div>`;
  }

  function renderCompare(b, id) {
    const cols = (b.columns || [])
      .map(
        (c) => `<div class="cmp-col">
          <h5>${parseInline(c.title)}</h5>
          <ul>${(c.points || []).map((p) => `<li>${parseInline(p)}</li>`).join('')}</ul>
        </div>`
      )
      .join('');
    return `<div class="compare cols-${(b.columns || []).length}" data-blk="${id}">${cols}</div>`;
  }

  function renderFlow(b, id) {
    const steps = b.steps || [];
    const parts = steps.map((s, i) => {
      const sub = s.sub ? `<div class="flow-sub">${parseInline(s.sub)}</div>` : '';
      const step = `<div class="flow-step"><div class="flow-label">${parseInline(s.label)}</div>${sub}</div>`;
      const arrow = i < steps.length - 1 ? `<div class="flow-arrow">${icon('left')}</div>` : '';
      return step + arrow;
    });
    return `<div class="flow" data-blk="${id}">${parts.join('')}</div>`;
  }

  function renderCalc(b, id) {
    const inputs = b.inputs || [];
    const ids = inputs.map((i) => i.id);
    const values = {};
    inputs.forEach((i) => {
      values[i.id] = i.value;
    });
    const result = evalFormula(b.formula, ids, values);
    const fieldsHtml = inputs
      .map(
        (inp) => `<label class="calc-field">
          <span class="calc-field-label">${escapeHtml(inp.label)}</span>
          <span class="calc-input-wrap">
            <input type="number" inputmode="decimal" data-calc-input="${escapeHtml(inp.id)}" value="${escapeHtml(inp.value)}">
            ${inp.suffix ? `<span class="suffix">${escapeHtml(inp.suffix)}</span>` : ''}
          </span>
        </label>`
      )
      .join('');
    return `<div class="box calc" data-blk="${id}" data-formula="${escapeHtml(b.formula)}"${b.resultSuffix !== undefined ? ` data-result-suffix="${escapeHtml(b.resultSuffix)}"` : ''}>
      <div class="tag">${icon('chart')}${escapeHtml(b.title || '')}</div>
      <div class="calc-fields">${fieldsHtml}</div>
      <div class="calc-result">
        <span class="calc-result-label">${escapeHtml(b.resultLabel || '')}</span>
        <span class="calc-result-value v" dir="ltr" data-calc-output>${calcResultText(result, b.resultSuffix)}</span>
      </div>
      ${b.explain ? `<p class="calc-explain">${parseInline(b.explain)}</p>` : ''}
    </div>`;
  }

  function renderOne(b) {
    const id = nextId();
    const text = ownText(b);
    if (text) index.push({ id, text });
    switch (b.t) {
      case 'p':
        return `<p data-blk="${id}">${parseInline(b.text)}</p>`;
      case 'section': {
        const heading = SECTION_HEADINGS[b.key] || '';
        return `<section class="lesson-section" data-blk="${id}" data-section="${escapeHtml(b.key)}">
          ${heading ? `<h3 class="section-h">${escapeHtml(heading)}</h3>` : ''}
          ${renderList(b.children)}
        </section>`;
      }
      case 'law':
        return renderLaw(b, id);
      case 'example':
        return `<div class="box example" data-blk="${id}">
          <div class="tag">${icon('bulb')}${escapeHtml(b.title || 'לדוגמה')}</div>
          ${boxBody(b)}
        </div>`;
      case 'recommend':
        return `<div class="box rec" data-blk="${id}">
          <div class="tag">${icon('okc')}מה מומלץ לעשות</div>
          ${boxBody(b)}
        </div>`;
      case 'pro':
        return `<div class="box pro" data-blk="${id}">
          <div class="tag">${icon('pro')}מה צריך לבדוק עם איש מקצוע</div>
          ${boxBody(b)}
        </div>`;
      case 'warn':
        return `<div class="box warn" data-blk="${id}"><p>${parseInline(b.text)}</p></div>`;
      case 'list':
        return renderListBlock(b, id);
      case 'table':
        return renderTable(b, id);
      case 'receipt':
        return renderReceipt(b, id);
      case 'compare':
        return renderCompare(b, id);
      case 'flow':
        return renderFlow(b, id);
      case 'calc':
        return renderCalc(b, id);
      default:
        return '';
    }
  }

  const html = renderList(blocks);
  return { html, index };
}

export function renderBlocks(blocks, ctx) {
  return processBlocks(blocks, ctx).html;
}

export function buildTextIndex(blocks, ctx) {
  return processBlocks(blocks, ctx).index;
}

// ---- videos (auto-rendered section, driven by content.videos, not by a
// manual block in content.lesson) ----

function renderVideoCard(v, i, ctx) {
  const dur = v.duration ? `<span class="v-dur">${escapeHtml(v.duration)}</span>` : '';
  const meta = `<div class="v-meta">${v.channel ? escapeHtml(v.channel) : ''}${v.channel && v.duration ? ' ' : ''}${dur}</div>`;
  if (v.embeddable) {
    return `<div class="video-card video-embed" data-blk="v${i}head" data-video-idx="${i}" data-youtube="${escapeHtml(v.youtubeId || '')}">
      <div class="v-head">
        <div class="v-title">${escapeHtml(v.title)}</div>
        ${meta}
        <p class="v-why">${parseInline(v.why || '')}</p>
        <button type="button" class="btn-secondary v-play">${icon('play')}לצפייה בסרטון</button>
      </div>
      <div class="v-player" hidden></div>
    </div>`;
  }
  const summaryHtml = renderBlocks(v.summary || [], { idPrefix: `v${i}s`, checked: ctx.checked, getSource: ctx.getSource });
  return `<div class="video-card video-local" data-blk="v${i}head" data-video-idx="${i}">
    <div class="v-head">
      <div class="v-title">${escapeHtml(v.title)}</div>
      ${meta}
      <p class="v-why">${parseInline(v.why || '')}</p>
    </div>
    ${summaryHtml ? `<div class="v-summary">${summaryHtml}</div>` : ''}
    <a class="btn-secondary v-backup" href="${escapeHtml(v.url)}" target="_blank" rel="noopener">${icon('external')}פתיחה ביוטיוב (גיבוי)</a>
  </div>`;
}

export function renderVideosSection(videos, ctx = {}) {
  if (!videos || !videos.length) return '';
  const cards = videos.map((v, i) => renderVideoCard(v, i, ctx)).join('');
  return `<section class="lesson-section" data-section="videos">
    <h3 class="section-h">${SECTION_HEADINGS.videos}</h3>
    <div class="video-list">${cards}</div>
  </section>`;
}

// text index entries for the videos section (title + why + summary text),
// used by search.js so video cards are findable too.
export function buildVideosIndex(videos, ctx = {}) {
  if (!videos || !videos.length) return [];
  const entries = [];
  videos.forEach((v, i) => {
    const head = [v.title, v.why].filter(Boolean).map(stripMarkup).join(' ');
    if (head) entries.push({ id: `v${i}head`, text: head });
    if (!v.embeddable && v.summary && v.summary.length) {
      entries.push(...buildTextIndex(v.summary, { idPrefix: `v${i}s`, checked: ctx.checked, getSource: ctx.getSource }));
    }
  });
  return entries;
}

export function wireVideoCards(container) {
  container.querySelectorAll('.video-embed').forEach((card) => {
    const btn = card.querySelector('.v-play');
    const player = card.querySelector('.v-player');
    if (!btn || !player) return;
    btn.addEventListener('click', () => {
      player.hidden = false;
      if (!navigator.onLine) {
        player.innerHTML = `<p class="v-offline">${icon('wifi-off')}צריך אינטרנט כדי לצפות בסרטון.</p>`;
        return;
      }
      const id = card.dataset.youtube;
      player.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}" title="נגן וידאו" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      btn.hidden = true;
    });
  });
}

// wires live recompute for calc blocks and click handlers for term/source
// chips inside a freshly-rendered container. handlers: { onTerm, onSource }
export function wireInteractiveBlocks(container, handlers = {}) {
  container.querySelectorAll('.box.calc').forEach((calcEl) => {
    const formula = calcEl.getAttribute('data-formula');
    const inputs = [...calcEl.querySelectorAll('[data-calc-input]')];
    const resultEl = calcEl.querySelector('[data-calc-output]');
    function recompute() {
      const ids = inputs.map((i) => i.dataset.calcInput);
      const values = {};
      inputs.forEach((i) => {
        values[i.dataset.calcInput] = i.value;
      });
      const result = evalFormula(formula, ids, values);
      const suffix = calcEl.hasAttribute('data-result-suffix') ? calcEl.getAttribute('data-result-suffix') : undefined;
      if (resultEl) resultEl.textContent = calcResultText(result, suffix);
    }
    inputs.forEach((inp) => inp.addEventListener('input', recompute));
  });

  container.querySelectorAll('.term-link').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      handlers.onTerm && handlers.onTerm(el.dataset.term, el);
    });
  });
  container.querySelectorAll('.src-chip').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      handlers.onSource && handlers.onSource(el.dataset.src, el);
    });
  });
}

// scrolls to a data-blk target inside container and briefly flashes it.
export function scrollToBlock(container, blockId) {
  if (!blockId) return;
  const el = container.querySelector(`[data-blk="${CSS.escape(blockId)}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('flash-highlight');
  setTimeout(() => el.classList.remove('flash-highlight'), 1600);
}

export { SECTION_HEADINGS };
