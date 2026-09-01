<template lang="pug">
//- Kein :rules — VRating ist in Vuetify 4 kein Form-Input (keine rules-
//- bzw. error-messages-Prop); die frühere error-messages-Bindung zeigte
//- auch in Vuetify 1.5 nichts an.
v-rating(
  :model-value='value',
  @update:model-value='changeValue',
  v-bind='bind',
  v-on='schema.on || {}'
)
</template>

<script setup lang="ts">
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, bind } = useField(props, emit)
</script>
