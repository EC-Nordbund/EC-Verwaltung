import vorwahlen from '../data/vorwahl'

// Vue-3: Filter existieren nicht mehr — die Funktion wird direkt
// importiert und im Template aufgerufen: {{ telefonFormater(x) }}
export const telefonFormater = (value?: string) => {
  // Vor dem Laden der Daten kann undefined ankommen — leer rendern statt werfen
  if (!value) return ''
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
