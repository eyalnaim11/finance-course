// js/content-loader.js : dynamic import of one lesson's content module by
// slug. This is the whole "loader": to add a real lesson, drop
// content/lessons/<slug>.js (default export matching SPEC.md §4) next to the
// others and flip that lesson's status to 'ready' in content/course.js.
// Nothing else in the app needs to change.
//
// Same pattern extended for tests/sims/sheets (SPEC-EXTRAS.md §1): content
// writers drop files in content/tests/, content/sims/, content/sheets.js
// independently and in parallel. Every loader here fails soft (returns
// null/[]) so a view can show "בקרוב" instead of crashing on a file that
// does not exist yet.
import { DEV_MODE } from './dev-mode.js';

const cache = new Map();

export async function loadLessonContent(slug) {
  if (cache.has(slug)) return cache.get(slug);
  let content = null;
  try {
    const mod = await import(`../content/lessons/${slug}.js`);
    content = mod.default || null;
  } catch (e) {
    content = null;
  }
  cache.set(slug, content);
  return content;
}

// ---- tests (SPEC-EXTRAS §1.1 / §1.2) ----
// id is 'part-a'..'part-h' or 'final', and doubles as the filename inside
// content/tests/ (also true for the builder's own _dev-* QA files, e.g.
// loadTest('_dev-part-a') imports content/tests/_dev-part-a.js) so no dev
// override branch is needed here: the id already carries the file to load.
const testCache = new Map();

export async function loadTest(id) {
  if (testCache.has(id)) return testCache.get(id);
  let content = null;
  try {
    const mod = await import(`../content/tests/${id}.js`);
    content = mod.default || null;
  } catch (e) {
    content = null;
  }
  testCache.set(id, content);
  return content;
}

// ---- simulations (SPEC-EXTRAS §1.3) ----
const simCache = new Map();

export async function loadSim(id) {
  if (simCache.has(id)) return simCache.get(id);
  let content = null;
  try {
    const mod = await import(`../content/sims/${id}.js`);
    content = mod.default || null;
  } catch (e) {
    content = null;
  }
  simCache.set(id, content);
  return content;
}

// registry file (content/sims/index.js) is one file the content writer owns;
// only here, for the list screen, does ?dev fall back to the builder's own
// content/sims/_dev-index.js when the real registry is not there yet.
export async function loadSimsRegistry() {
  try {
    const mod = await import('../content/sims/index.js');
    if (Array.isArray(mod.sims)) return mod.sims;
  } catch (e) {
    /* not written yet */
  }
  if (DEV_MODE) {
    try {
      const mod = await import('../content/sims/_dev-index.js');
      if (Array.isArray(mod.sims)) return mod.sims;
    } catch (e) {
      /* no dev fixture either */
    }
  }
  return [];
}

// ---- printable sheets (SPEC-EXTRAS §1.4) ----
// sheets.js exports the full array (each sheet's blocks are inline, no
// per-id file), so this one registry loader is also the per-sheet lookup.
export async function loadSheetsRegistry() {
  try {
    const mod = await import('../content/sheets.js');
    if (Array.isArray(mod.sheets)) return mod.sheets;
  } catch (e) {
    /* not written yet */
  }
  if (DEV_MODE) {
    try {
      const mod = await import('../content/_dev-sheets.js');
      if (Array.isArray(mod.sheets)) return mod.sheets;
    } catch (e) {
      /* no dev fixture either */
    }
  }
  return [];
}
