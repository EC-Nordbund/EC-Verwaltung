<template lang="pug">
v-card-text
  v-list(lines='two')
    template(v-for='(anmeldung, id) in data.anmeldungen')
      v-divider(v-if='id !== 0')
      v-list-item(
        @click='navigate({ path: `/anmeldungen/${anmeldung.anmeldeID}/home` })'
      )
        template(#prepend)
          v-icon event
        v-list-item-title {{ anmeldung.veranstaltung.bezeichnung }} | ({{ anmeldung.veranstaltung.begin.german }} - {{ anmeldung.veranstaltung.ende.german }})
        v-list-item-subtitle Rolle: {{ rollen[anmeldung.position - 1] }} | AnmeldeID: {{ anmeldung.anmeldeID }}
</template>

<script setup lang="ts">
import { useRouter } from '../../../../../plugins/router'

defineProps<{ data?: any }>()

// navigate = push mit query.prev = aktuelle fullPath (wie bisher)
const { navigate } = useRouter()

const rollen = [
  'Teilnehmer',
  'Mitarbeiter',
  'Küchenmitarbeiter',
  'Küchenleitung',
  'Leitung',
  'Hauptleitung'
]
</script>
