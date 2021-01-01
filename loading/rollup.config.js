import postcss from 'rollup-plugin-postcss';
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
