import type { App } from 'vue'

import editAK from './editAK.form.lib.vue'
import anmeldungKontakt from './anmeldungKontakt.form.lib.vue'
import mergeAdresse from './adresseMerge.form.lib.vue'

import wrapper from './wrapper.lib.vue'
import search from './search.lib.vue'
import add from './lesezeichen.add.lib.vue'
import show from './lesezeichen.show.lib.vue'
import dialogHost from './dialogHost.lib.vue'

export function registerLibComponents(app: App) {
  app.component('EcWrapper', wrapper)
  app.component('EcSearch', search)
  app.component('EcLesezeichenAdd', add)
  app.component('EcLesezeichenShow', show)

  app.component('EcFormEditAk', editAK)
  app.component('EcAnmeldungKontakt', anmeldungKontakt)
  app.component('EcAdresseMerge', mergeAdresse)

  app.component('EcDialogHost', dialogHost)
}
