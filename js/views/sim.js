// js/views/sim.js : #/sim/<id>: step-by-step simulation
// (SPEC-EXTRAS.md §1.3/§2). intro -> step 1..N (situation, question, choices
// with immediate feedback) -> end screen with a score out of 100.
// Blocks inside a sim (intro/situation/end.text) are the same §4 blocks a
// lesson uses, rendered with the same renderBlocks()/wireInteractiveBlocks()
// so [[term]] and {{src:id}} work exactly like they do in a lesson.
import { loadSim } from '../content-loader.js';
import { getLesson } from '../../content/course.js';
import { getSource } from '../../content/sources.js';
import { renderBlocks, wireInteractiveBlocks, escapeHtml } from '../render-blocks.js';
import { openTermPopover, openSourcePopover } from '../popover.js';
import { icon } from '../icons.js';

const POINT_LABEL = { 2: 'נכון', 1: 'חלקית נכון', 0: 'לא נכון' };

function popoverHandlers() {
  return {
    onTerm: (id, anchor) => openTermPopover(id, anchor),
    onSource: (id, anchor) => openSourcePopover(id, anchor),
  };
}

export async function render(root, ctx, { id }) {
  const { store } = ctx;
  const content = await loadSim(id);

  if (!content) {
    root.innerHTML = `<div class="page"><p class="empty-state">הסימולציה הזו עוד לא מוכנה. היא תופיע כאן ברגע שהיא תהיה מוכנה.</p><a class="btn" href="#/sims">חזרה לרשימת הסימולציות</a></div>`;
    return;
  }

  const steps = content.steps || [];
  let stepIndex = 0;
  let answered = false; // has the current step been answered
  const points = []; // points earned per step, in order

  root.innerHTML = `
    <div class="page sim-page">
      <a class="back-link" href="#/sims">${icon('right', 'sm')}כל הסימולציות</a>
      <h1 class="lesson-title">${escapeHtml(content.title)}</h1>
      <div class="sheet"><div class="sheet-full" id="sim-stage"></div></div>
    </div>
  `;
  const stageEl = root.querySelector('#sim-stage');

  function renderIntro() {
    stageEl.innerHTML = `
      ${renderBlocks(content.intro || [], { idPrefix: 'si', checked: content.checked, getSource })}
      <button type="button" class="btn" id="sim-start-btn">מתחילים</button>
    `;
    wireInteractiveBlocks(stageEl, popoverHandlers());
    stageEl.querySelector('#sim-start-btn').addEventListener('click', () => {
      stepIndex = 0;
      answered = false;
      renderStep();
    });
  }

  function renderStep() {
    const step = steps[stepIndex];
    const pct = Math.round(((stepIndex + 1) / steps.length) * 100);
    stageEl.innerHTML = `
      <div class="sim-progress">
        <span>שלב ${stepIndex + 1} מתוך ${steps.length}</span>
        <div class="bar"><i style="width:${pct}%"></i></div>
      </div>
      ${renderBlocks(step.situation || [], { idPrefix: `st${stepIndex}`, checked: content.checked, getSource })}
      <p class="sim-question">${escapeHtml(step.question || '')}</p>
      <div class="sim-choices">
        ${(step.choices || [])
          .map(
            (c, ci) => `<button type="button" class="sim-choice" data-ci="${ci}">
              <span class="sim-choice-label">${escapeHtml(c.label)}</span>
            </button>`
          )
          .join('')}
      </div>
      <div class="sim-feedback" hidden></div>
      <button type="button" class="btn sim-next-btn" hidden>${stepIndex < steps.length - 1 ? 'הבא' : 'לסיכום'}</button>
    `;
    wireInteractiveBlocks(stageEl, popoverHandlers());

    const choiceBtns = [...stageEl.querySelectorAll('.sim-choice')];
    const feedbackEl = stageEl.querySelector('.sim-feedback');
    const nextBtn = stageEl.querySelector('.sim-next-btn');

    choiceBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const ci = Number(btn.dataset.ci);
        const choice = step.choices[ci];
        points[stepIndex] = choice.points || 0;

        choiceBtns.forEach((b, bi) => {
          b.disabled = true;
          b.classList.toggle('picked', bi === ci);
          b.classList.toggle(`pts-${step.choices[bi].points}`, bi === ci);
        });

        const lessonMeta = step.lesson ? getLesson(step.lesson) : null;
        const lessonLink = lessonMeta ? `<a class="test-back-to-lesson" href="#/lesson/${step.lesson}/learn">לשיעור: ${escapeHtml(lessonMeta.title)}</a>` : '';
        feedbackEl.hidden = false;
        feedbackEl.classList.toggle('is-wrong', (choice.points || 0) === 0);
        feedbackEl.innerHTML = `<strong>${POINT_LABEL[choice.points] ?? ''}</strong><p>${escapeHtml(choice.feedback || '')}</p>${lessonLink}`;
        nextBtn.hidden = false;
      });
    });

    nextBtn.addEventListener('click', () => {
      if (stepIndex < steps.length - 1) {
        stepIndex += 1;
        answered = false;
        renderStep();
      } else {
        renderEnd();
      }
      stageEl.scrollIntoView({ block: 'start' });
    });
  }

  function renderEnd() {
    const earned = points.reduce((a, b) => a + b, 0);
    const max = steps.length * 2;
    const score = max ? Math.round((earned / max) * 100) : 0;
    store.saveSimResult(id, score);

    stageEl.innerHTML = `
      <div class="sim-end-score">
        <p class="quiz-score">${score}/100</p>
        <p>ככה הלך לך בסימולציה</p>
      </div>
      ${renderBlocks((content.end && content.end.text) || [], { idPrefix: 'se', checked: content.checked, getSource })}
      <button type="button" class="btn-outline" id="sim-replay-btn">לשחק שוב</button>
    `;
    wireInteractiveBlocks(stageEl, popoverHandlers());
    stageEl.querySelector('#sim-replay-btn').addEventListener('click', () => {
      stepIndex = 0;
      answered = false;
      points.length = 0;
      renderIntro();
      stageEl.scrollIntoView({ block: 'start' });
    });
  }

  renderIntro();
}
