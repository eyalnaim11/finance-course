// js/app.js : boot + hash router. Builds the persistent shell (top bar,
// mobile drawer, offline banner, popover host) once, then swaps the main
// content on every hash change.
import { createStore } from './store.js';
import { injectIconSprite, icon } from './icons.js';
import { closePopover } from './popover.js';
import { debounce } from './search.js';
import * as homeView from './views/home.js';
import * as lessonView from './views/lesson.js';
import * as searchView from './views/search.js';
import * as glossaryView from './views/glossary.js';
import * as sourcesView from './views/sources.js';
import * as loginView from './views/login.js';
import * as testsView from './views/tests.js';
import * as testView from './views/test.js';
import * as simsView from './views/sims.js';
import * as simView from './views/sim.js';
import * as dashboardView from './views/dashboard.js';
import * as sheetsView from './views/sheets.js';
import * as sheetView from './views/sheet.js';
import { mountAiHelper } from './ai-helper.js';

injectIconSprite();

const store = createStore();
let pendingHighlight = null;

function setPendingHighlight(v) {
  pendingHighlight = v;
}
function consumePendingHighlight() {
  const v = pendingHighlight;
  pendingHighlight = null;
  return v;
}

function navigate(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

const appEl = document.getElementById('app');
appEl.innerHTML = `
  <a class="skip-link" href="#main-content">לדלג לתוכן</a>
  <div class="offline-banner">${icon('wifi-off', 'sm')}אין חיבור לאינטרנט. עובדים במצב לא מקוון.</div>
  <header class="top">
    <a class="brand-link" href="#/"><span class="mark">₪</span><span class="brand">כסף מגיל 16</span></a>
    <div class="top-search-wrap top-search">
      ${icon('search')}
      <label class="sr-only" for="top-search-input">חיפוש</label>
      <input type="search" id="top-search-input" placeholder="חיפוש: מע״מ, תלוש, חשבונית">
    </div>
    <nav class="toplinks" aria-label="ניווט עליון">
      <a href="#/tests">מבחנים</a>
      <a href="#/sims">סימולציות</a>
      <a href="#/dashboard">הכסף שלי</a>
      <a href="#/sheets">דפי עזר</a>
      <a href="#/glossary">מילון</a>
      <a href="#/sources">מקורות</a>
      <a href="#/login" class="sync-pill" id="sync-pill"></a>
    </nav>
    <button type="button" class="menu-toggle" id="menu-toggle" aria-label="פתיחת תפריט">${icon('menu')}</button>
  </header>
  <main id="main-content" tabindex="-1"></main>
  <div class="drawer-backdrop" id="drawer-backdrop"></div>
  <aside class="drawer" id="drawer" aria-label="תפריט">
    <button type="button" class="drawer-close" id="drawer-close" aria-label="סגירת תפריט">${icon('x')}</button>
    <div id="drawer-content"></div>
  </aside>
`;

const mainEl = document.getElementById('main-content');
const drawerEl = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawer-backdrop');
const drawerContent = document.getElementById('drawer-content');
const syncPill = document.getElementById('sync-pill');

function openDrawer(html) {
  drawerContent.innerHTML = html;
  drawerContent.querySelectorAll('a, button').forEach((el) => el.addEventListener('click', closeDrawer));
  drawerEl.classList.add('open');
  drawerBackdrop.classList.add('open');
}
function closeDrawer() {
  drawerEl.classList.remove('open');
  drawerBackdrop.classList.remove('open');
}
drawerBackdrop.addEventListener('click', closeDrawer);
document.getElementById('drawer-close').addEventListener('click', closeDrawer);

const STATUS_TEXT = { local: 'שמור במכשיר הזה', syncing: 'מתחבר', synced: 'מסונכרן', error: 'הסנכרון לא זמין' };

function updateSyncPill() {
  const status = store.getSyncStatus();
  syncPill.innerHTML = `${icon(status === 'synced' ? 'cloud' : 'cloud-off', 'sm')}${STATUS_TEXT[status] || STATUS_TEXT.local}`;
}
store.onChange(updateSyncPill);
updateSyncPill();

document.getElementById('menu-toggle').addEventListener('click', () => {
  openDrawer(`
    <nav>
      <a class="drawer-link" href="#/tests">${icon('okc')}מבחנים</a>
      <a class="drawer-link" href="#/sims">${icon('trend')}סימולציות</a>
      <a class="drawer-link" href="#/dashboard">${icon('wallet')}הכסף שלי</a>
      <a class="drawer-link" href="#/sheets">${icon('doc')}דפי עזר</a>
      <a class="drawer-link" href="#/glossary">${icon('book')}מילון</a>
      <a class="drawer-link" href="#/sources">${icon('link')}מקורות</a>
      <a class="drawer-link" href="#/login">${icon(store.getSyncStatus() === 'synced' ? 'cloud' : 'cloud-off')}${STATUS_TEXT[store.getSyncStatus()] || STATUS_TEXT.local}</a>
    </nav>
  `);
});

const topSearchInput = document.getElementById('top-search-input');
const debouncedTopSearch = debounce((val) => {
  const q = val.trim();
  navigate(`#/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);
}, 250);
topSearchInput.addEventListener('input', () => debouncedTopSearch(topSearchInput.value));

function updateOnlineStatus() {
  document.body.classList.toggle('is-offline', !navigator.onLine);
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
updateOnlineStatus();

function parseHash() {
  const hash = (location.hash || '#/').slice(1);
  const [pathPart, queryPart] = hash.split('?');
  const parts = pathPart.split('/').filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(queryPart || ''));
  return { parts, query };
}

const ctx = {
  store,
  navigate,
  openDrawer,
  closeDrawer,
  setPendingHighlight,
  consumePendingHighlight,
  rerender: () => route(),
};

// mounted once, appended to document.body (outside #app), so it survives
// every hash-route swap of #main-content below.
mountAiHelper(ctx);

async function route() {
  closePopover();
  closeDrawer();
  const { parts, query } = parseHash();

  if (parts.length === 0) {
    homeView.render(mainEl, ctx);
  } else if (parts[0] === 'lesson' && parts[1]) {
    await lessonView.render(mainEl, ctx, { slug: parts[1], stage: parts[2] });
  } else if (parts[0] === 'search') {
    await searchView.render(mainEl, ctx, { query });
    if (document.activeElement === document.body) {
      const input = document.getElementById('top-search-input');
      if (input && query.q) input.value = query.q;
    }
  } else if (parts[0] === 'glossary') {
    glossaryView.render(mainEl, ctx);
  } else if (parts[0] === 'sources') {
    await sourcesView.render(mainEl, ctx);
  } else if (parts[0] === 'login') {
    loginView.render(mainEl, ctx);
  } else if (parts[0] === 'tests' && !parts[1]) {
    await testsView.render(mainEl, ctx);
  } else if (parts[0] === 'test' && parts[1]) {
    await testView.render(mainEl, ctx, { id: parts[1] });
  } else if (parts[0] === 'sims' && !parts[1]) {
    await simsView.render(mainEl, ctx);
  } else if (parts[0] === 'sim' && parts[1]) {
    await simView.render(mainEl, ctx, { id: parts[1] });
  } else if (parts[0] === 'dashboard') {
    await dashboardView.render(mainEl, ctx);
  } else if (parts[0] === 'sheets' && !parts[1]) {
    await sheetsView.render(mainEl, ctx);
  } else if (parts[0] === 'sheet' && parts[1]) {
    await sheetView.render(mainEl, ctx, { id: parts[1] });
  } else {
    homeView.render(mainEl, ctx);
  }
  updateSyncPill();
  window.scrollTo(0, 0);
  mainEl.focus({ preventScroll: true });
}

window.addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator) {
  // this module can finish running after the page 'load' event already fired
  // (top-level awaits above), so register right away in that case.
  const registerSW = () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline support degrades gracefully without a SW */
    });
  };
  if (document.readyState === 'complete') registerSW();
  else window.addEventListener('load', registerSW);
}
