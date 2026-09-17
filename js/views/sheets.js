// js/views/sheets.js : #/sheets: list of printable sheets from
// content/sheets.js (SPEC-EXTRAS.md §1.4/§2). loadSheetsRegistry() already
// try/catches a missing file and returns [], shown here as a quiet empty
// state ("not written yet").
import { loadSheetsRegistry } from '../content-loader.js';
import { escapeHtml } from '../render-blocks.js';
import { icon } from '../icons.js';

export async function render(root, ctx) {
  const sheets = await loadSheetsRegistry();

  function cardHtml(s) {
    return `<div class="list-card">
      <div class="list-card-main">
        <div class="list-card-title"><a href="#/sheet/${s.id}">${escapeHtml(s.title)}</a></div>
        <div class="list-card-summary">${escapeHtml(s.summary || '')}</div>
      </div>
      ${icon('left')}
    </div>`;
  }

  root.innerHTML = `
    <div class="list-page">
      <h1>דפי עזר</h1>
      <p class="list-page-lead">דפים להדפסה ולמילוי ביד: תקציב, מעקב הוצאות, רשימות בדיקה.</p>
      ${sheets.length ? `<div class="list-cards">${sheets.map(cardHtml).join('')}</div>` : '<p class="empty-state">דפי העזר בדרך. הם יופיעו כאן ברגע שהם מוכנים.</p>'}
    </div>
  `;
}
