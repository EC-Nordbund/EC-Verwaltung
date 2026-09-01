<template lang="pug">
formular-dialog(v-bind='config', ref='form')
</template>

<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue'
import { ecForm } from '../../config/form'
import FormularDialog from './wrapperDialog.vue'

defineOptions({ name: 'FormularSelector' })

const props = defineProps({
  name: { type: String, required: true },
  // Ersetzt die frühere `self`-Prop: Kontext-Objekt für Factory-Configs
  // (ecForm.addFZ/generateFZAntrag/personMerge erwarten jetzt ein explizites
  // Parameter-Objekt statt der Komponenten-Instanz). Aktuell nutzt keine
  // Aufrufstelle den Selector mit einer Factory-Config — die Seiten bauen
  // solche Configs selbst und binden sie direkt an formular-dialog.
  context: { default: undefined }
})

const config = ref<any>({
  title: '',
  initval: {},
  schema: []
})

watch(
  () => props.name,
  (name) => {
    const c = (ecForm as any)[name]
    config.value = typeof c === 'function' ? c(props.context) : c
  },
  { immediate: true }
)

const form = useTemplateRef<InstanceType<typeof FormularDialog>>('form')

function show(...args: any[]) {
  return (form.value as any).show(...args)
}

defineExpose({ show })
</script>
