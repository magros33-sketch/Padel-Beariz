const CONFIG_URL = "https://jppsqrbpjwulzapyvpim.supabase.co/rest/v1/configuracion?id=eq.1&select=precio_reserva,duracion_minutos,hora_apertura,hora_cierre,admin_pin";
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
    let response;
    try {
      response = await fetch(req);
    } catch (_) {
      return fetch(req);
    }

    try {
      const type = response.headers.get("content-type") || "";
      if (!type.includes("text/html")) return response;

      let html = await response.text();
      const injected = `<script>
(async function(){
  try{
    const r=await fetch(${JSON.stringify(CONFIG_URL)},{headers:{apikey:${JSON.stringify(SUPABASE_KEY)},Authorization:'Bearer '+${JSON.stringify(SUPABASE_KEY)}}});
    if(!r.ok)return;
    const rows=await r.json();
    const c=rows&&rows[0];
    if(!c)return;
    const cfg=JSON.parse(localStorage.getItem('padelConfig')||'{}');
    const newPrice=Number(c.precio_reserva);
    if(Number.isFinite(newPrice))cfg.price=newPrice;
    if(Number.isFinite(Number(c.duracion_minutos)))cfg.duration=Number(c.duracion_minutos);
    if(c.hora_apertura)cfg.start=String(c.hora_apertura).slice(0,5);
    if(c.hora_cierre)cfg.end=String(c.hora_cierre).slice(0,5);
    if(typeof c.admin_pin==='string' && c.admin_pin) localStorage.setItem('padelPin',c.admin_pin);
    localStorage.setItem('padelConfig',JSON.stringify(cfg));
    if(typeof data!=='undefined'){
      data.price=cfg.price;
      data.duration=cfg.duration||90;
      data.start=cfg.start||'09:00';
      data.end=cfg.end||'00:00';
    }
    const p=document.getElementById('priceText');
    if(p)p.textContent=cfg.price===0?'Gratis':'€'+cfg.price;
    const d=document.getElementById('durText');
    if(d)d.textContent=cfg.duration||90;
    if(typeof render==='function')render();
  }catch(e){}
})();
</script>`;

      html = html.replace(/<\/body>/i, injected + "</body>");
      const headers = new Headers();
      headers.set("content-type", "text/html; charset=utf-8");
      return new Response(html, {status: response.status, statusText: response.statusText, headers});
    } catch (_) {
      return response;
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