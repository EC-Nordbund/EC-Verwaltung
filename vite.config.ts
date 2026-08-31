import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue({
      template: {
        preprocessOptions: {
          // WICHTIG (wie alte Rollup-Pipeline, rollup.config.js:73):
          // ohne terse-Modus rendert pug valuelose Attribute als attr="attr"
          // und bricht damit u. a. template(#prepend), v-btn(icon), v-else.
          doctype: 'html'
        }
      }
    }),
    vuetify({ autoImport: true }),
    VitePWA({
      strategies: 'injectManifest',
      // Quelle: src/serviceWorker/sw.ts → Ausgabe: dist/sw.js
      // (Name MUSS sw.js bleiben, plugins/sw.ts registriert 'sw.js')
      srcDir: 'src/serviceWorker',
      filename: 'sw.ts',
      // Registrierung übernimmt weiterhin src/plugins/sw.ts selbst
      injectRegister: null,
      // Manifest-Daten wie früher von rollup-plugins/icons.js generiert
      manifest: {
        name: 'EC-Nordbund Verwaltungs-App',
        short_name: 'EC-Verwaltung',
        lang: 'de-DE',
        categories: ['verwaltung', 'ec-nordbund', 'entschieden für christus'],
        start_url: '/',
        display: 'standalone',
        theme_color: '#8fb217',
        background_color: '#eef3dc',
        description:
          'Software für den EC-Nordbund die uns bei der Verwaltung hilft.',
        icons: [16, 32, 64, 256, 512].map((size) => ({
          src: `icons/ec-logo-${size}.png`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          purpose: 'any maskable'
        }))
      },
      injectManifest: {
        // Wie der alte resource-list-Mechanismus: ALLE Build-Artefakte in die
        // Precache-Liste aufnehmen (sw.js/manifest filtert der SW selbst raus).
        globPatterns: ['**/*']
      }
    })
  ],
  define: {
    __API_BASE__: JSON.stringify(
      process.env.API_BASE ?? 'https://api.ec-nordbund.de'
    )
  },
  optimizeDeps: {
    // Empfehlung von vite-plugin-vuetify: verhindert wiederholte
    // Dep-Re-Optimierung (504 Outdated Optimize Dep) durch autoImport
    exclude: ['vuetify']
  },
  server: {
    port: Number(process.env.DEV_PORT ?? 8080)
  }
})
