import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
import json from "@rollup/plugin-json";

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'iife'
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
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    terser(),
    postcss({
      plugins: [
        simplevars(),
        nested(),
        cssnext({ warnForDuplicates: false, }),
        cssnano(),
      ],
      extensions: ['.css']
    }),
  ]
}