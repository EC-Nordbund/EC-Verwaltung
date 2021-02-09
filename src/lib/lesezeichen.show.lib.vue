<template lang="pug">
v-menu(open-on-hover)
  template(v-slot:activator='{ on }')
    v-badge(overlap, bottom, color='red')
      template(v-slot:badge)
        span {{ Object.keys(liste).length }}
      v-btn(v-on='on', icon)
        v-icon(color='white') star
  v-card
    v-card-title
      h1 Lesezeichen
    v-card-text
      v-list(two-line)
        template(v-for='item in liste')
          v-list-tile(@click='$router.push(item.fullPath)')
            v-list-tile-action
              v-icon person
            v-list-tile-content
              v-list-tile-title {{ item.title }}
              v-list-tile-sub-title {{ item.subTitle }}
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { useLesezeichen } from '../plugins/lesezeichen'

export default defineComponent({
  name: 'LesezeichenShow',
  setup() {
    const { lesezeichen } = useLesezeichen()

    return {
      liste: lesezeichen
    }
  }
})
</script>
