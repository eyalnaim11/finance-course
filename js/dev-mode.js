// js/dev-mode.js : gate for the builder's own temporary QA content
// (content/tests/_dev-*.js, content/sims/_dev-*.js, content/_dev-sheets.js).
// Mirrors fixture-mode.js. Only the *list*-loading functions in
// content-loader.js (which read a single registry file such as
// content/sims/index.js or content/sheets.js) fall back to a _dev- file when
// this is true and the real one is missing; single items (a test or a sim)
// are always reachable directly by URL since the id is the filename, dev or
// not, so no extra gating is needed there.
export const DEV_MODE = (() => {
  try {
    const u = new URL(self.location.href);
    return u.searchParams.has('dev');
  } catch (e) {
    return false;
  }
})();
