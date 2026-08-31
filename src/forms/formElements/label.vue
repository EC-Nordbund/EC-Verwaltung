<template lang="pug">
component(
  :is='schema.tag || "p"',
  v-text='schema.label',
  v-on='schema.on || {}',
  v-bind='bind'
)
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { bind } = useField(props, emit)
</script>
