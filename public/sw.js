const CACHE = "naivestream-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  
  const url = new URL(event.request.url);
  // Bypass caching for Next.js hot-reloading, internal files, API routes, and non-http protocols
  if (
    !url.protocol.startsWith("http") ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.includes("webpack") ||
    url.pathname.includes("socket.io")
  ) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      try {
        const network = await fetch(event.request);
        if (network.ok) cache.put(event.request, network.clone());
        return network;
      } catch {
        const cached = await cache.match(event.request);
        return cached ?? new Response("Offline", { status: 503 });
      }
    })(),
  );
});
