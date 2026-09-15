// js/views/home.js : #/
import { parts, lessons, lessonNumber, lessonsInPart, readyLessons, pilotLessons } from '../../content/course.js';
import { icon } from '../icons.js';
import { escapeHtml } from '../render-blocks.js';

function pickStartLesson(state) {
  const ready = readyLessons();
  if (!ready.length) return null;
  if (state.last && state.last.slug) {
    const meta = ready.find((l) => l.slug === state.last.slug);
    const lp = state.lessons[state.last.slug];
    if (meta && (!lp || !lp.completedAt)) {
      return { meta, stage: (state.last.stage) || 'start', continuing: true };
    }
  }
  const next = ready.find((l) => !(state.lessons[l.slug] && state.lessons[l.slug].completedAt)) || ready[0];
  return { meta: next, stage: 'start', continuing: false };
}

export function render(root, ctx) {
  const { store } = ctx;
  const state = store.getState();
  const total = lessons.length;
  const completed = store.completedCount();
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const startInfo = pickStartLesson(state);
  const pilots = pilotLessons();

  const pilotRows = pilots
    .map((l) => {
      const num = lessonNumber(l.slug);
      const ready = l.status === 'ready';
      return `<div class="urgent-row">
        <span class="num">${num}</span>
        ${ready ? `<a href="#/lesson/${l.slug}/start">${escapeHtml(l.title)}</a>` : `<span>${escapeHtml(l.title)}</span>`}
        ${ready ? '' : '<span class="soon-tag">בקרוב</span>'}
      </div>`;
    })
    .join('');

  const tocRows = parts
    .map((p) => {
      const partLessons = lessonsInPart(p.key);
      const rows = partLessons
        .map((l) => {
          const num = lessonNumber(l.slug);
          const lp = state.lessons[l.slug];
          const done = !!(lp && lp.completedAt);
          const ready = l.status === 'ready';
          return `<div class="lesson-row ${done ? 'done' : ''}">
            <span class="num">${done ? icon('check', 'sm') : num}</span>
            ${ready ? `<a href="#/lesson/${l.slug}/start">${escapeHtml(l.title)}</a>` : `<span>${escapeHtml(l.title)}</span>`}
            ${ready ? '' : '<span class="soon-tag">בקרוב</span>'}
          </div>`;
        })
        .join('');
      return `<button type="button" class="toc-row" data-part="${p.key}" aria-expanded="false" aria-controls="toc-${p.key}">
          <span class="l">${p.letter}</span>${escapeHtml(p.name)}<span class="lead-dots"></span>
          <span class="c">${partLessons.length} שיעורים</span>${icon('chevron-down', 'chev sm')}
        </button>
        <div class="toc-lessons" id="toc-${p.key}" hidden>${rows}</div>`;
    })
    .join('');

  root.innerHTML = `
    <div class="home">
      <div>
        <h1>כסף, בנק, עבודה, מסים ודרופשיפינג<em>מגיל 16</em></h1>
        <p class="lead">${total} שיעורים. אפשר ללמוד לפי הסדר או לקפוץ ישר לנושא שבוער לך.</p>
        <div class="prog"><b>${completed}/${total}</b><span>שיעורים</span><div class="bar"><i style="width:${pct}%"></i></div></div>
        ${
          startInfo
            ? `<div class="start-card">
                <div class="n">${lessonNumber(startInfo.meta.slug)}</div>
                <div><h3>${escapeHtml(startInfo.meta.title)}</h3><p>${startInfo.continuing ? 'ממשיכים מאיפה שעצרת.' : 'מתחילים כאן.'}</p></div>
                <a class="btn" href="#/lesson/${startInfo.meta.slug}/${startInfo.stage}">${startInfo.continuing ? 'ממשיכים' : 'מתחילים'}</a>
              </div>`
            : `<div class="start-card empty">
                <div><h3>השיעורים בדרך</h3><p>ברגע שהם מוכנים, אפשר להתחיל כאן.</p></div>
              </div>`
        }
        ${
          pilotRows
            ? `<div class="urgent">
                <strong>פתחת עוסק פטור? מה עושים עכשיו</strong>
                <div class="urgent-list">${pilotRows}</div>
              </div>`
            : ''
        }
      </div>
      <div class="toc">
        <h2 class="serif">תוכן העניינים</h2>
        ${tocRows}
      </div>
    </div>
  `;

  root.querySelectorAll('.toc-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.part;
      const panel = root.querySelector(`#toc-${key}`);
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      btn.setAttribute('aria-expanded', String(willOpen));
    });
  });
}
