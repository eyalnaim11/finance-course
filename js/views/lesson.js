// js/views/lesson.js : #/lesson/<slug>/<stage>
import { getLesson, lessonNumber, lessonsInPart, getPart, lessons, readyLessons } from '../../content/course.js';
import { getSource } from '../../content/sources.js';
import { loadLessonContent } from '../content-loader.js';
import {
  renderBlocks,
  renderVideosSection,
  wireInteractiveBlocks,
  wireVideoCards,
  scrollToBlock,
  escapeHtml,
  parseInline,
} from '../render-blocks.js';
import { icon } from '../icons.js';
import { openTermPopover, openSourcePopover } from '../popover.js';

const STAGES = [
  { key: 'start', label: 'מתחילים' },
  { key: 'learn', label: 'השיעור' },
  { key: 'practice', label: 'תרגול' },
  { key: 'quiz', label: 'מבחן' },
  { key: 'finish', label: 'סיום שיעור' },
];

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

function renderSideInner(part, partLessons, currentSlug, state) {
  const rows = partLessons
    .map((l) => {
      const num = lessonNumber(l.slug);
      const lp = state.lessons[l.slug];
      const done = !!(lp && lp.completedAt);
      const isNow = l.slug === currentSlug;
      const ready = l.status === 'ready';
      const cls = `sl ${done ? 'done' : ''} ${isNow ? 'now' : ''} ${!ready ? 'soon' : ''}`.trim();
      const inner = `<span class="ck">${done ? icon('check') : ''}</span>${num}. ${escapeHtml(l.title)}`;
      if (ready) return `<a class="${cls}" href="#/lesson/${l.slug}/start">${inner}</a>`;
      return `<span class="${cls}">${inner}<span class="soon-tag">בקרוב</span></span>`;
    })
    .join('');
  return `<div class="part">חלק ${escapeHtml(part.letter)}</div><h4>${escapeHtml(part.name)}</h4>${rows}`;
}

function renderStart(root, content) {
  const intro = content.intro || {};
  root.innerHTML = `
    <div class="sheet">
      <div>
        <p class="goal">${escapeHtml(intro.goal || '')}</p>
        <p>${parseInline(intro.whyYou || '')}</p>
        ${
          content.legalTopic
            ? `<div class="disclaimer">${icon('scale')}<span>המידע מיועד ללמידה ואינו תחליף לייעוץ מקצועי. חוקים, תקרות ושיעורים עשויים להשתנות.</span></div>`
            : ''
        }
        <div class="will-know">
          <h5>בסוף השיעור תדעו</h5>
          <ul>${(intro.youWillKnow || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('')}</ul>
        </div>
        <button type="button" class="btn" data-go="learn">מתחילים את השיעור</button>
      </div>
    </div>
  `;
}

function renderLearn(root, content) {
  const lessonHtml = renderBlocks(content.lesson || [], { idPrefix: 'b', checked: content.checked, getSource });
  const videosHtml = renderVideosSection(content.videos || [], { checked: content.checked, getSource });
  root.innerHTML = `<div class="sheet"><div class="sheet-full">${lessonHtml}${videosHtml}</div></div>`;
  wireInteractiveBlocks(root, popoverHandlers());
  wireVideoCards(root);
}

function renderPracticeBlock(key, block, savedText) {
  if (!block) return '';
  const title = key === 'exercise' ? block.title || 'תרגיל' : 'שאלת חשיבה';
  const promptHtml = renderBlocks(block.prompt || [], { idPrefix: key === 'exercise' ? 'ep' : 'tp' });
  const solutionHtml = renderBlocks(block.solution || [], { idPrefix: key === 'exercise' ? 'es' : 'ts' });
  return `
    <div class="practice-block" data-practice="${key}">
      <h3>${escapeHtml(title)}</h3>
      <div class="practice-prompt">${promptHtml}</div>
      <label class="sr-only" for="answer-${key}">התשובה שלך</label>
      <textarea id="answer-${key}" class="practice-answer" placeholder="אפשר לכתוב כאן את התשובה">${escapeHtml(savedText || '')}</textarea>
      ${block.hint ? `<p class="practice-hint">רמז: ${escapeHtml(block.hint)}</p>` : ''}
      <div class="practice-actions">
        <button type="button" class="btn-secondary try-btn">ניסיתי. תראה לי</button>
        <button type="button" class="btn-outline show-solution" disabled>הראה פתרון</button>
      </div>
      <div class="practice-solution" hidden>
        <h4>הפתרון</h4>
        ${solutionHtml}
      </div>
    </div>
  `;
}

