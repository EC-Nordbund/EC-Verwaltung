import { createVuetify } from 'vuetify'
import { md } from 'vuetify/iconsets/md'
import { de } from 'vuetify/locale'
import type { App } from 'vue'
import { theme as theme2 } from '../config/theme'

export function useVuetify(app: App) {
  app.use(
    createVuetify({
      theme: {
        // expliziter Default (kein 'system'!)
        defaultTheme: 'light',
        themes: {
          light: {
            colors: { ...theme2 }
          },
          dark: {
            dark: true,
            colors: { ...theme2 }
          }
        }
      },
      icons: {
        // Material-Icons-Font wie bisher (Icon-Namen bleiben erhalten)
        defaultSet: 'md',
        sets: { md }
      },
      locale: {
        locale: 'de',
        messages: { de }
      }
    })
  )

  app.directive('font', {
    mounted: (el) => {
      el.style.fontFamily = 'ec-font'
    }
  })

  for (const key in theme2) {
    if (Object.prototype.hasOwnProperty.call(theme2, key)) {
      const element = (theme2 as Record<string, string>)[key]
      app.directive(key, {
        mounted: (el) => {
          el.style.color = element
        }
      })
      app.directive(`${key}-bg`, {
        mounted: (el) => {
          el.style.backgroundColor = element
        }
      })
    }
  }
}
