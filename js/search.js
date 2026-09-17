// js/search.js : builds a search index over every ready lesson's text (all
// blocks, practice prompts, quiz, finish), the fixture lesson (so the engine
// is testable before real content exists), glossary terms and sources; then
// matches a query against it with Hebrew-friendly normalization.
//
// Normalization: strip niqqud + geresh/gershayim variants (״ " ׳ '), so
// "מע״מ" and "מעמ" become the same string. Prefix tolerance: a query that
// starts with one of ה/ו/ב/ל/מ/ש/כ is also tried with that first letter
// removed, so "ומע\"מ" (normalizes to "ומעמ") also matches text containing
// bare "מעמ". A plain substring match already covers the opposite case
// (query "מעמ" matching content that has the prefix, e.g. "ומעמ").
import { FIXTURE_MODE } from './fixture-mode.js';
import { lessons as courseLessons, getLesson } from '../content/course.js';
import { glossary } from '../content/glossary.js';
import { sources } from '../content/sources.js';
import { buildTextIndex, buildVideosIndex, escapeHtml } from './render-blocks.js';
import { loadLessonContent, loadSimsRegistry, loadSheetsRegistry } from './content-loader.js';

const PREFIX_LETTERS = new Set(['ה', 'ו', 'ב', 'ל', 'מ', 'ש', 'כ']);
const STRIP_RE = /[֑-ׇ״׳'"]/;

function normalizeWithMap(text) {
  let norm = '';
  const map = [];
  const s = String(text || '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (STRIP_RE.test(ch)) continue;
    norm += ch.toLowerCase();
    map.push(i);
  }
  return { norm, map };
}

function queryVariants(rawQuery) {
  const { norm } = normalizeWithMap(String(rawQuery || '').trim());
  const variants = [norm];
  if (norm.length > 1 && PREFIX_LETTERS.has(norm[0])) {
    variants.push(norm.slice(1));
  }
  return variants.filter((v) => v.length > 0);
}

function buildSnippet(raw, start, end, radius = 42) {
  const from = Math.max(0, start - radius);
  const to = Math.min(raw.length, end + radius);
  const before = (from > 0 ? '…' : '') + raw.slice(from, start);
  const match = raw.slice(start, end);
  const after = raw.slice(end, to) + (to < raw.length ? '…' : '');
  return `${escapeHtml(before)}<mark>${escapeHtml(match)}</mark>${escapeHtml(after)}`;
}

function makeEntry(meta, text) {
  const { norm, map } = normalizeWithMap(text || '');
  return { ...meta, raw: text || '', norm, map };
}

function addLessonEntries(entries, slug, title, content) {
  const base = { type: 'lesson', slug, title };

  const introText = [
    content.intro && content.intro.goal,
    content.intro && content.intro.whyYou,
    ...((content.intro && content.intro.youWillKnow) || []),
  ]
    .filter(Boolean)
    .join(' ');
  if (introText) entries.push(makeEntry({ ...base, stage: 'start', blockId: null }, introText));

  const learnIdx = buildTextIndex(content.lesson || [], { idPrefix: 'b', checked: content.checked });
  learnIdx.forEach((e) => entries.push(makeEntry({ ...base, stage: 'learn', blockId: e.id }, e.text)));
  const videoIdx = buildVideosIndex(content.videos || [], { checked: content.checked });
  videoIdx.forEach((e) => entries.push(makeEntry({ ...base, stage: 'learn', blockId: e.id }, e.text)));

  if (content.practice) {
    const exIdx = buildTextIndex((content.practice.exercise && content.practice.exercise.prompt) || [], { idPrefix: 'ep' });
    exIdx.forEach((e) => entries.push(makeEntry({ ...base, stage: 'practice', blockId: e.id }, e.text)));
    const thIdx = buildTextIndex((content.practice.thinking && content.practice.thinking.prompt) || [], { idPrefix: 'tp' });
    thIdx.forEach((e) => entries.push(makeEntry({ ...base, stage: 'practice', blockId: e.id }, e.text)));
  }

  (content.quiz || []).forEach((q, i) => {
    const text = [q.q, ...(q.options || [])].filter(Boolean).join(' ');
    entries.push(makeEntry({ ...base, stage: 'quiz', blockId: `quiz${i}` }, text));
  });

  if (content.finish) {
    const remember = (content.finish.remember || []).join(' ');
    if (remember) entries.push(makeEntry({ ...base, stage: 'finish', blockId: 'remember' }, remember));
    const task = content.finish.realTask;
    if (task) {
      const taskText = [task.title, ...(task.steps || [])].filter(Boolean).join(' ');
      entries.push(makeEntry({ ...base, stage: 'finish', blockId: 'task' }, taskText));
    }
  }
}

let _indexPromise = null;

// slugs indexed: every 'ready' course lesson, plus the fixture lesson (always
// present so the search engine is testable pre-content; 'soon' lessons are
// never indexed).
export async function buildSearchIndex() {
  if (_indexPromise) return _indexPromise;
  _indexPromise = (async () => {
    const entries = [];
    const slugs = [...(FIXTURE_MODE ? ['_fixture'] : []), ...courseLessons.filter((l) => l.status === 'ready').map((l) => l.slug)];
    for (const slug of slugs) {
      const content = await loadLessonContent(slug);
      if (!content) continue;
      const meta = getLesson(slug);
      const title = meta ? meta.title : content.title || slug;
      addLessonEntries(entries, slug, title, content);
    }
    glossary.filter((t) => FIXTURE_MODE || !t.fixture).forEach((t) => {
      const text = [t.he, t.en, t.explain, t.example, t.life].filter(Boolean).join(' ');
      entries.push(makeEntry({ type: 'glossary', id: t.id, title: t.he }, text));
    });
    sources.filter((s) => FIXTURE_MODE || !s.fixture).forEach((s) => {
      const text = [s.org, s.title].filter(Boolean).join(' ');
      entries.push(makeEntry({ type: 'source', id: s.id, title: s.title }, text));
    });
    // sims/sheets (SPEC-EXTRAS §2, "if simple"): title + one-line summary
    // only, not full content blocks. Both loaders fail soft to [] when the
    // registry file does not exist yet.
    const sims = await loadSimsRegistry();
    sims.forEach((s) => {
      const text = [s.title, s.summary].filter(Boolean).join(' ');
      entries.push(makeEntry({ type: 'sim', id: s.id, title: s.title }, text));
    });
    const sheets = await loadSheetsRegistry();
    sheets.forEach((s) => {
      const text = [s.title, s.summary].filter(Boolean).join(' ');
      entries.push(makeEntry({ type: 'sheet', id: s.id, title: s.title }, text));
    });
    return entries;
  })();
  return _indexPromise;
}

export async function search(query) {
  const variants = queryVariants(query);
  if (!variants.length) return [];
  const index = await buildSearchIndex();
  const results = [];
  for (const entry of index) {
    for (const variant of variants) {
      const idx = entry.norm.indexOf(variant);
      if (idx !== -1) {
        const start = entry.map[idx];
        const end = entry.map[idx + variant.length - 1] + 1;
        results.push({ ...entry, snippet: buildSnippet(entry.raw, start, end) });
        break;
      }
    }
  }
  return results;
}

export function debounce(fn, ms = 200) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}
