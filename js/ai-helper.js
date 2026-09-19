// js/ai-helper.js : the floating AI helper ("העוזר"), mounted once from
// js/app.js and present on every screen (its own root is appended straight
// to document.body, so route changes inside #main-content never remove it).
//
// Everything here works fully offline except the one network call inside
// sendQuestion(): retrieval (js/ai-retrieval.js), history and rendering are
// all local, so the rest of the app's offline guarantee (SPEC.md §7) is
// unaffected. Approved design (do not change without asking):
//  1. answers only from course content the client found and sent;
//  2. the model runs behind a Cloudflare Worker proxy that holds the key;
//  3. 20 questions/day/visitor enforced by the Worker; an owner code bypasses
//     the per-visitor limit but not the Worker's own global daily cap;
//  4. no workerUrl / offline / any error -> local passages, never nothing;
//  5. 3-4 short sentences + lesson buttons;
//  6. dashboard numbers only go out when the student turns the toggle on.
import { aiConfig } from '../ai-config.js';
import { icon, injectIconSprite } from './icons.js';
import { escapeHtml } from './render-blocks.js';
import { findPassages, findAnswerSentences } from './ai-retrieval.js';
import { getLesson } from '../content/course.js';
import { OSEK_PATUR_CEILING_2026 } from '../content/constants.js';
import { defaultDashboard } from './views/dashboard.js';

const HISTORY_KEY = 'finance-course:ai-chat';
const OWNER_KEY = 'finance-course:ai-owner-code';
const MAX_HISTORY = 30;
const REQUEST_TIMEOUT_MS = 12000;

const FALLBACK_WITH_PASSAGES = 'אי אפשר להתחבר לעוזר החכם כרגע. הנה החלקים הכי קרובים מהקורס לשאלה שלך.';
const NOT_SET_UP_WITH_PASSAGES = 'העוזר החכם עוד לא חובר. בינתיים מצאתי בשבילך את החלקים האלה בקורס.';
const NOT_SET_UP_NO_PASSAGES = 'העוזר החכם עוד לא חובר ולא מצאתי חלק מתאים בקורס לשאלה הזאת. אפשר לנסח את השאלה קצת אחרת.';
const FALLBACK_NO_PASSAGES = 'אי אפשר להתחבר לעוזר החכם כרגע ולא נמצא חלק מתאים בקורס לשאלה הזאת. אפשר לנסות לנסח את השאלה קצת אחרת או לחפש למעלה בעמוד.';
const EMPTY_NOTE = 'אפשר לשאול כל שאלה על החומר בקורס. העוזר עונה רק ממה שכתוב בשיעורים.';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === undefined ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // storage blocked/full (e.g. private browsing): keep working in memory only
  }
}
function loadOwnerCode() {
  try {
    return localStorage.getItem(OWNER_KEY) || '';
  } catch (e) {
    return '';
  }
}
function saveOwnerCode(code) {
  try {
    if (code) localStorage.setItem(OWNER_KEY, code);
    else localStorage.removeItem(OWNER_KEY);
  } catch (e) {
    /* ignore: worst case the owner has to retype it next visit */
  }
}

// reads the open lesson's slug straight from the hash (independent of
// app.js's router state) so this module stays a self-contained mount.
function getCurrentLessonSlug() {
  const hash = (location.hash || '').slice(1);
  const parts = hash.split('?')[0].split('/').filter(Boolean);
  return parts[0] === 'lesson' && parts[1] ? parts[1] : null;
}

function sum(rows, key) {
  return (rows || []).reduce((total, r) => total + (Number(r[key]) || 0), 0);
}

// a short, model-friendly summary instead of the dashboard's full editable-row
// shape (SPEC: "send a compact object"). Field names are self-explanatory on
// purpose since they go straight into the Worker's prompt.
function compactDashboard(data) {
  const p = data.personal || {};
  const b = data.business || {};
  const incomeTotal = sum(p.income, 'amount');
  const expenseTotal = sum(p.expenses, 'amount');
  return {
    personalMonthlyIncome: incomeTotal,
    personalMonthlyExpenses: expenseTotal,
    personalLeftOverPerMonth: incomeTotal - expenseTotal,
    savingsGoalAmount: p.goalAmount,
    savingsGoalMonthly: p.goalMonthly,
    businessMonths: (b.months || []).map((m) => ({
      name: m.name,
      sales: Number(m.sales) || 0,
      profit: (Number(m.sales) || 0) - (Number(m.supplier) || 0) - (Number(m.ads) || 0) - (Number(m.other) || 0),
    })),
    businessTotalSalesSoFar: sum(b.months, 'sales'),
    osekPaturCeiling2026: OSEK_PATUR_CEILING_2026,
    setAsidePct: b.setAsidePct,
  };
}

