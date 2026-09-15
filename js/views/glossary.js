// js/views/glossary.js : #/glossary
import { glossarySorted } from '../../content/glossary.js';
import { getLesson, lessonNumber } from '../../content/course.js';
import { scrollToBlock, escapeHtml } from '../render-blocks.js';
import { termHeading } from '../popover.js';
import { FIXTURE_MODE } from '../fixture-mode.js';

function lessonLinks(termLessonSlugs) {
  return (termLessonSlugs || [])
    .filter((slug) => FIXTURE_MODE || slug !== '_fixture')
    .map((slug) => {
      const meta = getLesson(slug);
      const title = meta ? meta.title : slug === '_fixture' ? 'שיעור בדיקה' : slug;
      const num = meta ? lessonNumber(slug) : null;
      return `<a class="term-lesson-link" href="#/lesson/${slug}/learn">${num ? `${num}. ` : ''}${escapeHtml(title)}</a>`;
    })
    .join('');
}

function termCardHtml(t) {
  return `<div class="term-card" data-blk="term-${t.id}" data-name="${escapeHtml(t.he)}">
    <h3 class="term-name">${termHeading(t)}</h3>
    ${t.example ? `<p class="term-example"><strong>לדוגמה:</strong> ${escapeHtml(t.example)}</p>` : ''}
    <p class="term-explain">${escapeHtml(t.explain)}</p>
    ${t.life ? `<p class="term-life"><strong>איפה זה מופיע בחיים:</strong> ${escapeHtml(t.life)}</p>` : ''}
    ${t.lessons && t.lessons.length ? `<div class="term-lessons">${lessonLinks(t.lessons)}</div>` : ''}
  </div>`;
}

export function render(root, ctx) {
  const all = glossarySorted();

  root.innerHTML = `
    <div class="glossary-page">
      <h1>מילון מושגים</h1>
      <label class="sr-only" for="glossary-filter">סינון מושגים</label>
      <input type="search" id="glossary-filter" class="glossary-filter" placeholder="לחפש מושג">
      <div class="glossary-list" id="glossary-list">
        ${all.map(termCardHtml).join('') || '<p class="empty-state">עוד אין מושגים במילון.</p>'}
      </div>
    </div>
  `;

  const filterInput = root.querySelector('#glossary-filter');
  const listEl = root.querySelector('#glossary-list');
  filterInput.addEventListener('input', () => {
    const q = filterInput.value.trim();
    const filtered = q ? all.filter((t) => t.he.includes(q) || (t.en && t.en.toLowerCase().includes(q.toLowerCase()))) : all;
    listEl.innerHTML = filtered.map(termCardHtml).join('') || `<p class="empty-state">אין מושג בשם "${escapeHtml(q)}".</p>`;
  });

  const pending = ctx.consumePendingHighlight();
  if (pending && pending.type === 'block' && pending.blockId) {
    requestAnimationFrame(() => scrollToBlock(root, pending.blockId));
  }
}
