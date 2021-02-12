import Vue from 'vue'

export function useNotification() {
  return {
    createNotification({ title, body }: { title: string; body: string }) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: require('../icons/ec-logo-512.png')
        })
      }
    }
  }
}

Vue.prototype.$notifikation = (title, body) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      body,
      icon: '/img/ec-logo-512.361ca3c3.png'
    })
  }
}

if (Notification.permission === 'default') {
  Notification.requestPermission()
}
