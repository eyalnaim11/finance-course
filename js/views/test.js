// js/views/test.js : #/test/<id>: runs one part test or the final exam
// (SPEC-EXTRAS.md §2). Reuses the lesson quiz UI/CSS (.quiz, .quiz-q, .opt,
// .quiz-feedback) so it looks and behaves like the per-lesson quiz the
// student already knows, just with more questions and (for wrong answers) a
// link back to the lesson that taught the fact.
import { loadTest } from '../content-loader.js';
import { getLesson } from '../../content/course.js';
import { escapeHtml } from '../render-blocks.js';
import { icon } from '../icons.js';

function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}.${m}.${y}`;
}

function pickBand(bands, score) {
  if (!Array.isArray(bands) || !bands.length) return null;
  const sorted = [...bands].sort((a, b) => b.min - a.min);
  return sorted.find((b) => score >= b.min) || sorted[sorted.length - 1];
}

export async function render(root, ctx, { id }) {
  const { store } = ctx;
  const content = await loadTest(id);

  if (!content) {
    root.innerHTML = `<div class="page"><p class="empty-state">המבחן הזה עוד לא מוכן. הוא יופיע כאן ברגע שהוא יהיה מוכן.</p><a class="btn" href="#/tests">חזרה לרשימת המבחנים</a></div>`;
    return;
  }

  const isFinal = !content.part;
  const questions = content.questions || [];

  const questionsHtml = questions
    .map(
      (q, i) => `
    <fieldset class="quiz-q" data-q="${i}" data-correct="${q.correct}" data-lesson="${escapeHtml(q.lesson || '')}">
      <legend>${i + 1}. ${escapeHtml(q.q)}</legend>
      <div class="quiz-options">
        ${q.options
          .map(
            (opt, oi) => `<label class="opt">
              <input type="radio" name="tq-${i}" value="${oi}">
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
    <div class="page test-page">
      <a class="back-link" href="#/tests">${icon('right', 'sm')}כל המבחנים</a>
      <h1 class="lesson-title">${escapeHtml(content.title)}</h1>
      ${content.checked ? `<p class="checked-tag">נכון ל-${content.checked.split('-')[0]} | נבדק ${formatDate(content.checked)}</p>` : ''}
      <div class="sheet">
        <div class="sheet-full quiz" id="quiz-root">
          <div class="quiz-summary" id="quiz-summary" hidden>
            <p class="quiz-score" id="quiz-score-num"></p>
            <p id="quiz-score-sub"></p>
            <button type="button" class="btn-outline" id="retry-btn">לנסות שוב</button>
          </div>
          ${questionsHtml}
          <button type="button" class="quiz-check" id="quiz-check-btn" disabled>סיימתי. תבדוק</button>
        </div>
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
      const q = questions[i];
      const lessonSlug = fs.dataset.lesson;
      const lessonMeta = lessonSlug ? getLesson(lessonSlug) : null;
      const backLink = !isCorrect && lessonMeta ? `<a class="test-back-to-lesson" href="#/lesson/${lessonSlug}/learn">לחזור לשיעור: ${escapeHtml(lessonMeta.title)}</a>` : '';
      const fb = fs.querySelector('.quiz-feedback');
      fb.innerHTML = `${escapeHtml(q.explain || '')}${backLink}`;
      fb.classList.toggle('is-wrong', !isCorrect);
    });

    const score = isFinal ? Math.round((correctCount / questions.length) * 100) : correctCount;
    quizRoot.classList.add('checked');
    checkBtn.hidden = true;
    root.querySelector('#quiz-summary').hidden = false;
    const scoreNumEl = root.querySelector('#quiz-score-num');
    const scoreSubEl = root.querySelector('#quiz-score-sub');
    if (isFinal) {
      scoreNumEl.textContent = `${score}/100`;
      const band = pickBand(content.bands, score);
      scoreSubEl.innerHTML = band ? `<strong>${escapeHtml(band.title)}</strong><br>${escapeHtml(band.text)}` : '';
    } else {
      scoreNumEl.textContent = `${correctCount}/${questions.length}`;
      scoreSubEl.textContent = 'ככה הלך לך';
    }
    store.saveTestResult(id, score, answers);
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
      fs.querySelector('.quiz-feedback').innerHTML = '';
    });
    updateCheckBtn();
    root.scrollTo({ top: 0 });
  });

  updateCheckBtn();
}
