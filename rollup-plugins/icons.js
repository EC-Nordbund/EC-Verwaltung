import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import definePlugin from './helper'

import { render } from 'pug'

let fileIDs

export default () => {
  return definePlugin({
    name: 'icons',

    buildStart() {
      fileIDs = readdirSync('./src/icons').map((f) => {
        return this.emitFile({
          type: 'asset',
          name: f,
          source: readFileSync(join('./src/icons', f))
        })
      })

      this.emitFile({
        type: 'asset',
        fileName: 'favicon.png',
        source: readFileSync(join('./src/icons', 'ec-logo-256.png'))
      })
    },
    generateBundle(_outputOptions, bundle) {
      const icons = fileIDs
        .map((v) => this.getFileName(v))
        .map((v) => [v, v.split('-')[2]])

      const manifest = {
        name: 'EC-Nordbund Verwaltungs-App',
        short_name: 'EC-Verwaltung',
        start_url: '/',
        display: 'standalone',
        theme_color: '#8fb217',
        background_color: '#eef3dc',
        description:
          'Software für den EC-Nordbund die uns bei der Verwaltung hilft.',
        icons: icons.map((v) => ({
          src: v[0],
          sizes: `${v[1]}x${v[1]}`,
          type: 'image/png',
          purpose: 'any maskable'
        }))
      }

      const files = Object.keys(bundle).filter(
        (v) =>
          v !== 'sw.js' &&
          !v.endsWith('.html') &&
          !v.endsWith('.webmanifest') &&
          v !== 'favicon.png'
      )

      // console.log(files)

      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: render(readFileSync('./src/index.pug'), { ...manifest, files })
      })

      this.emitFile({
        type: 'asset',
        fileName: 'manifest.webmanifest',
        source: JSON.stringify(manifest)
      })
    }
  })
}
