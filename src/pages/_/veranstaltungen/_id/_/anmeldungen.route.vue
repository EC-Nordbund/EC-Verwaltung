<template lang="pug">
v-card-text(style='overflow: auto')
  p(style='font-size: 12pt')
    b Nicht abgemeldet und nicht auf Warteliste:
    br
    | Männlich: {{ data.anmeldungen.filter((a) => a.wartelistenPlatz === 0 && a.person.geschlecht === "m" && a.position === 1).length }}
    br
    | Weiblich: {{ data.anmeldungen.filter((a) => a.wartelistenPlatz === 0 && a.person.geschlecht === "w" && a.position === 1).length }}
    br
    | Gesamt: {{ data.anmeldungen.filter((a) => a.wartelistenPlatz === 0).length }}
  v-list(lines='two')
    v-list-item(
      v-for='(anmeldung, c) in warteliste',
      :key='anmeldung.anmeldeID',
      :class='`wlist-${anmeldung.wartelistenPlatz} wlist`',
      @click='navigate({ path: `/anmeldungen/${anmeldung.anmeldeID}/home` })'
    )
      template(#prepend)
        span {{ c + 1 }}
      v-list-item-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
      v-list-item-subtitle Rolle: {{ rollen[anmeldung.position - 1] }}
    v-list-item(
      v-for='(anmeldung, c) in teilnehmer',
      :key='anmeldung.anmeldeID',
      :class='`wlist-${anmeldung.wartelistenPlatz} wlist`',
      @click='navigate({ path: `/anmeldungen/${anmeldung.anmeldeID}/home` })'
    )
      template(#prepend)
        span {{ c + 1 }}
      v-list-item-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
      v-list-item-subtitle Rolle: {{ rollen[anmeldung.position - 1] }}
    v-list-item(
      v-for='(anmeldung, c) in mitarbeiter',
      :key='anmeldung.anmeldeID',
      :class='`wlist-${hatFZ(anmeldung) ? 0 : -1} wlist`',
      @click='navigate({ path: `/anmeldungen/${anmeldung.anmeldeID}/home` })'
    )
      template(#prepend)
        span {{ c + 1 }}
      v-list-item-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
      v-list-item-subtitle Rolle: {{ rollen[anmeldung.position - 1] + (hatFZ(anmeldung) ? '' : ' - HAT KEIN FZ!') }}
    v-list-item(
      v-for='(anmeldung, c) in abgemeldete',
      :key='anmeldung.anmeldeID',
      :class='`wlist-${anmeldung.wartelistenPlatz} wlist`',
      @click='navigate({ path: `/anmeldungen/${anmeldung.anmeldeID}/home` })'
    )
      template(#prepend)
        span {{ c + 1 }}
      v-list-item-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
      v-list-item-subtitle Rolle: {{ rollen[anmeldung.position - 1] }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '../../../../../plugins/router'

// Kommt vom Eltern-Layout (veranstaltungen/_id/_.route.vue) über das
// router-view-Slot-Pattern als :data-Prop.
const props = defineProps<{ data?: any }>()

// navigate() = router.push mit automatischem query.prev = aktuelle fullPath
// (identisch zum alten $router.push({..., query: { prev: $route.fullPath }})).
const { navigate } = useRouter()

const rollen = [
  'Teilnehmer',
  'Mitarbeiter',
  'Küchenmitarbeiter',
  'Küchenleitung',
  'Leitung',
  'Hauptleitung'
]

// Die filter/sort-Ketten aus dem Template in computeds verlagert —
// sort() arbeitet damit garantiert nur auf der filter-Kopie, nie auf dem
// reaktiven Prop-Array (Vue-3-Rerender-Falle).
const warteliste = computed(() =>
  props.data.anmeldungen
    .filter((a: any) => a.wartelistenPlatz > 0)
    .sort((a: any, b: any) => b.wartelistenPlatz - a.wartelistenPlatz)
)

const teilnehmer = computed(() =>
  props.data.anmeldungen
    .filter((a: any) => a.wartelistenPlatz === 0 && a.position === 1)
    .sort((a: any, b: any) => b.position - a.position)
)

const mitarbeiter = computed(() =>
  props.data.anmeldungen.filter(
    (a: any) => a.wartelistenPlatz === 0 && a.position > 1
  )
)

const abgemeldete = computed(() =>
  props.data.anmeldungen.filter((a: any) => a.wartelistenPlatz < 0)
)

// FZ-Prüfung 1:1 aus dem alten Template übernommen (inkl. des dort schon
// vorhandenen Format-Vergleichs input vs. german — nicht in der
// Bugfix-Liste, daher unverändert).
function hatFZ(anmeldung: any) {
  return !!(
    anmeldung.person.datumDesLetztenFZ &&
    anmeldung.person.datumDesLetztenFZ.input >= props.data.begin.german
  )
}

function getTitle(wplatz: number) {
  if (wplatz === 0) {
    return 'Angemeldet'
  } else if (wplatz === -1) {
    return 'Abgemeldet'
  } else {
    return `Auf Wartelistenplatz ${wplatz}`
  }
}
</script>

<style scoped>
.wlist:not(.wlist--1):not(.wlist-0) {
  background-color: yellow;
}
.wlist-0 {
  background-color: green;
}
.wlist--1 {
  background-color: red;
}
</style>
