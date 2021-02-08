import definePlugin from './helper'

export default ({ throwAtMissing } = { throwAtMissing: false }) => {
  const okModules = [
    // Core Framework
    'vue',
    'vue-router',
    // Klassen als Vue-Componenten
    'vue-property-decorator',
    'vue-class-component',
    // UI-Framework
    'vuetify-dialog',
    'vuetify',
    'vee-validate',
    // Fonts
    'roboto-fontface',
    'material-design-icons-iconfont',
    // GraphQL, Apollo + Deps
    'graphql',
    'graphql-tag',
    '@apollo/client',
    'ts-invariant',
    'fast-json-stable-stringify',
    'zen-observable',
    'symbol-observable',
    '@wry/equality',
    '@wry/trie',
    '@wry/context',
    'optimism',
    '@ungap/global-this',
    // Helpers
    'tslib',
    'vue-runtime-helpers',
    // Vue 3
    '@vue/composition-api',
    'vue-composable'
  ];


  const module = new Set();

  return definePlugin({
    name: 'dependecie-check',
    resolveId(id) {
      if (id.startsWith('.') || id.replace('D:', '').indexOf(':') !== -1) {
        return;
      } else {
        id = id.split('?')[0].replace(/\x00/g, '/');

        if (id.endsWith('.vue')) {
          return;
        }

        const _ = id.split(/\\|\//);

        if (_[0][0] === '@') {
          module.add(`${_[0]}/${_[1]}`);
        } else if (id.indexOf('.yarn') !== -1) {
          const nID = id.split(/cache/)[1];
          module.add(nID.split(/\\|\//)[1].split('-npm')[0]);
        } else {
          module.add(_[0]);
        }
      }
    },
    generateBundle() {
      okModules.forEach(v => {
        module.delete(v);
      });

      module.delete('');

      module.forEach(m => {
        if (throwAtMissing) {
          this.error(`Module ${m} wurde eingebunden aber nicht erwartet!`);
        } else {
          this.warn(`Module ${m} wurde eingebunden aber nicht erwartet!`);
        }
      });
    }
  })
}
