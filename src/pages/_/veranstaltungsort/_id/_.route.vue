<template lang="pug">
ec-wrapper(hasSheet, hasDial, hasNav, hasXBtn, hasRouterView, v-bind='config')
  router-view
</template>
<script setup lang="ts">
const config = {
  sheet: [],
  nav: [
    {
      icon: 'home',
      label: 'Allgemein',
      to: 'home'
    },
    {
      icon: 'event',
      label: 'Veranstaltungen',
      to: 'veranstaltungen'
    }
  ],
  // Platzhalter-Titel wie bisher — die Seite lädt (noch) keine Daten.
  title: 'VERANSTALTUNGSORTNAME',
  subTitle: 'Veranstaltungsort'
}

// Toter Alt-Code, 1:1 übernommen (sheet ist leer, wird nie aufgerufen)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sheetClick(item: { id: string }) {
  alert(item.id)
}
</script>
