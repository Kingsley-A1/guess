/* One-time migration from the vanilla prototype. This worker does not cache. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('king-guesser-')).map(key => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
    const windows = await self.clients.matchAll({type:'window'});
    await Promise.all(windows.map(client => client.navigate(client.url)));
  })());
});
