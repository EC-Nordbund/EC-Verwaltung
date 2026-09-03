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
      :class='`wlist-${hatFZ(anmeldung) ? 0 : -2} wlist`',
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

/**
 * Stichtag der FZ-Prüfung: ein Führungszeugnis gilt fünf Jahre und muss am
 * Ende der Veranstaltung noch gültig sein.
 *
 * Nachgezogen aus ef447dd (Branch old-version, 2022-07-11) — main hatte nur
 * die ältere Fassung von eaccfe8, die `datumDesLetztenFZ.input` (ISO) gegen
 * `begin.german` (DD.MM.YYYY) verglich. Als String war das für jedes
 * vorhandene FZ wahr ("2015-…" > "10.07.…"), die Warnung erschien also nie.
 * Gegenüber ef447dd zusätzlich zweistellig aufgefüllt: dessen
 * `${m + 1}` erzeugte "2022-7-10" und verglich sich falsch gegen "2022-11-…".
 */
function subtractYears(years: number, isoDate: string) {
  const d = new Date(isoDate)
  d.setFullYear(d.getFullYear() - years)
  const month = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}

function hatFZ(anmeldung: any) {
  const fz = anmeldung.person.datumDesLetztenFZ
  // ende ist bei Eintagesveranstaltungen NULL -> auf begin zurückfallen
  const stichtag = props.data.ende?.input ?? props.data.begin?.input
  if (!fz || !stichtag) return false
  return fz.input >= subtractYears(5, stichtag)
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
.wlist:not(.wlist--1):not(.wlist-0):not(.wlist--2) {
  background-color: yellow;
}
.wlist-0 {
  background-color: green;
}
.wlist--1 {
  background-color: red;
}
/* Mitarbeiter ohne (gueltiges) Fuehrungszeugnis */
.wlist--2 {
  background-color: gray;
}
</style>
