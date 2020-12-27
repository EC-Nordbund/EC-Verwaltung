import Vue from 'vue';
import formular from './formular.vue';
import dialog from './wrapper/wrapperDialog.vue';
import anmeldung from './wrapper/anmeldung.vue';
import selector from './wrapper/wrap.vue';
import VeeValidate, { Validator } from 'vee-validate';
// @ts-ignore
import de from 'vee-validate/dist/locale/de';

Vue.use(VeeValidate);
Validator.localize('de', de);

Validator.extend('has_upper', {
  validate: (value: string) => value.match(/[A-Z]/g) !== null,
  getMessage: () => 'Enthält keine Großbuchstaben'
});

Validator.extend('has_lower', {
  validate: (value: string) => value.match(/[a-z]/g) !== null,
  getMessage: () => 'Enthält keine Kleinbuchstaben'
});

Validator.extend('has_digit', {
  validate: (value: string) => value.match(/[0-9]/g) !== null,
  getMessage: () => 'Enthält keine Ziffer'
});

Validator.extend('has_special', {
  validate: (value: string) => value.match(/[!@#\$%\^\&*+=._\-?]/g) !== null,
  getMessage: () => 'Enthält kein Sonderzeichen (!@#$^&*+=._-?)'
});

Vue.component('formular', formular);
Vue.component('formular-dialog', dialog);
Vue.component('ec-form-anmeldung', anmeldung);
Vue.component('formular-selector', selector);


import adresse from './formElements/adresse.vue';
import alert from './formElements/alert.vue';
import autocomplete from './formElements/autocomplete.vue';
import checkbox from './formElements/checkbox.vue';
import date from './formElements/date.vue';
import input from './formElements/input.vue';
import label from './formElements/label.vue';
import password from './formElements/password.vue';
import radio from './formElements/radio.vue';
import rating from './formElements/rating.vue';
import stepper from './formElements/stepper.vue';
// @ts-ignore
import sw from './formElements/switch.vue';
import text from './formElements/text.vue';
import time from './formElements/time.vue';

Vue.component('form_adresse', adresse);
Vue.component('form_alert', alert);
Vue.component('form_autocomplete', autocomplete);
Vue.component('form_checkbox', checkbox);
Vue.component('form_date', date);
Vue.component('form_input', input);
Vue.component('form_label', label);
Vue.component('form_password', password);
Vue.component('form_radio', radio);
Vue.component('form_rating', rating);
Vue.component('form_stepper', stepper);
Vue.component('form_switch', sw);
Vue.component('form_text', text);
Vue.component('form_time', time);
