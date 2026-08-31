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
      id: 'user_add',
      icon: 'person_add',
      label: 'Benutzer hinzufügen',
      click: sheetClick
    }
  ],
  title: 'Admin'
}
</script>
