<template lang="pug">
//- Vuetify-4-Pattern statt :return-value.sync/lazy/$refs.dialog.save():
//- schlichter v-dialog mit eigenem Abbrechen/Speichern-Flow.
//- Der Wert bleibt nach außen wie bisher ein 'HH:mm'-String.
v-dialog(v-model='modal', persistent, width='290px')
  template(#activator='{ props: activatorProps }')
    v-text-field(
      :model-value='value',
      :label='schema.label',
      prepend-icon='access_time',
      readonly,
      :rules='rules',
      v-bind='{ ...activatorProps, ...(schema.textfield || {}) }'
    )
  v-card
    v-time-picker(
      v-model='pickerTime',
      format='24hr',
      v-bind='bind',
      v-on='schema.on || {}'
    )
    v-card-actions
      v-spacer
      v-btn(
        variant='text',
        color='primary',
        @click='modal = false'
      ) Abbrechen
      v-btn(
        variant='text',
        color='primary',
        @click='saveTime'
      ) Speichern
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, rules, bind } = useField(props, emit)

const modal = ref(false)
const pickerTime = ref<string | null>(null)

watch(modal, (open) => {
  if (open) {
    pickerTime.value = (props.value as string) || null
  }
})

function saveTime() {
  changeValue(pickerTime.value || '')
  modal.value = false
}
</script>
