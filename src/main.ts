import VueCompositionAPI, { createApp } from '@vue/composition-api'
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import './config/form'
import { useForm, useValidation } from './forms/main'
import './import'
import './plugins/apollo'
import { useLogin } from './plugins/auth'
import './plugins/notify'
import { useServiceWorker } from './plugins/sw'
import './plugins/telefonFilter'
import { useVuetify } from './plugins/vuetify'
import { installRouter } from './plugins/router'
import { installDialog } from './plugins/dialog'

import 'vuetify/dist/vuetify.min.css'
import './assets/style.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'

Vue.use(VueCompositionAPI)

export const app = createApp({
  router: installRouter(),
  setup(prop, ctx) {
    useLogin()
  },
  render: (h) => h('router-view')
})

useForm(app)
useValidation(app)
useServiceWorker('sw.js', (doUpdate) => {
  if (window.confirm('Eine neue Version ist verfügbar willst du sie laden?')) {
    doUpdate()
  }
})
useVuetify(app)
installDialog(app)

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
])

// eslint-disable-next-line @typescript-eslint/no-empty-function
Vue.prototype.$empty = () => {}

app.mount('#app')
