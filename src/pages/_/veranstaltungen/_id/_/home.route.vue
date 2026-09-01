<template lang="pug">
v-card-text(style='overflow: auto')
  v-list(lines='two')
    v-list-item(link)
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.veranstaltungsID }}
      v-list-item-subtitle VeranstaltungsID
    v-list-item(link)
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.bezeichnung }}
      v-list-item-subtitle Bezeichnung
    v-list-item(
      v-if='data.hauptleiter',
      @click='navigate({ path: `/personen/${data.hauptleiter.person.personID}/home` })'
    )
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.hauptleiter.person.vorname }} {{ data.hauptleiter.person.nachname }}
      v-list-item-subtitle Hauptleiter
    v-list-item(link)
      template(#prepend)
        v-icon person
      v-list-item-title {{ data?.begin?.german }} - {{ data?.ende?.german }}
      v-list-item-subtitle Zeitraum
    v-list-item(
      @click='navigate({ path: `/veranstaltungsort/${data.veranstaltungsort.vOrtID}/home` })'
    )
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.veranstaltungsort.bezeichnung }}
      v-list-item-subtitle {{ data.veranstaltungsort.ort }} ({{ data.veranstaltungsort.plz }}) [{{ data.veranstaltungsort.land }}]
    v-divider
    v-list-item(link)
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.minTNAlter }} - {{ data.maxTNAlter }}
      v-list-item-subtitle Teilnehmer Alter
    v-list-item(link)
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.anzahlPlaetze }}
      v-list-item-subtitle Anzahl Plätze für Teilnehmer
    v-list-item(link)
      template(#prepend)
        v-icon person
      v-list-item-title männlich: {{ data.anzahlPlaetzeM }} | weiblich: {{ data.anzahlPlaetzeW }}
      v-list-item-subtitle Anzahl Plätze für Teilnehmer
</template>

<script setup lang="ts">
import { useRouter } from '../../../../../plugins/router'

// Kommt vom Eltern-Layout (veranstaltungen/_id/_.route.vue) über das
// router-view-Slot-Pattern als :data-Prop.
defineProps<{ data?: any }>()

// navigate() = router.push mit automatischem query.prev = aktuelle fullPath
// (identisch zum alten $router.push({..., query: { prev: $route.fullPath }})).
const { navigate } = useRouter()
</script>
