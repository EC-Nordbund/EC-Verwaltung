import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import VuetifyDialog from 'vuetify-dialog'
import auth2 from './plugins/auth'
import router2 from './router'
import './import'
import './forms/main'
import './assets/style.css'
import './config/form'
import './plugins/apollo'
import './plugins/notify'
import './plugins/telefonFilter'
import './plugins/vuetify'
import './plugins/sw'
import './data/plzs'
import './data/vorwahl'
import 'vuetify/dist/vuetify.min.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
])

Vue.use(VuetifyDialog)
auth2(router2, createVue)

// eslint-disable-next-line @typescript-eslint/no-empty-function
Vue.prototype.$empty = () => {}

function createVue() {
  new Vue({
    router: router2,
    render: (h) => h('router-view')
  }).$mount('#app')
}
