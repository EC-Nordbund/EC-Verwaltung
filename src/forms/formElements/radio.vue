<template lang="pug">
v-radio-group(
  :model-value='value',
  @update:model-value='changeValue',
  v-bind='bind',
  v-on='schema.on || {}',
  :rules='rules'
)
  v-radio(
    v-for='radio in schema.radios',
    :key='radio.value',
    v-bind='radio',
    v-on='radio.on || {}'
  )
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, rules, bind } = useField(props, emit)
</script>
