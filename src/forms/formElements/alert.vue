<template lang="pug">
v-alert(
  v-bind='bind',
  :type='schema.color'
) {{ schema.text }}
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { bind } = useField(props, emit)
</script>
