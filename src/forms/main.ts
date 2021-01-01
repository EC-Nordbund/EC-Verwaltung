import Vue from 'vue'
import formular2 from './formular.vue'
import dialog from './wrapper/wrapperDialog.vue'
import anmeldung2 from './wrapper/anmeldung.vue'
import selector from './wrapper/wrap.vue'
import VeeValidate, { Validator } from 'vee-validate'
import de2 from 'vee-validate/dist/locale/de'
Vue.use(VeeValidate)
Validator.localize('de', de2)
Validator.extend('has_upper', {
  validate: (value) => value.match(/[A-Z]/g) !== null,
  getMessage: () => 'Enth\xE4lt keine Gro\xDFbuchstaben'
})
Validator.extend('has_lower', {
  validate: (value) => value.match(/[a-z]/g) !== null,
  getMessage: () => 'Enth\xE4lt keine Kleinbuchstaben'
})
Validator.extend('has_digit', {
  validate: (value) => value.match(/[0-9]/g) !== null,
  getMessage: () => 'Enth\xE4lt keine Ziffer'
})
Validator.extend('has_special', {
  validate: (value) => value.match(/[!@#\$%\^\&*+=._\-?]/g) !== null,
  getMessage: () => 'Enth\xE4lt kein Sonderzeichen (!@#$^&*+=._-?)'
})
Vue.component('Formular', formular2)
Vue.component('FormularDialog', dialog)
Vue.component('EcFormAnmeldung', anmeldung2)
Vue.component('FormularSelector', selector)
import adresse2 from './formElements/adresse.vue'
import alert2 from './formElements/alert.vue'
import autocomplete2 from './formElements/autocomplete.vue'
import checkbox2 from './formElements/checkbox.vue'
import date2 from './formElements/date.vue'
import input2 from './formElements/input.vue'
import label2 from './formElements/label.vue'
import password2 from './formElements/password.vue'
import radio2 from './formElements/radio.vue'
import rating2 from './formElements/rating.vue'
import stepper2 from './formElements/stepper.vue'
import sw from './formElements/switch.vue'
import text2 from './formElements/text.vue'
import time2 from './formElements/time.vue'
Vue.component('FormAdresse', adresse2)
Vue.component('FormAlert', alert2)
Vue.component('FormAutocomplete', autocomplete2)
Vue.component('FormCheckbox', checkbox2)
Vue.component('FormDate', date2)
Vue.component('FormInput', input2)
Vue.component('FormLabel', label2)
Vue.component('FormPassword', password2)
Vue.component('FormRadio', radio2)
Vue.component('FormRating', rating2)
Vue.component('FormStepper', stepper2)
Vue.component('FormSwitch', sw)
Vue.component('FormText', text2)
Vue.component('FormTime', time2)
