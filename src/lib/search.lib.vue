<template lang="pug">
v-text-field(
  :append-outer-icon="filter?'more_vert':''" 
  @click:append-outer="doFilter", 
  v-model="value", 
  prepend-icon="search", 
  :append-icon="value?'close':undefined", 
  @click:append="value=''" 
  v-bind="$attrs")
</template>
<script lang="ts">
import { defineComponent, watch } from '@vue/composition-api'
import { useRouter } from '../plugins/router'

export default defineComponent({
  name: 'Search',
  props: {
    filter: {
      type: Boolean,
      default: false
    }
  },
  setup(_, ctx) {
    const { stringQueryRef } = useRouter()
    const value = stringQueryRef('suche')

    watch(value, () => {
      ctx.emit('suche', value.value)
    })

    function doFilter() {
      ctx.emit('filter')
    }

    return {
      value,
      doFilter
    }
  }
})
</script>
