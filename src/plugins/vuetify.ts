import Vuetify from 'vuetify'
import { theme as theme2 } from '../config/theme'

import { createApp } from '@vue/composition-api'

export function useVuetify(app: ReturnType<typeof createApp>) {
  app.use(Vuetify, {
    theme: theme2,
    iconfont: 'md'
  })
  app.directive('font', {
    bind: (el) => {
      el.style.fontFamily = 'ec-font'
    }
  })

  for (const key in theme2) {
    if (theme2.hasOwnProperty(key)) {
      const element = theme2[key]
      app.directive(key, {
        bind: (el) => {
          el.style.color = element
        }
      })
      app.directive(`${key}-bg`, {
        bind: (el) => {
          el.style.backgroundColor = element
        }
      })
    }
  }
}
