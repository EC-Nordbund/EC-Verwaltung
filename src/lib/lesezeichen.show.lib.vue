<template lang="pug">
v-menu(open-on-hover)
  template(#activator='{ props: activatorProps }')
    v-badge(location='bottom end', color='red', :content='anzahl')
      v-btn(v-bind='activatorProps', icon)
        v-icon(color='white') star
  v-card
    v-card-title
      h1 Lesezeichen
    v-card-text
      v-list(lines='two')
        v-list-item(
          v-for='item in liste',
          :key='item.fullPath',
          @click='openLesezeichen(item.fullPath)'
        )
          template(#prepend)
            v-icon person
          v-list-item-title {{ item.title }}
          v-list-item-subtitle {{ item.subTitle }}
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '../plugins/router'
import { useLesezeichen } from '../plugins/lesezeichen'

const { router } = useRouter()
const { lesezeichen } = useLesezeichen()

const liste = lesezeichen
const anzahl = computed(() => Object.keys(liste.value).length)

function openLesezeichen(fullPath: string) {
  router.push(fullPath)
}
</script>
