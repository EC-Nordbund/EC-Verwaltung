import * as filter from './util/filter.util'

const m = [filter]
import Vue from 'vue'
import './lib/import'
const tmpUtil: any = {}
m.forEach((util: any) => {
  tmpUtil[util.name || util.default.name] = util.default || {}
})
Vue.prototype.$util = tmpUtil
