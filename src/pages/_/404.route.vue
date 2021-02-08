<template lang="pug">
  ec-wrapper(title="Error 404 - Not Found")
    p(style="font-size: 16px")
      | Ein Fehler ist aufgetreten. Bitte Probiere das was du gemacht hast nocheinmal. Wenn der Fehler Bleibt melde diesen Fehler bitte.
    p(style="font-size: 18px")
      b Vorheriger Pfad: 
      br
      | {{$route.query.prev}}
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'Root404'
})
</script>
