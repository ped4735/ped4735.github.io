// Desativa versões antigas do service worker do Jogo de Matemática que foram
// registradas na raiz antes de o jogo ser movido para /jogomatematica/.
const LEGACY_CACHE_PREFIX = "jogo-matematica-";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const rootUrl = self.registration.scope;
      const legacyUrls = [rootUrl, new URL("index.html", rootUrl).href];
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith(LEGACY_CACHE_PREFIX))
          .map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            await Promise.all(legacyUrls.map((url) => cache.delete(url)));
          })
      );

      await self.registration.unregister();

      const windows = await self.clients.matchAll({ type: "window" });
      await Promise.all(windows.map((client) => client.navigate(client.url)));
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
