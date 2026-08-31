import { createApp, h } from 'vue'
import { RouterView } from 'vue-router'

// CSS: Vuetify-Komponenten-Styles kommen über vite-plugin-vuetify (autoImport),
// die Basis-Styles (Reset, v-app-Layout) über 'vuetify/styles'; zusätzlich:
import 'vuetify/styles'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import './assets/style.css'

import { installRouter } from './plugins/router'
import { useLogin } from './plugins/auth'
import { useVuetify } from './plugins/vuetify'
import { useForm } from './forms/main'
import { registerLibComponents } from './lib/import'
import { setupNotifications } from './plugins/notify'
import { useServiceWorker } from './plugins/sw'

export const app = createApp({
  setup() {
    useLogin()
  },
  render: () => h(RouterView)
})

app.use(installRouter())
useVuetify(app)
useForm(app)
registerLibComponents(app)

setupNotifications()
useServiceWorker('sw.js', (doUpdate) => {
  if (window.confirm('Eine neue Version ist verfügbar willst du sie laden?')) {
    doUpdate()
  }
})

app.mount('#app')
