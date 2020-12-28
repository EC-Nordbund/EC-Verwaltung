import eslint from '@rollup/plugin-eslint'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'

import url from 'postcss-url'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'

import image from './rollup-plugins/image'
import serve from './rollup-plugins/serve'
import routes from './rollup-plugins/routes'
import sw from './rollup-plugins/sw'
import replace from './rollup-plugins/replace'
import json from './rollup-plugins/json'

export default {
  input: './src/main.ts',
  output: {
    dir: 'public',
    format: 'es'
  },
  plugins: [
    sw({
      path: 'sw.js'
    }),
    json(),
    image(),
    esbuild({
      target: 'es2017'
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
        url({
          url: 'inline'
        }),
        autoprefixer(),
        ...(process.env.NODE_ENV !== 'production' ? [] : [cssnano()])
      ],
      extract: true
    }),
    eslint({
      throwOnError: true
    }),
    ...(process.env.NODE_ENV !== 'production' ? [serve()] : [terser()])
  ]
}
