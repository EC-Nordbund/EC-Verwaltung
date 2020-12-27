import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
import json from "@rollup/plugin-json";
import replace from '@rollup/plugin-replace';

import url from 'postcss-url';
import cssnano from 'cssnano';
import autoprefixer from "autoprefixer";


const buildConfig = {
  input: 'src/main.ts',
  output: {
    file: 'public/bundle.js',
    format: 'es'
  },
  plugins: [
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
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    postcss({
      plugins: [
        autoprefixer({}),
        url({
          url: 'inline'
        }),
        ...(process.env.NODE_ENV !== 'production' ? [] : [cssnano()])
      ],
      extract: true
    })
  ]
}

if (process.env.NODE_ENV !== 'production') {
  buildConfig.plugins.concat([
    serve({
      open: true,
      openPage: '/',
      contentBase: 'public',
      historyApiFallback: true,
      host: 'localhost',
      port: 8080,
    }),
    livereload({
      watch: 'public'
    })
  ])
} else {
  buildConfig.plugins.concat([
    terser()
  ])
}

export default buildConfig