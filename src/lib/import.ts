import Vue from 'vue'

import editAK from './editAK.form.lib.vue'
import anmeldungKontakt from './anmeldungKontakt.form.lib.vue'
import mergeAdresse from './adresseMerge.form.lib.vue'

import wrapper from './wrapper.lib.vue'
import search from './search.lib.vue'
import add from './lesezeichen.add.lib.vue'
import show from './lesezeichen.show.lib.vue'

Vue.component('EcWrapper', wrapper)
Vue.component('EcSearch', search)
Vue.component('EcLesezeichenAdd', add)
Vue.component('EcLesezeichenShow', show)

Vue.component('EcFormEditAk', editAK)
Vue.component('EcAnmeldungKontakt', anmeldungKontakt)
Vue.component('EcAdresseMerge', mergeAdresse)
