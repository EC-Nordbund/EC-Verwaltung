<template lang="pug">
ec-wrapper(hasSheet, hasDial, v-bind='config')
  | Content
</template>
<script setup lang="ts">
function sheetClick(item: { id: string }) {
  alert(item.id)
}

const config = {
  sheet: [
    {
      id: 'print_all',
      icon: 'print',
      label: 'Alles Drucken',
      click: sheetClick
    }
  ],
  // Titel war schon immer 'Profil' (Alt-Stand, kein dokumentierter Bugfix
  // im Guide) — 1:1 übernommen.
  title: 'Profil'
}
</script>
