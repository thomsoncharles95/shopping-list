const CACHE='shopping-list-v2';
const ASSETS=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin) return;
  // Pages: try the network first so updates arrive straight away, fall back to the saved copy offline.
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(res=>{ const copy=res.clone(); caches.open(CACHE).then(c=>c.put('index.html',copy)); return res; }).catch(()=>caches.match('index.html')));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(req,{ignoreSearch:true});
    const net=fetch(req).then(res=>{ if(res&&res.ok) c.put(req,res.clone()); return res; }).catch(()=>hit);
    return hit||net;
  }));
});
