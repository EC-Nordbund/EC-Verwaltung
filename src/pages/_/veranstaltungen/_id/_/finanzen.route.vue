<template lang="pug">
v-card-text Hier kommen demnächst die Finanzinformationen. Da dafür aber viele Berechnungen gemacht werden müssen ist das etwas komplizierter.
</template>

<script setup lang="ts">
// Kommt vom Eltern-Layout (veranstaltungen/_id/_.route.vue) über das
// router-view-Slot-Pattern als :data-Prop — hier (noch) ungenutzt.
defineProps<{ data?: any }>()
</script>
