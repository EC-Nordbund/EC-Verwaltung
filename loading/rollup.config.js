import image from '@rollup/plugin-image';
import postcss from 'rollup-plugin-postcss';
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import url from 'postcss-url';
import cssnano from 'cssnano';


export default {
  input: 'src/main.ts',
  output: {
    file: 'public/loading.js',
    format: 'es'
  },
  plugins: [
    image(),
    esbuild({
      target: 'es2017'
    }),
    postcss({
      plugins: [
        url({
          url: 'inline',
        }),
        cssnano()
      ],
      extract: true
    }),
    terser()
  ]
}