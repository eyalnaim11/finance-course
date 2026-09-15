// js/fixture-mode.js : the fixture lesson and fixture sources/terms exist only
// to test the engine. They are hidden from every screen unless the page is
// tests.html or the URL has ?fixture (e.g. index.html?fixture#/lesson/_fixture/learn).
export const FIXTURE_MODE = (() => {
  try {
    const u = new URL(self.location.href);
    return u.searchParams.has('fixture') || u.pathname.endsWith('/tests.html');
  } catch (e) {
    return false;
  }
})();
