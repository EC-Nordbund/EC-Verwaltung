<template lang="pug">
.adresse
  v-text-field.strasse(
    label='Straße',
    counter='50',
    required,
    :model-value='(value || {}).strasse',
    @update:model-value='changeValue({ ort: value.ort, plz: value.plz, strasse: $event })',
    :rules='strasseRules'
  )
  v-autocomplete.plz(
    :model-value='(value || {}).plz',
    label='PLZ',
    @update:model-value='plzChange',
    required,
    :items='plz',
    :rules='plzRules'
  )
  //- Der frühere Tippfehler `v-validat.initial` sorgte dafür, dass der Ort
  //- nie validiert wurde — jetzt (dokumentierter Bugfix) required.
  v-autocomplete.ort(
    :model-value='(value || {}).ort',
    label='Ort',
    @update:model-value='changeValue({ plz: value.plz, ort: $event, strasse: value.strasse })',
    :items='map[(value || {}).plz]',
    :disabled='!(value || {}).plz',
    :rules='ortRules'
  )
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'
import { compileRules } from '../rules'
import plzs from '../../data/plzs'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue } = useField(props, emit)

const map: any = plzs
const plz = Object.keys(plzs)

const strasseRules = compileRules('required|max:50', 'Straße')
const plzRules = compileRules('required', 'PLZ')
const ortRules = compileRules('required', 'Ort')

function plzChange($event: string) {
  if (map[$event].length === 1) {
    changeValue({
      ort: map[$event][0],
      plz: $event,
      strasse: props.value.strasse
    })
  } else {
    changeValue({
      ort: undefined,
      plz: $event,
      strasse: props.value.strasse
    })
  }
}
</script>

<style scoped>
.strasse {
  grid-area: s;
}
.plz {
  grid-area: p;
}
.ort {
  grid-area: o;
}
.adresse {
  display: grid;
  grid-template-columns: 100px 1fr;
  grid-gap: 10px;
  grid-template-areas: 's s' 'p o';
}
</style>
