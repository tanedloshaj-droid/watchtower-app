// Watchtower-App: holt immer zuerst den neuesten Stand. Ohne Internet zeigt sie den zuletzt geladenen.
const CACHE = "watchtower-v4";
const FILES = ["./", "version.json", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  // Gleich beim ersten Öffnen ablegen, damit die App schon beim nächsten Start ohne Internet geht
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).catch(() => {}));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request, {cache: "no-store"}).then(r => {
    if (r.ok) { const c = r.clone(); caches.open(CACHE).then(cc => cc.put(e.request, c)); }
    return r;
  }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || (e.request.mode === "navigate" ? caches.match("./") : Response.error()))));
});
