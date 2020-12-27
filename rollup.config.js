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
import analyze from 'rollup-plugin-analyzer'

import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import url from 'postcss-url';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';


export default {
  input: 'src/main.ts',
  output: {
    file: 'public/bundle.js',
    format: 'es'
  },
  plugins: [
    // analyze(),
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
      // alternatively, one could pass process.env.NODE_ENV or 'development` to stringify
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    // terser(),
    postcss({
      plugins: [
        // simplevars(),
        // nested(),
        // cssnext({ warnForDuplicates: false, }),
        // cssnano(),
        url({
          url: 'inline',
          // assetsPath: 'assets',
          // useHash: true
        }),
        ...(process.env.NODE_ENV !== 'production' ? [] : [cssnano()])
      ],
      extract: true,
      // extensions: ['.css']
    }),
    // if watched:
    ...(process.env.NODE_ENV !== 'production' ? [
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
    ] : [
        terser()
      ])
  ]
}