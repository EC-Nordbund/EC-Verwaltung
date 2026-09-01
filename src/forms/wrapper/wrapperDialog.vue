<template lang="pug">
v-dialog(v-model='visible', max-width='400px', v-bind='$attrs')
  v-card
    v-card-title
      h1(color='primary') {{ title }}
    v-card-text
      v-form(ref='formRef')
        formular(
          :value='value',
          :schema='schema',
          :cancel='cancel',
          :save='save'
        )
    v-card-actions
      v-spacer
      v-btn(variant='text', @click='cancel', v-if='!$attrs.noCancel') Abbrechen
      v-btn(color='primary', @click='save') {{ $attrs.saveName || "Speichern" }}
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import Formular from '../formular.vue'

// $attrs (noCancel, saveName, unbekannte Config-Keys) wird wie bisher
// explizit an v-dialog durchgereicht — nicht zusätzlich automatisch vererben.
defineOptions({ name: 'FormularDialog', inheritAttrs: false })

const props = defineProps({
  title: {},
  schema: {},
  initval: {}
})

const visible = ref(false)
const value = ref<any>({})
const formRef = useTemplateRef<any>('formRef')

let res: (val: any) => void = () => {}
let rej: () => void = () => {}

function show(initval = props.initval, addToSchemaTop: any[] = []) {
  addToSchemaTop.forEach((field) => {
    // only add if not exist
    if (
      (props.schema as any[]).every(
        (f: any) => JSON.stringify(f) !== JSON.stringify(field)
      )
    ) {
      ;(props.schema as any[]).unshift(field)
    }
  })

  return new Promise((resolve, reject) => {
    res = resolve
    rej = reject
    value.value = initval
    visible.value = true
  })
}

async function save() {
  // Vuetify-4-API: validate() ist async und liefert { valid }.
  // Ersetzt das frühere :disabled='!valid' — leere Pflichtformulare sind
  // damit nicht mehr speicherbar (dokumentierter Bugfix).
  const { valid } = await formRef.value.validate()
  if (!valid) return
  visible.value = false
  res(value.value)
}

function cancel() {
  visible.value = false
  rej()
}

defineExpose({ show })
</script>
