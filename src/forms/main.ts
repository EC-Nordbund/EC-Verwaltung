import formular2 from './formular.vue'
import dialog from './wrapper/wrapperDialog.vue'
import anmeldung2 from './wrapper/anmeldung.vue'
import selector from './wrapper/wrap.vue'
import VeeValidate, { Validator } from 'vee-validate'
import de2 from 'vee-validate/dist/locale/de'
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

import { createApp } from '@vue/composition-api'

export function useForm(app: ReturnType<typeof createApp>) {
  app.component('Formular', formular2)
  app.component('FormularDialog', dialog)
  app.component('EcFormAnmeldung', anmeldung2)
  app.component('FormularSelector', selector)
  app.component('FormAdresse', adresse2)
  app.component('FormAlert', alert2)
  app.component('FormAutocomplete', autocomplete2)
  app.component('FormCheckbox', checkbox2)
  app.component('FormDate', date2)
  app.component('FormInput', input2)
  app.component('FormLabel', label2)
  app.component('FormPassword', password2)
  app.component('FormRadio', radio2)
  app.component('FormRating', rating2)
  app.component('FormStepper', stepper2)
  app.component('FormSwitch', sw)
  app.component('FormText', text2)
  app.component('FormTime', time2)
}

export function useValidation(app: ReturnType<typeof createApp>) {
  app.use(VeeValidate)
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
    getMessage: () => 'Enthält kein Sonderzeichen (!@#$^&*+=._-?)'
  })
}
