const VERSION = "<VERSION>"
const ASSETS = "<ASSETS>"

const __DEV__ = false


if (!__DEV__) {

  /**
   * @type {ServiceWorkerGlobalScope & WindowOrWorkerGlobalScope}
   */
  const _self = self

  const CACHE_NAME = `CACHE_${VERSION}`

  _self.addEventListener('install', ev => {
    ev.waitUntil((async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(ASSETS)
    })())
  })
  _self.addEventListener('activate', ev => {
    ev.waitUntil(
      (async () => {
        const keys = await caches.keys();

        await Promise.all(
          keys.map(async (key) => {
            if (key === CACHE_NAME) {
              return true;
            }
            return caches.delete(key);
          })
        );
      })()
    );
  })
  _self.addEventListener('fetch', ev => {
    if (!ev.request.url.startsWith('https://verwaltung')) {
      return
    }

    ev.respondWith((async () => {
      const cache = await caches.match(ev.request)
      if (cache) {
        return cache
      }

      return fetch(ev.request)
    })())
  })
  _self.addEventListener("message", (ev) => {
    if (ev.data && ev.data.msg === "update-sw") {
      _self.skipWaiting();
    }
  });
} else {
  throw 'SERVICE WORKER DARF IN PRODUCTION NICHT AUF DEV SEIN!'
}