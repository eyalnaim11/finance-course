// js/views/sims.js : #/sims: list of simulations from the registry file
// content/sims/index.js (SPEC-EXTRAS.md §1.3/§2). loadSimsRegistry() already
// try/catches a missing registry and returns [], so an empty list here just
// means "not written yet" and is shown as a quiet empty state.
import { loadSimsRegistry } from '../content-loader.js';
import { escapeHtml } from '../render-blocks.js';
import { icon } from '../icons.js';

export async function render(root, ctx) {
  const { store } = ctx;
  const sims = await loadSimsRegistry();

  function cardHtml(s) {
    const result = store.getSimResult(s.id);
    return `<div class="list-card">
      <div class="list-card-main">
        <div class="list-card-title"><a href="#/sim/${s.id}">${escapeHtml(s.title)}</a></div>
        <div class="list-card-summary">${escapeHtml(s.summary || '')}</div>
        <div class="list-card-meta">${result ? `הכי טוב: ${result.best}/100` : 'עוד לא ניסית'}</div>
      </div>
      ${icon('left')}
    </div>`;
  }

  root.innerHTML = `
    <div class="list-page">
      <h1>סימולציות</h1>
      <p class="list-page-lead">מצב אמיתי שלב אחר שלב. בוחרים מה עושים ורואים מיד אם זו הבחירה הנכונה.</p>
      ${sims.length ? `<div class="list-cards">${sims.map(cardHtml).join('')}</div>` : '<p class="empty-state">הסימולציות בדרך. הן יופיעו כאן ברגע שהן מוכנות.</p>'}
    </div>
  `;
}
