<template lang="pug">
  v-btn(icon @click="toggleLesezeichen")
    v-icon {{isLesezeichen?'star':'star_border'}}
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import { useRouter } from '../plugins/router'
import { useLesezeichen } from '../plugins/lesezeichen'

export default defineComponent({
  name: 'LesezeichenAdd',
  props: {
    title: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      required: true
    }
  },
  setup(props, ctx) {
    const { route } = useRouter()
    const { check, add, remove } = useLesezeichen()
    const isLesezeichen = ref(check(route.value.path))

    function toggleLesezeichen() {
      if (isLesezeichen.value) {
        remove(route.value.path)
      } else {
        add(route.value.path, {
          title: props.title,
          subTitle: props.subTitle,
          fullPath: route.value.fullPath
        })
      }
    }

    return { isLesezeichen, toggleLesezeichen }
  }
})
</script>
