/* Mandi Calendar service worker (hand-written, no library).
   Precache the shell; cache-first for hashed build files and fonts; network-first for pages. */
const VERSION = "mandi-v1.1.0";
const PRECACHE = ["/", "/showcase", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(VERSION)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("mandi-") && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const put = (req, res) => {
  if (res && res.ok && res.type === "basic") {
    const copy = res.clone();
    caches.open(VERSION).then((c) => c.put(req, copy));
  }
  return res;
};

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* build files are hashed, fonts never change: cache first */
  if (url.pathname.startsWith("/_next/static/") || /\.(woff2?|ttf|otf)$/.test(url.pathname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
    return;
  }
  /* pages: network first, cached copy when offline (any ?state=… falls back to the same page) */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => put(req, res))
        .catch(() =>
          caches
            .match(req)
            .then((hit) => hit || caches.match(req, { ignoreSearch: true }))
            .then((hit) => hit || caches.match("/")),
        ),
    );
  }
});
