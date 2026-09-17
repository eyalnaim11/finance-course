// js/views/tests.js : #/tests: list of the 8 part tests + the final exam
// (SPEC-EXTRAS.md §2). Each part test is content/tests/part-<key>.js, one per
// content/course.js part key; the final exam is content/tests/final.js. Both
// are written independently by content writers, so every import here is
// wrapped (via loadTest, which itself try/catches) and a missing file just
// shows "בקרוב" instead of breaking the list.
import { parts } from '../../content/course.js';
import { loadTest } from '../content-loader.js';
import { escapeHtml } from '../render-blocks.js';
import { icon } from '../icons.js';

function scoreLabel(id, isFinal, result) {
  if (!result) return 'עוד לא נבחן';
  return isFinal ? `הכי טוב: ${result.best}/100` : `הכי טוב: ${result.best}`;
}

export async function render(root, ctx) {
  const { store } = ctx;

  const partRows = await Promise.all(
    parts.map(async (p) => {
      const id = `part-${p.key}`;
      const content = await loadTest(id);
      return { id, part: p, content };
    })
  );
  const finalContent = await loadTest('final');

  function rowHtml({ id, part, content }) {
    const ready = !!content;
    const result = store.getTestResult(id);
    return `<div class="list-card ${ready ? '' : 'soon'}">
      <div class="list-card-main">
        <div class="list-card-title">${ready ? `<a href="#/test/${id}">${escapeHtml(content.title)}</a>` : `<span>מבחן חלק ${escapeHtml(part.letter)}: ${escapeHtml(part.name)}</span>`}</div>
        <div class="list-card-meta">${ready ? scoreLabel(id, false, result) : 'בקרוב'}</div>
      </div>
      ${ready ? icon('left') : ''}
    </div>`;
  }

  function finalRowHtml() {
    const ready = !!finalContent;
    const result = store.getTestResult('final');
    return `<div class="list-card final ${ready ? '' : 'soon'}">
      <div class="list-card-main">
        <div class="list-card-title">${ready ? `<a href="#/test/final">${escapeHtml(finalContent.title)}</a>` : '<span>המבחן המסכם</span>'}</div>
        <div class="list-card-meta">${ready ? scoreLabel('final', true, result) : 'בקרוב'}</div>
      </div>
      ${ready ? icon('left') : ''}
    </div>`;
  }

  root.innerHTML = `
    <div class="list-page">
      <h1>מבחנים</h1>
      <p class="list-page-lead">מבחן לכל חלק בקורס. אחרי שעברת כמה חלקים אפשר לנסות גם את המבחן המסכם.</p>
      <div class="list-cards">${partRows.map(rowHtml).join('')}</div>
      <h2 class="serif list-subhead">המבחן המסכם</h2>
      <div class="list-cards">${finalRowHtml()}</div>
    </div>
  `;
}
