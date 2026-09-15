// js/views/search.js : #/search?q=
import { search, debounce } from '../search.js';
import { icon } from '../icons.js';
import { escapeHtml } from '../render-blocks.js';

const STAGE_LABELS = { start: 'מתחילים', learn: 'השיעור', practice: 'תרגול', quiz: 'מבחן', finish: 'סיום שיעור' };

function resultHref(r) {
  if (r.type === 'lesson') return `#/lesson/${r.slug}/${r.stage}`;
  if (r.type === 'glossary') return '#/glossary';
  if (r.type === 'source') return '#/sources';
  return '#/';
}

function groupResults(results) {
  const groups = new Map();
  for (const r of results) {
    const key = r.type === 'lesson' ? `lesson:${r.slug}` : r.type;
    if (!groups.has(key)) {
      groups.set(key, {
        title: r.type === 'lesson' ? r.title : r.type === 'glossary' ? 'מילון מושגים' : 'מקורות',
        items: [],
      });
    }
    groups.get(key).items.push(r);
  }
  return [...groups.values()];
}

export async function render(root, ctx, params) {
  const q = (params.query && params.query.q) || '';

  root.innerHTML = `
    <div class="search-page">
      <h1>חיפוש</h1>
      <div class="search-input-big-wrap">
        ${icon('search')}
        <input type="search" class="search-input-big" id="search-input" placeholder="לדוגמה: מע״מ, תלוש, חשבונית" value="${escapeHtml(q)}">
      </div>
      <div id="search-results"></div>
    </div>
  `;

  const input = root.querySelector('#search-input');
  const resultsEl = root.querySelector('#search-results');

  async function runSearch(value) {
    const trimmed = value.trim();
    history.replaceState(null, '', `#/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ''}`);
    if (!trimmed) {
      resultsEl.innerHTML = `<p class="search-empty">אפשר לחפש נושא, מילה או מושג מכל הקורס.</p>`;
      return;
    }
    const results = await search(trimmed);
    if (!results.length) {
      resultsEl.innerHTML = `<p class="search-empty">לא מצאנו כלום על "${escapeHtml(trimmed)}". אפשר לנסות מילה אחרת.</p>`;
      return;
    }
    const groups = groupResults(results);
    resultsEl.innerHTML = groups
      .map(
        (g) => `<div class="search-group">
          <p class="search-group-title">${escapeHtml(g.title)}</p>
          ${g.items
            .map(
              (r) => `<button type="button" class="search-result" data-href="${escapeHtml(resultHref(r))}" data-type="${r.type}" data-slug="${r.slug || ''}" data-stage="${r.stage || ''}" data-block="${r.blockId || r.id || ''}">
                ${r.type === 'lesson' ? `<div class="sr-stage">${STAGE_LABELS[r.stage] || ''}</div>` : ''}
                <div class="sr-snippet">${r.snippet}</div>
              </button>`
            )
            .join('')}
        </div>`
      )
      .join('');

    resultsEl.querySelectorAll('.search-result').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        if (type === 'lesson') {
          ctx.setPendingHighlight({ type: 'lesson', slug: btn.dataset.slug, stage: btn.dataset.stage, blockId: btn.dataset.block || null });
        } else if (type === 'glossary') {
          ctx.setPendingHighlight({ type: 'block', blockId: `term-${btn.dataset.block}` });
        } else if (type === 'source') {
          ctx.setPendingHighlight({ type: 'block', blockId: `src-${btn.dataset.block}` });
        }
        ctx.navigate(btn.dataset.href);
      });
    });
  }

  const debounced = debounce((val) => runSearch(val), 220);
  input.addEventListener('input', () => debounced(input.value));
  input.focus();
  if (q) runSearch(q);
  else resultsEl.innerHTML = `<p class="search-empty">אפשר לחפש נושא, מילה או מושג מכל הקורס.</p>`;
}
