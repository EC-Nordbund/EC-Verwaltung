<template lang="pug">
//- Toter Code: EcFormAnmeldung wird von keiner Seite referenziert.
//- Minimal auf Vue 3 / Vuetify 4 migriert (v-toolbar(app) → v-app-bar,
//- v-content → v-main).
v-app
  v-app-bar(color='primary')
    v-spacer
    h1(style='color: #fff') {{ title }}
    v-spacer
    v-btn(icon, style='color: #fff;', @click='$emit("cancel")')
      v-icon close
  v-main
    v-form(v-model='valid')
      formular(:value='value', :schema='schema', :cancel='onCancel', :save='save')
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Formular from '../formular.vue'

defineOptions({ name: 'EcFormAnmeldung' })

const props = defineProps({
  title: {},
  schema: {},
  initval: {}
})

const emit = defineEmits(['cancel', 'save'])

const valid = ref(false)
const value = ref<any>({})

watch(
  () => props.initval,
  () => {
    value.value = props.initval
  },
  { immediate: true }
)

// Früher wurde `$emit('cancel')` schon beim Rendern als :cancel-Prop
// AUFGERUFEN (Bug im toten Code) — jetzt korrekt als Funktion übergeben.
const onCancel = () => emit('cancel')

function save() {
  emit('save', value.value)
}
</script>
