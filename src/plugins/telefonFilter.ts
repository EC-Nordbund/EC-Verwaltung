import Vue from 'vue'
Vue.filter('telefon', (value) => {
  let numOnly = value.replace(/\D/g, '')
  let ret = ''
  let found = false
  let find = window.$vorwahlen
  if (numOnly.substr(0, 4) === '0049') {
    numOnly = '0' + numOnly.substr(4)
  }
  if (numOnly.substr(0, 2) === '00') {
    return numOnly
  } else {
    numOnly.split('').forEach((c, id) => {
      if (id === 0) {
        ret = ret + c
        return
      }
      if (!found) {
        find = find[c]
        if (find === void 0) {
          found = true
          ret = ret + ' '
        }
      }
      ret = ret + c
    })
    return ret
  }
})
