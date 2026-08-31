<template lang="pug">
v-btn(icon, @click='toggleLesezeichen')
  v-icon {{ isLesezeichen ? 'star' : 'star_border' }}
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '../plugins/router'
import { useLesezeichen } from '../plugins/lesezeichen'

const props = defineProps<{
  title: string
  subTitle: string
}>()

const { route } = useRouter()
const { check, add, remove } = useLesezeichen()

// Bugfix (Alt-Bug 5): früher einmalig `ref(check(...))` beim Setup — der
// Stern aktualisierte sich nach einem Toggle nicht. Jetzt computed auf den
// Storage, damit die Anzeige immer stimmt.
const isLesezeichen = computed(() => check(route.value.path))

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
</script>
