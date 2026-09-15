// js/views/sources.js : #/sources
import { sourcesByOrg, sources } from '../../content/sources.js';
import { FIXTURE_MODE } from '../fixture-mode.js';
import { getLesson, lessonNumber, lessons as courseLessons } from '../../content/course.js';
import { loadLessonContent } from '../content-loader.js';
import { scrollToBlock, escapeHtml } from '../render-blocks.js';
import { icon } from '../icons.js';

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}.${m}.${y}`;
}

async function whichLessonsUse(sourceId) {
  const slugs = [...(FIXTURE_MODE ? ['_fixture'] : []), ...courseLessons.filter((l) => l.status === 'ready').map((l) => l.slug)];
  const uses = [];
  for (const slug of slugs) {
    const content = await loadLessonContent(slug);
    if (content && (content.sources || []).includes(sourceId)) {
      const meta = getLesson(slug);
      uses.push({ slug, title: meta ? meta.title : content.title || slug, num: meta ? lessonNumber(slug) : null });
    }
  }
  return uses;
}

export async function render(root, ctx) {
  const grouped = sourcesByOrg();
  const usageMap = new Map();
  for (const s of sources) usageMap.set(s.id, await whichLessonsUse(s.id));

  const groupsHtml = [...grouped.entries()]
    .map(([org, items]) => {
      const cards = items
        .map((s) => {
          const uses = usageMap.get(s.id) || [];
          return `<div class="source-card" data-blk="src-${s.id}">
            <div class="s-title">${escapeHtml(s.title)}</div>
            <div class="s-meta">עודכן ${formatDate(s.publishedDate)} | נבדק ${formatDate(s.checked)}</div>
            <a class="s-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${icon('external', 'sm')}לעמוד המקור</a>
            ${uses.length ? `<div class="s-lessons">מופיע ב: ${uses.map((u) => `<a href="#/lesson/${u.slug}/learn">${u.num ? `${u.num}. ` : ''}${escapeHtml(u.title)}</a>`).join(', ')}</div>` : ''}
          </div>`;
        })
        .join('');
      return `<div class="org-group"><h2>${escapeHtml(org)}</h2>${cards}</div>`;
    })
    .join('');

  root.innerHTML = `
    <div class="sources-page">
      <h1>מקורות</h1>
      ${groupsHtml || '<p class="empty-state">עוד אין מקורות רשומים.</p>'}
    </div>
  `;

  const pending = ctx.consumePendingHighlight();
  if (pending && pending.type === 'block' && pending.blockId) {
    requestAnimationFrame(() => scrollToBlock(root, pending.blockId));
  }
}
