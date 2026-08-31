const handled = new WeakSet<ServiceWorker>()

export async function useServiceWorker(
  path: string,
  cb: (update: () => void) => void
) {
  // Im Dev-Modus keinen Service Worker registrieren (cache-first würde jeden
  // neuen Build verstecken) und Altlasten aus früheren Sessions entfernen.
  if (!import.meta.env.PROD) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    registrations.forEach((r) => r.unregister())
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys()
      keys.forEach((k) => caches.delete(k))
    }
    return
  }

  // Alt-Bug: register() wurde nicht awaited — getRegistration() lieferte dann
  // je nach Timing undefined und registration.waiting warf.
  const registration = await navigator.serviceWorker.register(path)

  navigator.serviceWorker.addEventListener('controllerchange', () =>
    location.reload()
  )

  function handleServiceWorker(sw: ServiceWorker) {
    if (!sw || handled.has(sw)) {
      return
    }

    handled.add(sw)

    function check() {
      if (sw.state === 'installed') {
        cb(() => sw.postMessage({ msg: 'update-sw' }))
      }
      if (sw.state === 'redundant') {
        sw.removeEventListener('statechange', check)
      }
    }

    sw.addEventListener('statechange', check, {})
    check()
  }

  handleServiceWorker(registration.waiting)
  handleServiceWorker(registration.installing)

  registration.addEventListener('updatefound', () => {
    handleServiceWorker(registration.installing)
  })
}
