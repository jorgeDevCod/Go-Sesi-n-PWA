const CACHE_NAME = "gosession-shell-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Si el usuario pulsa una notificación, enfoca la app (o la abre). Cada
// notificación lleva un dato con la acción y el id de sesión para decidir
// a dónde navegar.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data ?? {};
  const action = event.action ?? data.action ?? "open";
  const sessionId = data.sessionId;

  const url =
    action === "finish"
      ? "/app/session"
      : action === "view"
        ? "/app/session"
        : "/app/home";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.navigate(url);
      }
      return self.clients.openWindow(url);
    }),
  );
});

// Only navigations are intercepted, and only to show a calm offline page
// when the network truly fails. Every other request (JS, data fetches,
// Server Actions) passes straight through to the network, uncached-so
// nothing here can ever serve stale session/history data.
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
  );
});
