// js/content-loader.js : dynamic import of one lesson's content module by
// slug. This is the whole "loader": to add a real lesson, drop
// content/lessons/<slug>.js (default export matching SPEC.md §4) next to the
// others and flip that lesson's status to 'ready' in content/course.js.
// Nothing else in the app needs to change.
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
