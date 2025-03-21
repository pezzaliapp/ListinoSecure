const CACHE_NAME = "listino-cache-v1";
const urlsToCache = [
  "index.html",
  "listino.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icon/ListinoSecure-192.png",
  "icon/ListinoSecure-512.png"
];

// Installazione: cache dei file statici
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("Cache aperta");
        return cache.addAll(urlsToCache);
      })
  );
});

// Attivazione: pulizia vecchie cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log("Cache rimossa:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Intercetta le richieste: serve dalla cache se disponibile
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});
