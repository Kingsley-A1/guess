/* The build replaces these constants with the exact production asset list. */
const VERSION = "__PWA_VERSION__";
const ASSETS = __PWA_ASSETS__;
const PREFIX = "king-guesser-pwa-";
const CACHE = PREFIX + VERSION;
const assetPaths = new Set(ASSETS);

self.addEventListener("install", (event) => {
  // A new version waits until the player chooses to update or closes all tabs.
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(
        ASSETS.map((url) => new Request(url, { cache: "reload" })),
      );
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Retain the previous build so an older open tab can still load its chunks.
      const previous = keys
        .filter((key) => key.startsWith(PREFIX) && key !== CACHE)
        .slice(-1);
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("king-guesser-") &&
              key !== CACHE &&
              !previous.includes(key),
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Never store credentials, room responses, mutations, or third-party requests.
  if (
    request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    request.headers.has("authorization")
  )
    return;
  if (request.mode === "navigate" && url.pathname === "/") {
    // Use the shell from this worker's build: mixing fresh HTML with old offline
    // chunks would break a subsequent offline launch. Updates install atomically.
    event.respondWith(
      (async () => {
        const cached = await (await caches.open(CACHE)).match("/");
        return cached || fetch(request);
      })(),
    );
    return;
  }
  if (assetPaths.has(url.pathname) && url.pathname !== "/" && !url.search) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      })(),
    );
  } else if (url.pathname.startsWith("/_next/static/")) {
    // Compatibility for a still-open previous build. Only hashed static assets.
    event.respondWith(
      (async () => (await caches.match(request)) || fetch(request))(),
    );
  }
});
