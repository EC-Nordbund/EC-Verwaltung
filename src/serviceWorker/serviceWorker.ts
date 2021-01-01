import resourceList from 'resource-list:'
import icon from '../icons/ec-logo-512.png'
const VERSION = '4.0.0'

const _self: ServiceWorkerGlobalScope & typeof globalThis = self as any

const CACHE_NAME = `CACHE_${VERSION}`

_self.addEventListener('install', (ev) => {
  const resourcesToCache = resourceList.filter(
    (item) => item !== 'sw.js' && !item.includes('manifest')
  )
  const toCache = ['/', ...resourcesToCache]

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
    icon: icon
  })
})
