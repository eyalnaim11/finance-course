// js/views/sheet.js : #/sheet/<id>: one printable sheet, rendered with the
// same §4 block renderer as a lesson (SPEC-EXTRAS.md §1.4/§2). The sheet's
// blocks are inline in content/sheets.js (no per-id file), so the id is
// found inside the registry list that loadSheetsRegistry() already loads.
import { loadSheetsRegistry } from '../content-loader.js';
import { getSource } from '../../content/sources.js';
import { renderBlocks, wireInteractiveBlocks, escapeHtml } from '../render-blocks.js';
import { openTermPopover, openSourcePopover } from '../popover.js';
import { icon } from '../icons.js';

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}.${m}.${y}`;
}

function popoverHandlers() {
  return {
    onTerm: (id, anchor) => openTermPopover(id, anchor),
    onSource: (id, anchor) => openSourcePopover(id, anchor),
  };
}

export async function render(root, ctx, { id }) {
  const sheets = await loadSheetsRegistry();
  const sheet = sheets.find((s) => s.id === id);

  if (!sheet) {
    root.innerHTML = `<div class="page"><p class="empty-state">דף העזר הזה עוד לא מוכן. הוא יופיע כאן ברגע שהוא יהיה מוכן.</p><a class="btn" href="#/sheets">חזרה לרשימת דפי העזר</a></div>`;
    return;
  }

  root.innerHTML = `
    <div class="page sheet-print-page">
      <div class="sheet-print-bar no-print">
        <a class="back-link" href="#/sheets">${icon('right', 'sm')}כל דפי העזר</a>
        <button type="button" class="btn-outline" id="print-btn">${icon('doc', 'sm')}הדפסה</button>
      </div>
      <h1 class="lesson-title">${escapeHtml(sheet.title)}</h1>
      ${sheet.checked ? `<p class="checked-tag">נכון ל-${sheet.checked.split('-')[0]} | נבדק ${formatDate(sheet.checked)}</p>` : ''}
      <div class="sheet"><div class="sheet-full">${renderBlocks(sheet.blocks || [], { idPrefix: 'sh', checked: sheet.checked, getSource })}</div></div>
    </div>
  `;

  wireInteractiveBlocks(root, popoverHandlers());
  root.querySelector('#print-btn').addEventListener('click', () => window.print());
}
