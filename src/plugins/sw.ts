import Vue from 'vue'
import sw from 'sw:./serviceWorker'
sw()
onUpdate((doUpdate) => {
  if (
    window.confirm('Eine neue Version ist verf\xFCgbar willst du sie laden?')
  ) {
    doUpdate()
  }
})
export async function subscribe() {
  const sw2 = await navigator.serviceWorker.ready
  const subscription =
    (await sw2.pushManager.getSubscription()) ||
    (await sw2.pushManager.subscribe({
      applicationServerKey:
        'BIQomXQQe3hm61uhQrGJX5izbSZOjuAtXCdX1D7AYvR9IZVr9xExPrzJdzRDe8tnW4LmoxRoFfXxySL3wCPKr9Q',
      userVisibleOnly: true
    }))
  await fetch(`https://api.ec-nordbund.de/v6/subscribe`, {
    method: 'POST',
    headers: {
      authorization: Vue.prototype.$authToken(),
      'content-type': 'application/json'
    },
    body: JSON.stringify({ subscription })
  })
}
async function onUpdate(updateReadyCB) {
  if (!navigator.serviceWorker) {
    return
  }
  if (!navigator.serviceWorker.controller) {
    return
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    location.reload()
  })
  const updateFactory = (sw2) => () => sw2.postMessage({ msg: 'update-sw' })
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration.waiting) {
    updateReadyCB(updateFactory(registration.waiting))
    return
  }
  if (registration.installing) {
    updateReadyCB(updateFactory(registration.installing))
    return
  }
  registration.addEventListener('updatefound', () => {
    const sw2 = registration.installing
    if (!sw2) {
      return
    }
    sw2.addEventListener('statechange', () => {
      if (sw2.state === 'installed') {
        updateReadyCB(updateFactory(sw2))
      }
    })
  })
}
