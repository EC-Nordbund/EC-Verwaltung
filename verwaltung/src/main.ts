import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import VuetifyDialog from 'vuetify-dialog';
import auth from './plugins/auth';
import router from './router';
import './import';
import './forms/main';
import './assets/style.css';
import './config/form';
import './plugins/apollo';
import './plugins/notify';
import './plugins/telefonFilter';
import './plugins/vuetify';
import './plugins/sw';

import './data/plzs';
import './data/vorwahl';

import 'vuetify/dist/vuetify.min.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

// console.log(a,b,c)

// import 'css:needed.css';

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
]);

Vue.use(VuetifyDialog);

auth(router, createVue);

Vue.prototype.$empty = () => {};

function createVue() {
  const app = new Vue({
    router,
    render: (h) => h('router-view')
  }).$mount('#app');

  // @ts-ignore
  window.app = app;

  return app;
}
