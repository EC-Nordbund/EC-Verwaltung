import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'

import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'

import comlink from '@surma/rollup-plugin-comlink'
import workers from '@surma/rollup-plugin-off-main-thread'

import image from './rollup-plugins/image'
import serve from './rollup-plugins/serve'
import routes from './rollup-plugins/routes'
import replace from './rollup-plugins/replace'
import json from './rollup-plugins/json'
import resourceList from './rollup-plugins/resource-list'
import icons from './rollup-plugins/icons'
import version from './rollup-plugins/version'
import dependencieCheck from './rollup-plugins/dependencieCheck'
import cssAssets from './rollup-plugins/cssAssets'

const isProduction = process.env.NODE_ENV === 'production'

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
    dependencieCheck({
      throwAtMissing: isProduction
    }),
    comlink({
      useModuleWorker: true
    }),
    version(),
    workers(),
    resourceList(),
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
        ...(isProduction ? [cssnano()] : [])
      ],
      extract: true
    }),
    icons(),
    cssAssets(),
    ...(isProduction ? [terser()] : [serve()])
  ]
}
