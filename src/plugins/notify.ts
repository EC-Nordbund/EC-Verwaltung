import Vue from 'vue';

Vue.prototype.$notifikation = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      body,
      icon: '/img/ec-logo-512.361ca3c3.png'
    });
  }
};
