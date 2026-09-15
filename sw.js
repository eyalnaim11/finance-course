// sw.js : minimal cache-first app shell, adapted from
// the eyal-planner project (sw.js). Bump CACHE_NAME whenever any
// shell file changes so clients pick up the new version instead of a stale
// cache. Same-origin requests: cache-first, fall back to network then cache
// the result. Cross-origin requests (YouTube, Firebase/gstatic) are left
// untouched by this service worker entirely, so they are always network-only
// per SPEC.md §7. nothing here intercepts them.
const CACHE_NAME = 'finance-course-v4';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './firebase-config.js',
  './css/styles.css',
  './assets/fonts/fonts.css',
  './assets/fonts/heebo-400-hebrew.woff2',
  './assets/fonts/heebo-400-latin.woff2',
  './assets/fonts/heebo-500-hebrew.woff2',
  './assets/fonts/heebo-500-latin.woff2',
  './assets/fonts/heebo-700-hebrew.woff2',
  './assets/fonts/heebo-700-latin.woff2',
  './assets/fonts/frank-ruhl-libre-700-hebrew.woff2',
  './assets/fonts/frank-ruhl-libre-700-latin.woff2',
  './assets/fonts/frank-ruhl-libre-900-hebrew.woff2',
  './assets/fonts/frank-ruhl-libre-900-latin.woff2',
  './js/app.js',
  './js/store.js',
  './js/firebase-adapter.js',
  './js/icons.js',
  './js/render-blocks.js',
  './js/search.js',
  './js/content-loader.js',
  './js/popover.js',
  './js/fixture-mode.js',
  './js/views/home.js',
  './js/views/lesson.js',
  './js/views/search.js',
  './js/views/glossary.js',
  './js/views/sources.js',
  './js/views/login.js',
  './content/course.js',
  './content/sources.js',
  './content/glossary.js',
  './content/lessons/_fixture.js',
  './content/lessons/osek-patur.js',
  './content/lessons/osek-murshe.js',
  './content/lessons/small-business-owner.js',
  './content/lessons/national-insurance.js',
  './content/lessons/opening-business.js',
  './icons/icon.svg',
  './icons/icon-180.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isSameOrigin(url) {
  return url.startsWith(self.location.origin);
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!isSameOrigin(event.request.url)) return; // network-only passthrough

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