export function mountAiHelper(ctx) {
  if (document.getElementById('ai-helper-root')) return; // idempotent: mount once
  injectIconSprite();

  let history = loadJSON(HISTORY_KEY, []);
  if (!Array.isArray(history)) history = [];
  let ownerCode = loadOwnerCode();
  let isSending = false;

  const root = document.createElement('div');
  root.id = 'ai-helper-root';
  root.innerHTML = `
    <button type="button" class="ai-fab" id="ai-fab" aria-haspopup="dialog" aria-expanded="false" aria-controls="ai-panel" aria-label="פתיחת העוזר">
      ${icon('chat')}
    </button>
    <div class="ai-panel" id="ai-panel" role="dialog" aria-label="העוזר" aria-hidden="true">
      <div class="ai-panel-head">
        <h2 class="ai-panel-title">העוזר</h2>
        <button type="button" class="ai-panel-close" id="ai-panel-close" aria-label="סגירת העוזר">${icon('x', 'sm')}</button>
      </div>
      <div class="ai-messages" id="ai-messages" aria-live="polite"></div>
      <div class="ai-panel-foot">
        <label class="ai-toggle">
          <input type="checkbox" id="ai-dash-toggle">
          <span>לצרף את המספרים מהדשבורד</span>
        </label>
        <div class="ai-input-row">
          <label class="sr-only" for="ai-input">שאלה לעוזר</label>
          <textarea id="ai-input" rows="2" placeholder="למשל: מה זה עוסק פטור"></textarea>
          <button type="button" class="btn ai-send" id="ai-send">שליחה</button>
        </div>
        <p class="ai-note">העוזר עונה מתוך הקורס בלבד. זה חומר לימוד ולא ייעוץ מס.</p>
        <div class="ai-foot-links">
          <button type="button" class="ai-clear-btn" id="ai-clear">נקה שיחה</button>
          <button type="button" class="ai-owner-link" id="ai-owner-link">קוד אישי</button>
        </div>
        <div class="ai-owner-box" id="ai-owner-box" hidden>
          <div class="ai-owner-row">
            <label class="sr-only" for="ai-owner-input">קוד אישי</label>
            <input type="password" id="ai-owner-input" placeholder="קוד אישי" autocomplete="off">
            <button type="button" class="btn-secondary" id="ai-owner-save">שמירה</button>
          </div>
          <p class="ai-owner-status" id="ai-owner-status"></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(root);

  const fab = root.querySelector('#ai-fab');
  const panel = root.querySelector('#ai-panel');
  const closeBtn = root.querySelector('#ai-panel-close');
  const messagesEl = root.querySelector('#ai-messages');
  const inputEl = root.querySelector('#ai-input');
  const sendBtn = root.querySelector('#ai-send');
  const dashToggle = root.querySelector('#ai-dash-toggle');
  const clearBtn = root.querySelector('#ai-clear');
  const ownerLink = root.querySelector('#ai-owner-link');
  const ownerBox = root.querySelector('#ai-owner-box');
  const ownerInput = root.querySelector('#ai-owner-input');
  const ownerSaveBtn = root.querySelector('#ai-owner-save');
  const ownerStatus = root.querySelector('#ai-owner-status');

  function renderMessageHtml(m) {
    if (m.role === 'user') {
      return `<div class="ai-msg ai-msg-user">${escapeHtml(m.content)}</div>`;
    }
    const lessonLinks = (m.lessons || [])
      .map((l) => `<a class="ai-lesson-link" href="#/lesson/${escapeHtml(l.slug)}/learn">לשיעור: ${escapeHtml(l.title)}</a>`)
      .join('');
    const passageCards = (m.passages || [])
      .map(
        (p) => `<div class="ai-passage-card">
          <div class="p-title">${escapeHtml(p.lessonTitle)}</div>
          <p class="p-text">${escapeHtml(p.text)}</p>
          <a class="ai-lesson-link" href="#/lesson/${escapeHtml(p.slug)}/learn">לשיעור: ${escapeHtml(p.lessonTitle)}</a>
        </div>`
      )
      .join('');
    const remainingLine =
      typeof m.remaining === 'number' && m.remaining <= 3
        ? `<div class="ai-remaining">נשארו לך היום ${m.remaining} שאלות</div>`
        : '';
    const quotes = (m.quotes || [])
      .map(
        (q) => `<blockquote class="ai-quote">
          <p>${escapeHtml(q.text)}</p>
          <a class="ai-lesson-link" href="#/lesson/${escapeHtml(q.slug)}/learn">מתוך: ${escapeHtml(q.lessonTitle)}</a>
        </blockquote>`
      )
      .join('');
    const moreBlock = passageCards
      ? `<details class="ai-more"><summary>עוד קטעים מהקורס</summary>${passageCards}</details>`
      : '';
    return `<div class="ai-msg ai-msg-bot${m.isFallback ? ' is-fallback' : ''}">${escapeHtml(m.content)}${quotes}${lessonLinks ? `<div class="ai-lesson-links">${lessonLinks}</div>` : ''}${m.quotes && m.quotes.length ? moreBlock : passageCards}${remainingLine}</div>`;
  }

  function renderMessages() {
    if (!history.length) {
      messagesEl.innerHTML = `<p class="ai-empty">${escapeHtml(EMPTY_NOTE)}</p>`;
      return;
    }
    messagesEl.innerHTML = history.map(renderMessageHtml).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function pushHistory(entry) {
    history.push(entry);
    if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
    saveJSON(HISTORY_KEY, history);
  }

  // local fallback shows a short taste of each passage, not the whole 700
  // character chunk the model would have received
  function shortenPassage(text) {
    const s = String(text || '').replace(/\s+/g, ' ').trim();
    if (s.length <= 190) return s;
    const cut = s.slice(0, 190);
    const lastStop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
    return (lastStop > 90 ? cut.slice(0, lastStop + 1) : cut.trim()) + '…';
  }

  function renderFallback(passages, notSetUp, quotes) {
    const found = (quotes && quotes.length) || passages.length;
    const withText = quotes && quotes.length
      ? 'הנה מה שכתוב על זה בקורס.'
      : notSetUp
      ? NOT_SET_UP_WITH_PASSAGES
      : FALLBACK_WITH_PASSAGES;
    const noneText = notSetUp ? NOT_SET_UP_NO_PASSAGES : FALLBACK_NO_PASSAGES;
    pushHistory({
      role: 'assistant',
      content: found ? withText : noneText,
      quotes: (quotes || []).map((q) => ({ text: q.text, slug: q.slug, lessonTitle: q.lessonTitle })),
      isFallback: true,
      passages: passages.slice(0, 3).map((p) => ({ slug: p.slug, lessonTitle: p.lessonTitle, text: shortenPassage(p.text) })),
    });
    renderMessages();
  }

  function renderAssistantAnswer(data) {
    const lessons = (Array.isArray(data.lessons) ? data.lessons : [])
      .map((slug) => getLesson(slug))
      .filter(Boolean)
      .map((l) => ({ slug: l.slug, title: l.title }));
    pushHistory({
      role: 'assistant',
      content: data.answer.trim(),
      lessons,
      remaining: typeof data.remaining === 'number' ? data.remaining : null,
      isFallback: false,
    });
    renderMessages();
  }

  async function sendQuestion() {
    if (isSending) return;
    const question = inputEl.value.trim();
    if (!question) return;

    // snapshot before pushing the new question, so it is not duplicated in
    // the "last 4 messages" of conversational context sent to the Worker.
    const historyForRequest = history.slice(-4).map((m) => ({ role: m.role, content: m.content }));
    pushHistory({ role: 'user', content: question });
    inputEl.value = '';
    renderMessages();

    isSending = true;
    sendBtn.disabled = true;
    sendBtn.textContent = 'חושב';

    let passages = [];
    let quotes = [];
    try {
      const currentSlug = getCurrentLessonSlug();
      [passages, quotes] = await Promise.all([
        findPassages(question, { currentSlug }),
        findAnswerSentences(question, { currentSlug, limit: 3 }),
      ]);

      if (!aiConfig.workerUrl) {
        renderFallback(passages, true, quotes);
        return;
      }

      const dashboard = dashToggle.checked ? compactDashboard(ctx.store.getDashboard() || defaultDashboard()) : null;
      const headers = { 'Content-Type': 'application/json' };
      if (ownerCode) headers['x-owner-code'] = ownerCode;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      let res;
      try {
        res = await fetch(aiConfig.workerUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({ question, passages, dashboard, history: historyForRequest }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        renderFallback(passages, false, quotes);
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch (e) {
        renderFallback(passages, false, quotes);
        return;
      }
      if (!data || typeof data.answer !== 'string' || !data.answer.trim()) {
        renderFallback(passages, false, quotes);
        return;
      }
      renderAssistantAnswer(data);
    } catch (e) {
      // offline, timeout (AbortError), DNS failure, CORS rejection, etc. all
      // land here: never leave the student with nothing (approved decision 4).
      renderFallback(passages, false, quotes);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      sendBtn.textContent = 'שליחה';
    }
  }

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    fab.setAttribute('aria-expanded', 'true');
    renderMessages();
    inputEl.focus();
  }
  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    fab.setAttribute('aria-expanded', 'false');
    ownerBox.hidden = true;
  }
  function togglePanel() {
    if (panel.classList.contains('open')) closePanel();
    else openPanel();
  }

  fab.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', closePanel);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
  });
  document.addEventListener('click', (e) => {
    if (!panel.classList.contains('open')) return;
    if (root.contains(e.target)) return; // includes clicks on the fab itself
    closePanel();
  });

  sendBtn.addEventListener('click', sendQuestion);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  });

  clearBtn.addEventListener('click', () => {
    history = [];
    saveJSON(HISTORY_KEY, history);
    renderMessages();
  });

  ownerLink.addEventListener('click', () => {
    ownerBox.hidden = !ownerBox.hidden;
    if (!ownerBox.hidden) {
      ownerStatus.textContent = ownerCode ? 'יש קוד שמור במכשיר הזה.' : '';
      ownerInput.value = '';
      ownerInput.focus();
    }
  });
  ownerSaveBtn.addEventListener('click', () => {
    const code = ownerInput.value.trim();
    ownerCode = code;
    saveOwnerCode(code);
    ownerStatus.textContent = code ? 'הקוד נשמר במכשיר הזה.' : 'הקוד הוסר.';
    ownerInput.value = '';
    setTimeout(() => {
      ownerBox.hidden = true;
    }, 900);
  });

  renderMessages();
}
