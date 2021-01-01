import Vue from 'vue'
import Vuetify from 'vuetify'
import { theme as theme2 } from '../config/theme'
Vue.use(Vuetify, {
  theme: theme2,
  iconfont: 'md'
})
Vue.directive('font', {
  bind: (el) => {
    el.style.fontFamily = 'ec-font'
  }
})
for (const key in theme2) {
  if (theme2.hasOwnProperty(key)) {
    const element = theme2[key]
    Vue.directive(key, {
      bind: (el) => {
        el.style.color = element
      }
    })
    Vue.directive(`${key}-bg`, {
      bind: (el) => {
        el.style.backgroundColor = element
      }
    })
  }
}
