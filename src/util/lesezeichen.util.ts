export const name = 'lesezeichen'

import Vue from 'vue'

const lesezeichen: {
  [path: string]: { title: string; subTitle: string; fullPath: string }
} = Vue.observable(JSON.parse(localStorage.getItem('lesezeichen') || '{}'))

export default {
  remove(path: string) {
    Vue.delete(lesezeichen, path)
    localStorage.setItem('lesezeichen', JSON.stringify(lesezeichen))
  },
  add(title: string, subTitle: string, fullPath: string, path: string) {
    Vue.set(lesezeichen, path, {
      title,
      subTitle,
      fullPath
    })
    localStorage.setItem('lesezeichen', JSON.stringify(lesezeichen))
  },
  check(path: string): boolean {
    return !!lesezeichen[path]
  },
  lesezeichen
}
