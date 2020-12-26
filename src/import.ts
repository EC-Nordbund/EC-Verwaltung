import Vue from 'vue';
import './lib/import';

const contextUtil = require.context('@/util', true, /\w+\.util.ts/);

const tmpUtil: any = {};

contextUtil.keys().forEach((key) => {
  const util = contextUtil(key);
  tmpUtil[util.name || util.default.name] = util.default || {};
});

Vue.prototype.$util = tmpUtil;
