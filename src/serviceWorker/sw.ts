const VERSION = '4.0.0'

// Injection-Point von vite-plugin-pwa (injectManifest): workbox sucht wörtlich
// nach "self.__WB_MANIFEST" im gebauten Code — daher der direkte self-Zugriff
// hier (eine Zwischenvariable würde vom Minifier umbenannt).
type WBEntry = string | { url: string; revision: string | null }

const resourceList = ((self as any).__WB_MANIFEST as WBEntry[]).map((entry) =>
  typeof entry === 'string' ? entry : entry.url
)

const _self = self as unknown as ServiceWorkerGlobalScope

const CACHE_NAME = `CACHE_${VERSION}`

_self.addEventListener('install', (ev) => {
  const resourcesToCache = resourceList.filter(
    (item) => item !== 'sw.js' && !item.includes('manifest')
  )
  // Deduplizieren: vite-plugin-pwa kann Einträge doppelt listen (z. B. Icons
  // aus public/ + Manifest) und Cache.addAll lehnt Duplikate hart ab.
  const toCache = [...new Set(['/', ...resourcesToCache])]

  ev.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(toCache)
    })()
  )
})
_self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    (async () => {
      const keys = await caches.keys()

      await Promise.all(
        keys.map(async (key) => {
          if (key === CACHE_NAME) {
            return true
          }
          return caches.delete(key)
        })
      )
    })()
  )
})
_self.addEventListener('fetch', (ev) => {
  if (
    !ev.request.url.startsWith('https://verwaltung') &&
    !ev.request.url.startsWith('http://localhost')
  ) {
    return
  }

  ev.respondWith(
    (async () => {
      const cache = await caches.match(ev.request)
      if (cache) {
        return cache
      }

      return fetch(ev.request)
    })()
  )
})
_self.addEventListener('message', (ev) => {
  if (ev.data && ev.data.msg === 'update-sw') {
    _self.skipWaiting()
  }
})

_self.addEventListener('push', (ev) => {
  const content = ev.data!.json()

  _self.registration.showNotification(content.title, {
    body: content.body,
    icon: 'favicon.png'
  })
})
