<template lang="pug">
v-card-text(style='overflow: auto')
  ec-anmeldung-protokoll(
    :anmeldeID='route.params.id',
    :reload-key='reloadKey'
  )
</template>

<script setup lang="ts">
import { useRouter } from '../../../../../plugins/router'

// `data` kommt vom Layout wie bei den Geschwister-Tabs; das Protokoll selbst
// lädt anhand der anmeldeID. `reloadKey` zählt das Layout nach jeder Aktion
// hoch, damit ein frischer Eintrag ohne Neuladen der Seite erscheint.
withDefaults(defineProps<{ data?: any; reloadKey?: number }>(), {
  data: () => ({ person: {} }),
  reloadKey: 0
})

const { route } = useRouter()
</script>
