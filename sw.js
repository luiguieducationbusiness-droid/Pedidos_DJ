const CACHE = "crowdmix-shell-v5";
const SHELL = [
  "./index.html",
  "./host.html",
  "./guest.html",
  "./display.html",
  "./css/styles.css",
  "./js/app-common.js",
  "./manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Solo el "shell" estático se sirve desde caché; todo lo demás (Firebase,
// CDNs, config con tus claves) siempre va a la red para que los datos
// del evento estén al segundo.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin || url.pathname.includes("firebase-config")) return;
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
