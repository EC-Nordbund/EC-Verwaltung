import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from 'rollup-plugin-postcss'
import esbuild from 'rollup-plugin-esbuild'
import { terser } from 'rollup-plugin-terser'
import vue from 'rollup-plugin-vue'
import visualizer from 'rollup-plugin-visualizer';

import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer'

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
    // only include needed dependencies
    dependencieCheck({
      throwAtMissing: isProduction
    }),
    {
      transform(code, id) {
        if (code.includes('require(\'vue\')') && (id.includes('@vue/comp') || id.includes('@vue\\comp'))) {
          return `import Vuefaslkj from 'vue'
          ${code.replace('require(\'vue\')', 'Vuefaslkj')}
          `
        }
      }
    },
    // Import Version
    version(),
    // // Use Workers with comlink
    // comlink({
    //   useModuleWorker: true
    // }),
    // workers(),
    // Import list of all assets
    resourceList(),
    // Import JSON5 docs
    json(),
    // Use images
    image(),
    // Transpile TS
    esbuild({
      target: 'es2017',
      tsconfig: './base-tsconfig.json'
    }),
    // Transpile vue files
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
    // Set Production mode
    replace(),
    // Use commonJS and Node Modules
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    // Route import
    routes(),
    // CSS hanndling
    postcss({
      to: 'bundle.css',
      plugins: [
        autoprefixer(),
        ...(isProduction ? [cssnano()] : [])
      ],
      extract: true
    }),
    // Assets building
    icons(),
    // CSS Assets parser and require
    cssAssets(),
    visualizer({
      brotliSize: true,
      gzipSize: true
    }),
    // Minify or Serve
    ...(isProduction ? [terser()] : [serve()])
  ]
}
