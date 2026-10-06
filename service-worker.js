const CONFIG_URL = "https://jppsqrbpjwulzapyvpim.supabase.co/rest/v1/configuracion?id=eq.1&select=precio_reserva,duracion_minutos,hora_apertura,hora_cierre";
const SUPABASE_KEY = "sb_publishable_M_k6UDXHwXZ7lvMSYQWp2w_iOEUIa23";

self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.mode !== "navigate") return;

  event.respondWith((async () => {
    try {
      return await fetch(req);
    } catch (_) {
      return fetch(req);
    }
  })());
});

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) {}

  const title = data.title || "🎾 Pádel Beariz";
  const options = {
    body: data.body || "Nueva solicitud de cancelación.",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
    tag: "padel-cancelacion",
    renotify: true
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
