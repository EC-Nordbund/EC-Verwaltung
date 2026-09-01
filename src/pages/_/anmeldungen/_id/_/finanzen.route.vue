<template lang="pug">
v-card-text Hier kommen demnächst die Finanzinformationen. Da dafür aber viele Berechnungen gemacht werden müssen ist das etwas komplizierter.
</template>

<script setup lang="ts">
withDefaults(defineProps<{ data?: any }>(), {
  data: () => ({ person: {} })
})
</script>
