<template lang="pug">
component(:is='tag || "div"')
  component(
    :is='map[field.type]',
    v-for='(field, i) in schema',
    :key='`${i}-form`',
    :schema='field',
    :value='value[field.name]',
    :save='save',
    :cancel='cancel',
    @input='value[field.name] = $event'
  )
</template>

<script setup lang="ts">
import FormAdresse from './formElements/adresse.vue'
import FormAlert from './formElements/alert.vue'
import FormAutocomplete from './formElements/autocomplete.vue'
import FormCheckbox from './formElements/checkbox.vue'
import FormDate from './formElements/date.vue'
import FormInput from './formElements/input.vue'
import FormLabel from './formElements/label.vue'
import FormPassword from './formElements/password.vue'
import FormRadio from './formElements/radio.vue'
import FormRating from './formElements/rating.vue'
import FormStepper from './formElements/stepper.vue'
import FormSwitch from './formElements/switch.vue'
import FormText from './formElements/text.vue'
import FormTime from './formElements/time.vue'

defineProps({
  value: {},
  schema: {},
  tag: {},
  cancel: { required: true },
  save: { required: true }
})

// Explizite Komponenten-Map statt der früheren String-Auflösung
// ('form-' + field.type über globale Registrierung).
// 'select' war früher als Alias FormSelect auf autocomplete registriert.
const map: Record<string, any> = {
  adresse: FormAdresse,
  alert: FormAlert,
  autocomplete: FormAutocomplete,
  select: FormAutocomplete,
  checkbox: FormCheckbox,
  date: FormDate,
  input: FormInput,
  label: FormLabel,
  password: FormPassword,
  radio: FormRadio,
  rating: FormRating,
  stepper: FormStepper,
  switch: FormSwitch,
  text: FormText,
  time: FormTime
}
</script>
