import Vue from 'vue';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

onUpdate((doUpdate) => {
  if (window.confirm('Eine neue Version ist verfügbar willst du sie laden?')) {
    doUpdate();
  }
});

export async function subscribe() {
  const sw = await navigator.serviceWorker.ready;

  const subscription: PushSubscription =
    (await sw.pushManager.getSubscription()) ||
    (await sw.pushManager.subscribe({
      applicationServerKey:
        'BIQomXQQe3hm61uhQrGJX5izbSZOjuAtXCdX1D7AYvR9IZVr9xExPrzJdzRDe8tnW4LmoxRoFfXxySL3wCPKr9Q',
      userVisibleOnly: true
    }));

  await fetch(`https://api.ec-nordbund.de/v6/subscribe`, {
    method: 'POST',
    headers: {
      'authorization': Vue.prototype.$authToken(),
      'content-type': 'application/json'
    },
    body: JSON.stringify({ subscription })
  });
}

(window as any).sub = subscribe;

async function onUpdate(updateReadyCB: (doUpdate: () => void) => void) {
  if (!navigator.serviceWorker) {
    return;
  }

  if (!navigator.serviceWorker.controller) {
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', (ev) => {
    location.reload();
  });

  const updateFactory = (sw: ServiceWorker) => () =>
    sw.postMessage({ msg: 'update-sw' });

  const registration = (await navigator.serviceWorker.getRegistration())!;

  if (registration.waiting) {
    updateReadyCB(updateFactory(registration.waiting));
    return;
  }

  if (registration.installing) {
    updateReadyCB(updateFactory(registration.installing));
    return;
  }

  registration.addEventListener('updatefound', (ev) => {
    const sw = registration.installing;

    if (!sw) {
      return;
    }

    sw.addEventListener('statechange', (ev) => {
      if (sw.state === 'installed') {
        updateReadyCB(updateFactory(sw));
      }
    });
  });
}
