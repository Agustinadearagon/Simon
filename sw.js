const CACHE_NAME = "simon-v7";

// Archivos principales del juego
const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./script.js",
    "./styles.css",
    "./manifest.json",
    "./sw.js"
];

// Instalación
self.addEventListener("install", (event) => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

// Activación
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Peticiones
self.addEventListener("fetch", (event) => {

    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {

                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }

                const responseClone = response.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;

            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
