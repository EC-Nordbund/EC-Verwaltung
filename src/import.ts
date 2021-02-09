import * as cookie from './util/cookie.util'
import * as filter from './util/filter.util'
import * as icon from './util/icon.util'

const m = [cookie, filter, icon]
import Vue from 'vue'
import './lib/import'
const tmpUtil: any = {}
m.forEach((util: any) => {
  tmpUtil[util.name || util.default.name] = util.default || {}
})
Vue.prototype.$util = tmpUtil
