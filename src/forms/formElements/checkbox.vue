<template lang="pug">
v-checkbox(
  :model-value='value',
  @update:model-value='changeValue',
  v-bind='bind',
  v-on='schema.on || {}',
  :rules='rules'
)
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, rules, bind } = useField(props, emit)
</script>
