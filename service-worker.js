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

  if (req.url === "https://beariz.org/wp-content/downloads/escudo/beariz-seal.svg") {
    event.respondWith(fetch("https://www.bandomovil.com/img_web/logo/beariz.png"));
    return;
  }

  if (req.mode !== "navigate") return;

  event.respondWith((async () => {
    try {
      const response = await fetch(req);
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;

      const html = await response.text();
      const centered = html.replace(
        '<h1 style="display:flex;align-items:center;justify-content:center;gap:10px"><img src="https://beariz.org/wp-content/downloads/escudo/beariz-seal.svg" alt="Escudo de Beariz" style="height:52px;width:52px;object-fit:contain"><span>🎾 Pádel Beariz</span><img src="https://beariz.org/wp-content/downloads/escudo/beariz-seal.svg" alt="Escudo de Beariz" style="height:52px;width:52px;object-fit:contain"></h1>',
        '<h1 style="position:relative;display:flex;align-items:center;justify-content:center;min-height:52px;margin:0 0 4px"><img src="https://beariz.org/wp-content/downloads/escudo/beariz-seal.svg" alt="Escudo de Beariz" style="position:absolute;left:0;height:52px;width:52px;object-fit:contain"><span style="text-align:center">🎾 Pádel Beariz</span><img src="https://beariz.org/wp-content/downloads/escudo/beariz-seal.svg" alt="Escudo de Beariz" style="position:absolute;right:0;height:52px;width:52px;object-fit:contain"></h1>'
      );

      return new Response(centered, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });
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
