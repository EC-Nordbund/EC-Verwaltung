import vorwahlen from '../data/vorwahl'
import Vue from 'vue'

export const telefonFormater = (value: string) => {
  let numOnly = value.replace(/\D/g, '')
  let ret = ''
  let found = false
  let find = vorwahlen
  if (numOnly.substr(0, 4) === '0049') {
    numOnly = '0' + numOnly.substr(4)
  }
  if (numOnly.substr(0, 2) === '00') {
    return numOnly
  } else {
    numOnly.split('').forEach((char, id) => {
      if (id === 0) {
        ret = ret + char
        return
      }
      if (!found) {
        find = find[char]
        if (find === void 0) {
          found = true
          ret = ret + ' '
        }
      }
      ret = ret + char
    })
    return ret
  }
}

Vue.filter('telefon', telefonFormater)