function renderPractice(root, content, slug, store) {
  const practice = content.practice || {};
  const lp = store.getLessonProgress(slug);
  root.innerHTML = `<div class="sheet"><div class="sheet-full">
    ${renderPracticeBlock('exercise', practice.exercise, lp.practiceText.exercise)}
    ${renderPracticeBlock('thinking', practice.thinking, lp.practiceText.thinking)}
  </div></div>`;
  wireInteractiveBlocks(root, popoverHandlers());

  ['exercise', 'thinking'].forEach((key) => {
    const block = practice[key];
    if (!block) return;
    const wrap = root.querySelector(`[data-practice="${key}"]`);
    const textarea = wrap.querySelector('.practice-answer');
    const tryBtn = wrap.querySelector('.try-btn');
    const showBtn = wrap.querySelector('.show-solution');
    const solutionEl = wrap.querySelector('.practice-solution');

    function checkEnable() {
      const hasText = textarea && textarea.value.trim().length > 0;
      showBtn.disabled = !(hasText || wrap.dataset.tried === '1');
    }
    if (textarea) {
      textarea.addEventListener('input', () => {
        store.savePracticeText(slug, key, textarea.value);
        checkEnable();
      });
    }
    tryBtn.addEventListener('click', () => {
      wrap.dataset.tried = '1';
      checkEnable();
    });
    showBtn.addEventListener('click', () => {
      solutionEl.hidden = false;
      showBtn.hidden = true;
    });
    checkEnable();
  });
}

function renderQuiz(root, content, slug, store) {
  const quiz = content.quiz || [];
  const questionsHtml = quiz
    .map(
      (q, i) => `
    <fieldset class="quiz-q" data-q="${i}" data-correct="${q.correct}">
      <legend>${i + 1}. ${escapeHtml(q.q)}</legend>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, oi) => `<label class="opt">
              <input type="radio" name="quiz-q${i}" value="${oi}">
              <span class="dot"></span>
              <span class="opt-text">${escapeHtml(opt)}</span>
            </label>`
          )
          .join('')}
      </div>
      <div class="quiz-feedback"></div>
    </fieldset>`
    )
    .join('');

  root.innerHTML = `
    <div class="sheet">
      <div class="sheet-full quiz" id="quiz-root">
        <div class="quiz-summary" id="quiz-summary" hidden>
          <p class="quiz-score" id="quiz-score-num">0/${quiz.length}</p>
          <p>ככה הלך לך</p>
          <button type="button" class="btn-outline" id="retry-btn">לנסות שוב</button>
        </div>
        ${questionsHtml}
        <button type="button" class="quiz-check" id="quiz-check-btn" disabled>סיימתי. תבדוק</button>
      </div>
    </div>
  `;

  const quizRoot = root.querySelector('#quiz-root');
  const checkBtn = root.querySelector('#quiz-check-btn');
  const fieldsets = [...root.querySelectorAll('.quiz-q')];

  function allAnswered() {
    return fieldsets.every((fs) => fs.querySelector('input[type="radio"]:checked'));
  }
  function updateCheckBtn() {
    checkBtn.disabled = !allAnswered();
  }
  fieldsets.forEach((fs) => fs.addEventListener('change', updateCheckBtn));

  checkBtn.addEventListener('click', () => {
    let correctCount = 0;
    const answers = [];
    fieldsets.forEach((fs, i) => {
      const correctIdx = Number(fs.dataset.correct);
      const checkedInput = fs.querySelector('input[type="radio"]:checked');
      const chosenIdx = checkedInput ? Number(checkedInput.value) : -1;
      answers.push(chosenIdx);
      const isCorrect = chosenIdx === correctIdx;
      if (isCorrect) correctCount++;
      [...fs.querySelectorAll('.opt')].forEach((optEl, oi) => {
        optEl.classList.toggle('correct', oi === correctIdx);
        optEl.classList.toggle('wrong-pick', oi === chosenIdx && !isCorrect);
      });
      const fb = fs.querySelector('.quiz-feedback');
      fb.textContent = quiz[i].explain || '';
      fb.classList.toggle('is-wrong', !isCorrect);
    });
    quizRoot.classList.add('checked');
    checkBtn.hidden = true;
    root.querySelector('#quiz-summary').hidden = false;
    root.querySelector('#quiz-score-num').textContent = `${correctCount}/${quiz.length}`;
    store.saveQuizResult(slug, correctCount, answers);
  });

  root.querySelector('#retry-btn').addEventListener('click', () => {
    quizRoot.classList.remove('checked');
    root.querySelector('#quiz-summary').hidden = true;
    checkBtn.hidden = false;
    fieldsets.forEach((fs) => {
      fs.querySelectorAll('input[type="radio"]').forEach((r) => {
        r.checked = false;
      });
      fs.querySelectorAll('.opt').forEach((o) => o.classList.remove('correct', 'wrong-pick'));
      fs.querySelector('.quiz-feedback').textContent = '';
    });
    updateCheckBtn();
  });

  updateCheckBtn();
}

