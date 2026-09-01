<template lang="pug">
ec-wrapper(hasSheet, hasDial, hasNav, hasXBtn, hasRouterView, v-bind='config')
  router-view
</template>
<script setup lang="ts">
// 1:1 übernommen: war schon im Alt-Code unreferenziert (sheet ist leer)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sheetClick(item: { id: string }) {
  alert(item.id)
}

const config = {
  sheet: [],
  nav: [
    {
      icon: 'home',
      label: 'Allgemein',
      to: 'home'
    },
    {
      icon: 'events',
      label: 'Veranstaltungen',
      to: 'veranstaltungen'
    },
    {
      icon: 'home',
      label: 'Veranstaltungsorte',
      to: 'veranstaltungsorte'
    }
  ],
  title: 'ANMELDUNGNAME',
  subTitle: 'Organisation'
}
</script>
