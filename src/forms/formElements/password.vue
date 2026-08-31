<template lang="pug">
v-text-field(
  :model-value='value',
  @update:model-value='changeValue',
  :color='isCapsOn ? "warning" : undefined',
  :messages='isCapsOn ? "Hinweis: Feststelltaste ist aktiv" : ""',
  v-on='schema.on || {}',
  v-bind='bind',
  :append-inner-icon='passwordVisible ? "visibility_off" : "visibility"',
  @click:append-inner='togglePasswordVisibility',
  :type='type',
  :rules='rules'
)
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, rules, bind } = useField(props, emit)

const passwordVisible = ref(false)
const isCapsOn = ref(false)

// Früher wurde schema.typ mutiert — jetzt lokaler State (gleiches Verhalten).
const type = computed(() =>
  passwordVisible.value ? 'text' : props.schema.typ || 'password'
)

function checkCaps(ev: KeyboardEvent) {
  const key = ev.key
  if (key.length === 1) {
    isCapsOn.value =
      key.toUpperCase() === key && key.toLowerCase() !== key && !ev.shiftKey
  } else {
    if (key === 'CapsLock') {
      isCapsOn.value = !isCapsOn.value
    }
  }
}

window.addEventListener('keyup', checkCaps)
onUnmounted(() => {
  window.removeEventListener('keyup', checkCaps)
})

function togglePasswordVisibility() {
  passwordVisible.value = !passwordVisible.value
}
</script>
