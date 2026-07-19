// USPSA Trainer service worker — range-mode offline.
//
// A shooter at an outdoor range has no signal. Every screen must load and every
// captured run must persist with zero network. User data already lives in
// IndexedDB (see src/lib/store.ts); this worker makes the APP itself — the HTML
// shell, JS, CSS, fonts, seed corpus, icons — available offline too.
//
// Strategy:
//   * navigations (HTML): network-first, fall back to the cached shell offline
//   * static build assets (/_next/*, icons, fonts): cache-first (immutable)
//   * never cache /api/* (dynamic, and irrelevant at the range)
//
// The cache name is version-stamped; bumping CACHE_VERSION retires old caches.
// Activation is deferred behind skip-waiting so an update never yanks the app
// out from under an in-progress session (the page decides when to reload).

const CACHE_VERSION = "v1";
const CACHE = `uspsa-trainer-${CACHE_VERSION}`;

// The app shell + routes to precache so a first cold start offline still works.
const PRECACHE = [
  "/",
  "/drills",
  "/session",
  "/session/plan",
  "/history",
  "/graph",
  "/settings",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // Precache best-effort: a single failing entry must not abort the install.
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Let the page trigger activation of a waiting worker (the "reload for update"
// toast calls this) so updates never interrupt an active session.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/") ||
    /\.(?:js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch cross-origin
  if (url.pathname.startsWith("/api/")) return; // dynamic — always network

  // Navigations: network-first so a fresh build is seen online, cached shell
  // offline. Fall back to "/" if the specific route wasn't precached.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || Response.error())
    );
    return;
  }

  // Static assets: cache-first (immutable, content-hashed by Next).
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
      )
    );
  }
});