function renderFinish(root, content, slug, store) {
  const finish = content.finish || {};
  const lp = store.getLessonProgress(slug);
  const remember = (finish.remember || []).map((t) => `<li>${escapeHtml(t)}</li>`).join('');
  const task = finish.realTask || {};
  const steps = (task.steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  const sourcesHtml = (content.sources || [])
    .map((sid) => {
      const s = getSource(sid);
      if (!s) return '';
      return `<div class="source-item">
        <div class="s-org">${escapeHtml(s.org)}</div>
        <div>${escapeHtml(s.title)}</div>
        <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${icon('external', 'sm')}לעמוד המקור</a>
      </div>`;
    })
    .join('');

  root.innerHTML = `
    <div class="sheet">
      <div class="sheet-full">
        <ul class="remember-list">${remember}</ul>
        <div class="real-task">
          <h3>${escapeHtml(task.title || 'המשימה האמיתית שלך')}</h3>
          <ol>${steps}</ol>
          <label class="task-check">
            <input type="checkbox" id="task-done-check" ${lp.taskDone ? 'checked' : ''}>
            עשיתי את זה
          </label>
        </div>
        ${sourcesHtml ? `<div class="finish-sources"><h3>מקורות לשיעור</h3>${sourcesHtml}</div>` : ''}
        <button type="button" class="btn" id="finish-btn" ${lp.completedAt ? 'disabled' : ''}>${lp.completedAt ? 'השיעור הושלם' : 'סיימתי את השיעור'}</button>
        <div id="finish-next"></div>
      </div>
    </div>
  `;

  root.querySelector('#task-done-check').addEventListener('change', (e) => {
    store.setTaskDone(slug, e.target.checked);
  });

  root.querySelector('#finish-btn').addEventListener('click', (e) => {
    store.completeLesson(slug);
    e.target.disabled = true;
    e.target.textContent = 'השיעור הושלם';
    const ready = readyLessons();
    const myNum = lessonNumber(slug);
    const nextReady = ready.find((l) => lessonNumber(l.slug) > myNum);
    const nextEl = root.querySelector('#finish-next');
    nextEl.innerHTML = nextReady
      ? `<p class="practice-hint">השיעור הבא: <a href="#/lesson/${nextReady.slug}/start">${escapeHtml(nextReady.title)}</a></p>`
      : `<p class="practice-hint">זה השיעור המוכן האחרון כרגע.</p>`;
  });
}

function renderNav(container, { slug, stage, num, ctx, sideInnerHtml }) {
  const stageIdx = STAGES.findIndex((s) => s.key === stage);
  const prevStage = stageIdx > 0 ? STAGES[stageIdx - 1] : null;
  const nextStage = stageIdx < STAGES.length - 1 ? STAGES[stageIdx + 1] : null;

  const ready = readyLessons();
  const curIdx = ready.findIndex((l) => l.slug === slug);
  const prevLesson = curIdx > 0 ? ready[curIdx - 1] : null;
  const nextLesson = curIdx !== -1 && curIdx < ready.length - 1 ? ready[curIdx + 1] : null;

  const prevHref = prevStage ? `#/lesson/${slug}/${prevStage.key}` : prevLesson ? `#/lesson/${prevLesson.slug}/finish` : null;
  const nextHref = nextStage ? `#/lesson/${slug}/${nextStage.key}` : nextLesson ? `#/lesson/${nextLesson.slug}/start` : null;

  const total = lessons.length;
  container.innerHTML = `
    <a class="nb" href="#/">${icon('home')}בית</a>
    ${prevHref ? `<a class="nb" href="${prevHref}">${icon('right')}הקודם</a>` : `<button type="button" class="nb" disabled>${icon('right')}הקודם</button>`}
    ${sideInnerHtml ? `<button type="button" class="nb" id="lesson-menu-btn">${icon('menu')}תפריט</button>` : ''}
    <a class="nb" href="#/sources">${icon('book')}מקורות</a>
    ${num ? `<span class="nav-progress">שיעור ${num} מתוך ${total}<span class="bar"><i style="width:${Math.round((num / total) * 100)}%"></i></span></span>` : ''}
    ${nextHref ? `<a class="nb next" href="${nextHref}">הבא${icon('left')}</a>` : `<button type="button" class="nb next" disabled>הבא${icon('left')}</button>`}
  `;
  const menuBtn = container.querySelector('#lesson-menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', () => ctx.openDrawer(sideInnerHtml));
}

export async function render(root, ctx, params) {
  const { store } = ctx;
  const slug = params.slug;
  const stage = STAGES.some((s) => s.key === params.stage) ? params.stage : 'start';
  const isFixture = slug === '_fixture';
  const meta = getLesson(slug);

  if (!meta && !isFixture) {
    root.innerHTML = `<div class="page"><p class="empty-state">השיעור לא נמצא.</p><a class="btn" href="#/">חזרה לדף הבית</a></div>`;
    return;
  }
  if (meta && meta.status !== 'ready') {
    root.innerHTML = `<div class="page"><p class="empty-state">השיעור הזה עוד לא מוכן. הוא יופיע כאן ברגע שהוא יהיה מוכן.</p><a class="btn" href="#/">חזרה לדף הבית</a></div>`;
    return;
  }

  const content = await loadLessonContent(slug);
  if (!content) {
    root.innerHTML = `<div class="page"><p class="empty-state">לא הצלחנו לטעון את השיעור.</p><a class="btn" href="#/">חזרה לדף הבית</a></div>`;
    return;
  }

  const title = meta ? meta.title : content.title || slug;
  const num = meta ? lessonNumber(slug) : null;
  const part = meta ? getPart(meta.part) : null;
  const partLessons = meta ? lessonsInPart(meta.part) : [];

  store.setLast(slug, stage);

  const state = store.getState();
  const sideInnerHtml = part ? renderSideInner(part, partLessons, slug, state) : '';

  const stepsHtml = STAGES.map((s) => {
    const lp = store.getLessonProgress(slug);
    const done = lp.stages[s.key];
    const cls = s.key === stage ? 'on' : done ? 'ok' : '';
    return `<a class="step ${cls}" href="#/lesson/${slug}/${s.key}">${s.label}</a>`;
  }).join('');

  root.innerHTML = `
    <div class="lesson-shell ${sideInnerHtml ? 'with-side' : ''}">
      ${sideInnerHtml ? `<aside class="side">${sideInnerHtml}</aside>` : ''}
      <div class="page">
        <div class="steps">${stepsHtml}</div>
        <h1 class="lesson-title">${escapeHtml(title)}</h1>
        <p class="checked-tag">נכון ל-${(content.checked || '').split('-')[0]} | נבדק ${formatDate(content.checked)}</p>
        <div id="stage-content"></div>
        <div class="lesson-nav" id="lesson-nav"></div>
      </div>
    </div>
  `;

  const stageRoot = root.querySelector('#stage-content');
  if (stage === 'start') {
    renderStart(stageRoot, content);
    const goBtn = stageRoot.querySelector('[data-go="learn"]');
    if (goBtn) goBtn.addEventListener('click', () => ctx.navigate(`#/lesson/${slug}/learn`));
    store.setStageDone(slug, 'start', true);
  } else if (stage === 'learn') {
    renderLearn(stageRoot, content);
    store.setStageDone(slug, 'learn', true);
  } else if (stage === 'practice') {
    renderPractice(stageRoot, content, slug, store);
    store.setStageDone(slug, 'practice', true);
  } else if (stage === 'quiz') {
    renderQuiz(stageRoot, content, slug, store);
  } else if (stage === 'finish') {
    renderFinish(stageRoot, content, slug, store);
  }

  renderNav(root.querySelector('#lesson-nav'), { slug, stage, num, ctx, sideInnerHtml });

  const pending = ctx.consumePendingHighlight();
  if (pending && pending.type === 'lesson' && pending.slug === slug && pending.stage === stage && pending.blockId) {
    requestAnimationFrame(() => scrollToBlock(stageRoot, pending.blockId));
  }
}
