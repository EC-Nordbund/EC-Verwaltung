<template lang="pug">
//- Vuetify-4-Pattern statt :return-value.sync/lazy/$refs.dialog.save():
//- schlichter v-dialog mit eigenem Abbrechen/Speichern-Flow.
//- Nach außen (Formular-Value) bleibt der Wert ein ISO-String YYYY-MM-DD,
//- nur der Picker selbst arbeitet mit einem Date-Objekt.
v-dialog(v-model='modal', persistent, width='290px')
  template(#activator='{ props: activatorProps }')
    v-text-field(
      :model-value='displayDate',
      :label='schema.label',
      prepend-icon='event',
      readonly,
      :rules='rules',
      v-bind='{ ...activatorProps, ...(schema.textfield || {}) }'
    )
  v-card
    v-date-picker(
      v-model='pickerDate',
      v-bind='bind'
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
        @click='saveDate'
      ) Speichern
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, rules, bind } = useField(props, emit)

const modal = ref(false)
const pickerDate = ref<Date | null>(null)

// Anzeige wie bisher: ISO → deutsches Format
const displayDate = computed(() =>
  String(props.value || '')
    .split('-')
    .reverse()
    .join('.')
)

function parseIso(v: string | undefined | null): Date | null {
  if (!v) return null
  const [y, m, d] = String(v).split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

watch(modal, (open) => {
  if (open) {
    pickerDate.value = parseIso(props.value as string)
  }
})

function saveDate() {
  changeValue(pickerDate.value ? toIso(pickerDate.value) : '')
  modal.value = false
}
</script>
