<template lang="pug">
v-alert(
  v-bind='alertBind',
  :type='schema.color'
) {{ schema.text }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { bind } = useField(props, emit)

// 'text' aus dem Spread ausschließen: Vuetify 4 rendert die text-Prop UND den
// Slot nebeneinander — der Alert-Text erschiene sonst doppelt (Alt-Verhalten:
// Vuetify 1.5 kannte keine text-Prop, nur der Slot wurde gerendert).
const alertBind = computed(() => {
  const { text: _text, ...rest } = bind.value as Record<string, unknown>
  return rest
})
</script>
