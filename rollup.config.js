import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
import jsonParse from 'rollup-plugin-json-parse'

import comlink from '@surma/rollup-plugin-comlink'
import workers from '@surma/rollup-plugin-off-main-thread'

import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'

import image from './rollup-plugins/image'
import serve from './rollup-plugins/serve'
import routes from './rollup-plugins/routes'
import serviceWorker from './rollup-plugins/sw'
import replace from './rollup-plugins/replace'
import json from './rollup-plugins/json'
import resourceList from './rollup-plugins/resource-list'
import icons from './rollup-plugins/icons'
import version from './rollup-plugins/version'

import dependencieCheck from './rollup-plugins/dependencieCheck'
import cssAssets from './rollup-plugins/cssAssets'

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
      throwAtMissing: process.env.NODE_ENV === 'production'
    }),
    comlink({
      useModuleWorker: true
    }),
    version(),
    workers(),
    serviceWorker({
      path: 'sw.js'
    }),
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
        ...(process.env.NODE_ENV !== 'production' ? [] : [cssnano()])
      ],
      extract: true
    }),
    icons(),
    cssAssets(),
    jsonParse(),
    ...(process.env.NODE_ENV !== 'production' ? [serve()] : [terser()])
  ]
}
