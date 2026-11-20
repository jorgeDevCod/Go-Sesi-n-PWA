const CACHE_NAME = "gosession-shell-v5";
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
    (async () => {
      const sessionId = payload.data?.sessionId || payload.sessionId;
      // Al terminar la sesión, la notificación de tiempo en curso desaparece.
      if (payload.data?.type === "complete" && sessionId) {
        const live = await self.registration.getNotifications({
          tag: `gosession-live-${sessionId}`,
        });
        for (const note of live) note.close();
      }

      await self.registration.showNotification(title, {
        body: payload.body || "Tu espacio de enfoque te espera.",
        icon: "/icons/192",
        badge: "/icons/192",
        tag: payload.tag,
        data: payload.data || { action: "open", sessionId: payload.sessionId },
        silent: payload.silent === true,
        renotify: payload.renotify === true,
        requireInteraction: payload.requireInteraction === true,
        actions: payload.actions,
        vibrate: payload.silent === true ? undefined : [200, 100, 200],
      });
    })(),
  );
});

// Si el usuario pulsa una notificación, enfoca la app (o la abre). Cada
// notificación lleva un dato con la acción y el id de sesión para decidir
// a dónde navegar.
self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data ?? {};
  const action = event.action ?? data.action ?? "open";

  if (action === "finish" || action === "skip" || action === "previous") {
    event.waitUntil(
      (async () => {
        try {
          await fetch("/api/session/notification-action", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ id: data.sessionId, action }),
          });
        } catch {
          // Si falla, la app puede resolverlo al abrirse.
        } finally {
          event.notification.close();
        }
      })(),
    );
    return;
  }

  event.notification.close();

  const url =
    action === "extend" && data.sessionId
      ? `/app/sesion/finalizada/${data.sessionId}?extender=1`
      : data.url ||
        (action === "finish" || action === "view" || action === "phase" || action === "live"
          ? "/app/sesion"
          : "/app/inicio");

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
