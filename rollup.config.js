import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'

import { readFileSync } from "fs";

import comlink from "@surma/rollup-plugin-comlink";
import omt from "@surma/rollup-plugin-off-main-thread";

import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'

import image from './rollup-plugins/image'
import serve from './rollup-plugins/serve'
import routes from './rollup-plugins/routes'
import sw from './rollup-plugins/sw'
import replace from './rollup-plugins/replace'
import json from './rollup-plugins/json'
import rList from './rollup-plugins/resource-list'
import icons from "./rollup-plugins/icons";
import version from "./rollup-plugins/version";

import definePlugin from './rollup-plugins/helper'

const cssReplacements = []

export default {
  input: {
    main: './src/main.ts',
    sw: './src/serviceWorker/serviceWorker.ts'
  },
  output: {
    dir: 'dist',
    format: 'es'
  },
  plugins: [
    comlink({
      useModuleWorker: true
    }),
    version(),
    omt(),
    sw({
      path: 'sw.js'
    }),
    rList(),
    json(),
    image(),
    esbuild({
      target: 'es2017',
      tsconfig: './base-tsconfig.json'
    }),
    vue({
      css: true,
      compileTemplate: true,
      template: {
        preprocessOptions: {
          pug: {
            doctype: 'html'
          }
        }
      }
    }),
    replace(),
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    routes(),
    postcss({
      to: 'bundle.css',
      plugins: [
        autoprefixer(),
        ...(process.env.NODE_ENV !== 'production' ? [] : [cssnano()])
      ],
      extract: true
    }),
    icons(),
    definePlugin({
      async load(id) {
        if (id.endsWith('.css')) {
          const code = readFileSync(id, 'utf8')

          let reg = /url\(('|")([a-zA-Z0-9\-\$\\\/\.]*)('|")\)/g

          let m

          do {
            m = reg.exec(code)

            if (m) {
              const requiredFile = m[2]

              const searchString = m[2]

              const resolvedID = await this.resolve(requiredFile, id)

              const parts = requiredFile.split(/\\|\//)

              const _ = this.emitFile({
                type: 'asset',
                name: parts[parts.length - 1],
                source: readFileSync(resolvedID.id)
              })

              cssReplacements.push([searchString, _, id])
            }
          } while (m)

          return code
        }
      },
      generateBundle(options, bundle) {
        console.log(cssReplacements)
        console.log('||')
        cssReplacements.forEach(f => {
          console.log(f[0], '||->', this.getFileName(f[1]))
        })

        Object.keys(bundle).filter(v => v.endsWith('.css')).forEach(cssFile => {
          let code = ''
          let code2 = bundle[cssFile].source.toString()

          while (code !== code2) {
            code = code2

            cssReplacements.forEach(f => {
              code2 = code2.replace(f[0], this.getFileName(f[1]))

              if (f[0].startsWith('./')) {
                const fi = f[0].slice(2)

                code2 = code2.replace(fi, this.getFileName(f[1]))
              }
            })
          }

          bundle[cssFile].source = code2
        })
      }
    }),
    ...(process.env.NODE_ENV !== 'production' ? [serve()] : [terser()])
  ]
}
