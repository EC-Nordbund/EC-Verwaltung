<template lang="pug">
v-text-field(
  :append-icon="filter ? 'more_vert' : ''",
  @click:append='doFilter',
  v-model='value',
  prepend-icon='search',
  :append-inner-icon="value ? 'close' : undefined",
  @click:append-inner="value = ''",
  v-bind='$attrs'
)
</template>
<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from '../plugins/router'

defineOptions({ inheritAttrs: false })

defineProps<{ filter?: boolean }>()

const emit = defineEmits(['suche', 'filter'])

const { stringQueryRef } = useRouter()
const value = stringQueryRef('suche')

watch(value, () => {
  emit('suche', value.value)
})

function doFilter() {
  emit('filter')
}
</script>
