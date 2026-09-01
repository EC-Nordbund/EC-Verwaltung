<template lang="pug">
v-text-field(
  :model-value='value',
  @update:model-value='changeValue',
  v-on='schema.on || {}',
  v-bind='bind',
  :type='schema.typ',
  :rules='rules'
)
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, rules, bind } = useField(props, emit)
</script>
