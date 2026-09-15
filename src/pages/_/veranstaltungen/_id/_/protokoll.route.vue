<template lang="pug">
v-card-text(style='overflow: auto')
  p.text-body-2.text-medium-emphasis.mb-4 Abmeldungen, zurückgenommene Abmeldungen und gelöschte Anmeldungen dieser Veranstaltung. Gelöschte Anmeldungen sind nur noch hier zu finden.
  ec-anmeldung-protokoll(:veranstaltungsID='route.params.id')
</template>

<script setup lang="ts">
import { useRouter } from '../../../../../plugins/router'

// Die :data-Prop des Layouts wird hier nicht gebraucht — das Protokoll
// hängt nur an der ID aus der Route.
defineProps<{ data?: any }>()

const { route } = useRouter()
</script>
