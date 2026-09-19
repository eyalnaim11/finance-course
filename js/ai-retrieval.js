// js/ai-retrieval.js : word-based retrieval over ready lesson content, used
// by the AI helper (js/ai-helper.js) to find the passages it is allowed to
// answer from.
//
// Builds on buildSearchIndex() from js/search.js, which already walks every
// ready lesson (plus the fixture lesson when FIXTURE_MODE is on) and indexes
// it one entry per content block: { type:'lesson', slug, title, stage,
// blockId, raw, norm, map }. Glossary/source/sim/sheet entries use a
// different, unrelated shape and are skipped here: the AI only ever answers
// from lesson content (approved decision #1). This module re-groups the
// block-level entries back into one passage per lesson (its raw text, in
// reading order) and scores each lesson by how many distinct question words
// it contains.
import { buildSearchIndex } from './search.js';

// Same normalization as search.js (niqqud + geresh/gershayim stripped,
// lowercased) with a char-index map so a trimmed window can be sliced back
// out of the original raw text. Duplicated here (not imported) because
// search.js does not export it; keep the stripped character class identical
// if search.js's ever changes.
const STRIP_RE = /[֑-ׇ״׳'"]/;
const PREFIX_LETTERS = new Set(['ה', 'ו', 'ב', 'ל', 'מ', 'ש', 'כ']);

// Short, high-frequency Hebrew words that carry no topic meaning on their
// own and would otherwise "match" almost every passage.
const STOPWORDS = new Set([
  'של', 'על', 'את', 'עם', 'זה', 'זו', 'זאת', 'אלה', 'אלו',
  'מה', 'איך', 'כמה', 'כיצד', 'למה', 'מדוע', 'מי', 'איפה', 'מתי', 'האם',
  'אם', 'יש', 'אין', 'לי', 'לך', 'לו', 'לה', 'לנו', 'לכם', 'להם',
  'אני', 'אתה', 'הוא', 'היא', 'אנחנו', 'אתם', 'אתן', 'הם', 'הן',
  'צריך', 'צריכה', 'אפשר', 'כן', 'לא', 'או', 'גם', 'כי', 'אבל', 'רק',
  'כל', 'עוד', 'כבר', 'אז', 'שם', 'כאן', 'הזה', 'הזאת', 'הזו',
  'בין', 'עד', 'אחרי', 'לפני', 'כמו', 'וגם',
]);

const BONUS_CURRENT_LESSON = 0.5;
// per distinct question word that also appears in the lesson TITLE (not just
// its body). Pure body word-count alone ties very easily on real content: a
// lesson that only mentions "עוסק פטור" once in a passing aside scores the
// same as the lesson actually titled "עוסק פטור". Verified against real
// content while testing: without this, asking "מה זה עוסק פטור" did not even
// return the osek-patur lesson in the top 5. A title match is about as
// strong a relevance signal as exists, so it outweighs body-only ties.
const TITLE_MATCH_BONUS = 3;
const MAX_PASSAGES = 5;
const MAX_PASSAGE_CHARS = 700;
const WINDOW_RADIUS = MAX_PASSAGE_CHARS / 2;

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

// question text -> deduplicated, stopword-filtered, normalized word list.
export function extractQuestionWords(question) {
  const { norm } = normalizeWithMap(String(question || ''));
  const raw = norm.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const seen = new Set();
  const words = [];
  for (const w of raw) {
    if (w.length < 2) continue;
    if (STOPWORDS.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    words.push(w);
  }
  return words;
}

// variants of one already-normalized question word: itself, plus the word
// with a single leading ה/ו/ב/ל/מ/ש/כ prefix letter stripped (mirrors
// search.js's queryVariants(), applied per-word here instead of once to the
// whole query). The stripped variant is only used if at least 3 characters
// remain: verified while testing that without this floor, "מעמ" (VAT, which
// happens to start with the prefix letter מ) strips to "עמ" and that 2-char
// fragment substring-matches inside unrelated words like "עמלות" (fees) --
// enough to push the fees lesson above the actual VAT lesson for "מה זה
// מע"מ". Whole-word matches (the first variant) are never length-limited.
function wordVariants(w) {
  const variants = [w];
  if (w.length > 1 && PREFIX_LETTERS.has(w[0]) && w.length - 1 >= 3) variants.push(w.slice(1));
  // Hebrew plural/singular endings. Stripping them turns both "חשבונית" and
  // "חשבוניות" into the shared stem "חשבוני", which then substring-matches
  // either form. Only applied when at least 3 characters remain, same floor
  // as the prefix rule, so short words are never reduced to noise.
  for (const base of [...variants]) {
    for (const suffix of ['יות', 'ות', 'ים', 'ת', 'ה']) {
      if (base.endsWith(suffix) && base.length - suffix.length >= 3) {
        const stem = base.slice(0, base.length - suffix.length);
        if (!variants.includes(stem)) variants.push(stem);
        break;
      }
    }
  }
  return variants;
}

// questions that are really asking for a number ("כמה", "תקרה", "אחוז",
// "מתי") should prefer sentences that actually contain one.
const NUMERIC_HINTS = ['כמה', 'תקרה', 'תקרת', 'אחוז', 'אחוזים', 'שיעור', 'מתי', 'עד', 'מחיר', 'עולה', 'סכום'];

export function questionWantsNumber(question) {
  const norm = normalizeWithMap(String(question || '')).norm;
  return NUMERIC_HINTS.some((h) => norm.includes(h));
}

function splitSentences(raw) {
  return String(raw || '')
    .split(/(?<=[.!?:])\s+|\n+/)
    .map((s) => s.trim())
    // 25 chars filters out headings and stray fragments; 320 filters out the
    // long "mistakes"/compare blobs that have no sentence punctuation at all
    // and would otherwise win on raw word count while reading terribly.
    .filter((s) => s.length >= 25 && s.length <= 320);
}

// Best single sentences (not whole blocks) that answer the question. Used by
// the helper's local mode so the student sees the exact line from the lesson
// instead of a wall of text.
export async function findAnswerSentences(question, { currentSlug, limit = 3 } = {}) {
  const words = extractQuestionWords(question);
  if (!words.length) return [];
  const wantsNumber = questionWantsNumber(question);
  const index = await buildSearchIndex();
  // Pick the lesson first, then the sentence inside it. Searching every
  // lesson at once kept surfacing a stray line from an unrelated lesson that
  // happened to repeat the words ("בהתחלה הוא היה עוסק פטור" from the עוסק
  // מורשה lesson beat the actual definition).
  const ranked = await rankLessons(question, { currentSlug });
  const allowed = new Set(ranked.slice(0, 3).map((r) => r.slug));
  if (currentSlug) allowed.add(currentSlug);
  // position of each block inside its own lesson: earlier blocks are the
  // simple explanation, later ones are practice and quiz
  const orderBySlug = new Map();
  const out = [];
  for (const entry of index) {
    if (entry.type !== 'lesson' || !entry.raw) continue;
    const seenSoFar = orderBySlug.get(entry.slug) || 0;
    orderBySlug.set(entry.slug, seenSoFar + 1);
    if (allowed.size && !allowed.has(entry.slug)) continue;
    const earlyBonus = Math.max(0, 1 - seenSoFar / 12) * 0.8;
    for (const sentence of splitSentences(entry.raw)) {
      const norm = normalizeWithMap(sentence).norm;
      const { score } = scoreWithPositions(words, norm);
      if (!score) continue;
      const hasNumber = /\d/.test(sentence);
      let total = score;
      if (wantsNumber && hasNumber) total += 1.5;
      if (entry.slug === currentSlug) total += BONUS_CURRENT_LESSON;
      total += earlyBonus;
      // a definition line usually opens with the term itself
      // ("תזרים מזומנים הוא ...") rather than mentioning it in passing
      const head = normalizeWithMap(sentence.slice(0, 40)).norm;
      if (words.some((w) => wordVariants(w).some((v) => head.includes(v)))) total += 0.8;
      // shorter sentences that still match everything read better as answers
      total += Math.max(0, 1 - sentence.length / 400) * 0.5;
      // a sentence that is itself a question ("כמה זמן צריך לשמור מסמכים?")
      // is the lesson asking, not the lesson answering
      if (/\?\s*$/.test(sentence)) total -= 1.2;
      // no sentence punctuation at all usually means this is a list or a
      // table row joined into one line: it matches words but is not a
      // sentence anyone wants read back as an answer
      if (!/[.!?]/.test(sentence)) total -= 1.5;
      // very long lines are usually the "mistakes" comparison blobs: they
      // match many words but read terribly as an answer
      if (sentence.length > 220) total -= Math.min(2, (sentence.length - 220) / 150);
      out.push({ text: sentence, slug: entry.slug, lessonTitle: entry.title, score: total, matched: score });
    }
  }
  const best = Math.max(0, ...out.map((s) => s.matched));
  // only keep sentences that matched at least as many words as the best one
  // minus one: a sentence matching 1 of 4 question words is noise.
  const kept = out.filter((s) => s.matched >= Math.max(1, best - 1));
  kept.sort((a, b) => b.score - a.score);
  const seen = new Set();
  const unique = [];
  for (const s of kept) {
    const key = s.text.slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(s);
    if (unique.length >= limit) break;
  }
  return unique;
}

// score + the normalized positions every match was found at (positions feed
// trimPassage()'s "window around the best match"; scorePassage below throws
// them away and keeps only the pure count).
function scoreWithPositions(questionWords, norm) {
  let score = 0;
  const positions = [];
  for (const w of questionWords) {
    let found = false;
    for (const variant of wordVariants(w)) {
      const idx = norm.indexOf(variant);
      if (idx !== -1) {
        found = true;
        positions.push(idx);
      }
    }
    if (found) score++;
  }
  return { score, positions };
}

// Pure helper (unit-tested from tests.html): how many distinct question
// words appear in `text` (a raw, un-normalized passage). questionWords is
// already-normalized/stopword-filtered, e.g. from extractQuestionWords().
export function scorePassage(questionWords, text) {
  return scoreWithPositions(questionWords, normalizeWithMap(text).norm).score;
}

function groupLessonEntries(index) {
  const groups = new Map();
  for (const entry of index) {
    if (entry.type !== 'lesson') continue;
    let g = groups.get(entry.slug);
    if (!g) {
      g = { slug: entry.slug, title: entry.title, parts: [] };
      groups.set(entry.slug, g);
    }
    if (entry.raw) g.parts.push(entry.raw);
  }
  return groups;
}

// the normalized position with the most other matches within one window
// radius of it, i.e. the densest cluster of hits, so the trimmed window
// covers as many distinct matches as possible instead of just the first one.
function bestCenter(positions) {
  if (!positions.length) return 0;
  let best = positions[0];
  let bestCount = -1;
  for (const p of positions) {
    let count = 0;
    for (const q of positions) {
      if (Math.abs(q - p) <= WINDOW_RADIUS) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      best = p;
    }
  }
  return best;
}

// trims raw text to at most MAX_PASSAGE_CHARS, centered on the densest
// cluster of question-word matches. positions are indices into `norm`;
// `map[i]` converts a norm index back to the matching raw-text index.
function trimPassage(raw, norm, map, positions) {
  const trimmedRaw = String(raw || '').trim();
  if (trimmedRaw.length <= MAX_PASSAGE_CHARS) return trimmedRaw;
  const center = bestCenter(positions);
  let normFrom = Math.max(0, center - WINDOW_RADIUS);
  let normTo = Math.min(norm.length, normFrom + MAX_PASSAGE_CHARS);
  normFrom = Math.max(0, normTo - MAX_PASSAGE_CHARS);
  const rawFrom = normFrom < map.length ? map[normFrom] : raw.length;
  const rawTo = normTo > 0 && normTo - 1 < map.length ? map[normTo - 1] + 1 : raw.length;
  let out = raw.slice(rawFrom, rawTo).trim();
  // defensive: guarantees the 700-char cap even after trim() (which can only
  // shorten a string, but keep this as the one hard guarantee callers rely on).
  if (out.length > MAX_PASSAGE_CHARS) out = out.slice(0, MAX_PASSAGE_CHARS).trim();
  return out;
}

// Finds up to 5 lesson passages relevant to `question`, at most 700
// characters each (so at most 3500 characters total). currentSlug (the
// lesson the student has open right now, if any) gets a small score bonus so
// it is preferred on close calls, per the approved design.
// lesson-level ranking shared by findPassages() and findAnswerSentences()
export async function rankLessons(question, { currentSlug } = {}) {
  const scored = await scoreLessons(question, { currentSlug });
  return scored.map((s) => ({ slug: s.slug, lessonTitle: s.lessonTitle, score: s.score }));
}

async function scoreLessons(question, { currentSlug } = {}) {
  const words = extractQuestionWords(question);
  const index = await buildSearchIndex();
  const groups = groupLessonEntries(index);

  const scored = [];
  for (const g of groups.values()) {
    const raw = g.parts.join(' ');
    const { norm, map } = normalizeWithMap(raw);
    const { score: wordScore, positions } = scoreWithPositions(words, norm);
    const titleNorm = normalizeWithMap(g.title || '').norm;
    const titleScore = words.reduce((n, w) => (wordVariants(w).some((v) => titleNorm.includes(v)) ? n + 1 : n), 0);
    const bonus = g.slug === currentSlug ? BONUS_CURRENT_LESSON : 0;
    const score = wordScore + titleScore * TITLE_MATCH_BONUS + bonus;
    if (score <= 0) continue;
    scored.push({ slug: g.slug, lessonTitle: g.title, score, raw, norm, map, positions });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export async function findPassages(question, { currentSlug } = {}) {
  const scored = await scoreLessons(question, { currentSlug });
  return scored.slice(0, MAX_PASSAGES).map((s) => ({
    slug: s.slug,
    lessonTitle: s.lessonTitle,
    text: trimPassage(s.raw, s.norm, s.map, s.positions),
  }));
}
