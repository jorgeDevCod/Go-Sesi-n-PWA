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

// Si el servidor envía un push (fase 6B), muestra la notificación. Sin
// suscripción registrada no llega nada: inerte hasta el opt-in del usuario.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Go Sesión";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || "Tu espacio de enfoque te espera.",
      icon: "/icons/192",
      data: { action: "open", sessionId: payload.sessionId },
    }),
  );
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
