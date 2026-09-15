// js/popover.js : small floating popover for [[term]] links and {{src:id}}
// chips inside lesson prose (SPEC.md §5: "[[term]] links inside lessons open
// a small popover").
import { getTerm } from '../content/glossary.js';
import { getSource } from '../content/sources.js';
import { icon } from './icons.js';
import { escapeHtml } from './render-blocks.js';

let popEl = null;
let wired = false;

function ensurePop() {
  if (!popEl) {
    popEl = document.createElement('div');
    popEl.className = 'popover';
    popEl.hidden = true;
    popEl.setAttribute('role', 'dialog');
    popEl.setAttribute('aria-modal', 'false');
    document.body.appendChild(popEl);
  }
  if (!wired) {
    wired = true;
    document.addEventListener('click', (e) => {
      if (popEl.hidden) return;
      if (popEl.contains(e.target)) return;
      if (e.target.closest && e.target.closest('.term-link, .src-chip')) return;
      closePopover();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopover();
    });
    window.addEventListener('hashchange', closePopover);
  }
  return popEl;
}

export function closePopover() {
  if (popEl) popEl.hidden = true;
}

function position(anchor) {
  const rect = anchor.getBoundingClientRect();
  const el = popEl;
  el.hidden = false;
  const pw = el.offsetWidth || 280;
  let left = rect.left;
  if (left + pw > window.innerWidth - 12) left = window.innerWidth - pw - 12;
  if (left < 12) left = 12;
  let top = rect.bottom + 8;
  const ph = el.offsetHeight || 120;
  if (top + ph > window.innerHeight - 12) top = Math.max(12, rect.top - ph - 8);
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

// glossary display style (SPEC.md §5): English first then Hebrew, pipe
// separated, no em dash: "Chargeback | חיוב חוזר".
export function termHeading(term) {
  return term.en ? `${escapeHtml(term.en)} | ${escapeHtml(term.he)}` : escapeHtml(term.he);
}

export function openTermPopover(termId, anchor) {
  const el = ensurePop();
  const term = getTerm(termId);
  el.innerHTML = term
    ? `<button type="button" class="pop-close" aria-label="סגירה">${icon('x', 'sm')}</button>
       <h4>${termHeading(term)}</h4>
       <p>${escapeHtml(term.explain)}</p>
       <a class="pop-link" href="#/glossary">לכל המילון</a>`
    : `<button type="button" class="pop-close" aria-label="סגירה">${icon('x', 'sm')}</button><p>המושג לא נמצא.</p>`;
  el.querySelector('.pop-close').addEventListener('click', closePopover);
  position(anchor);
}

export function openSourcePopover(sourceId, anchor) {
  const el = ensurePop();
  const src = getSource(sourceId);
  el.innerHTML = src
    ? `<button type="button" class="pop-close" aria-label="סגירה">${icon('x', 'sm')}</button>
       <h4>${escapeHtml(src.org)}</h4>
       <p>${escapeHtml(src.title)}</p>
       <a class="pop-link" href="${escapeHtml(src.url)}" target="_blank" rel="noopener">לעמוד המקור</a>`
    : `<button type="button" class="pop-close" aria-label="סגירה">${icon('x', 'sm')}</button><p>המקור לא נמצא.</p>`;
  el.querySelector('.pop-close').addEventListener('click', closePopover);
  position(anchor);
}
