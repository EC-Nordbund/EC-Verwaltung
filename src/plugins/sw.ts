const handled = new WeakSet<ServiceWorker>()

export async function useServiceWorker(
  path: string,
  cb: (update: () => void) => void
) {
  navigator.serviceWorker.register(path)

  navigator.serviceWorker.addEventListener('controllerchange', location.reload)

  const registration = await navigator.serviceWorker.getRegistration()

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
