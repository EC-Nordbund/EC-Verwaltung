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
  v-list(two-line)
    v-list-tile(
      @click='$router.push({ path: `/anmeldungen/${anmeldung.anmeldeID}/home`, query: { prev: $route.fullPath } })',
      v-for='(anmeldung, c) in data.anmeldungen.filter((a) => a.wartelistenPlatz > 0).sort((a, b) => b.wartelistenPlatz - a.wartelistenPlatz)',
      :class='`wlist-${anmeldung.wartelistenPlatz} wlist`'
    )
      v-list-tile-action
        | {{ c + 1 }}
      v-list-tile-content
        v-list-tile-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
        v-list-tile-sub-title Rolle: {{ rollen[anmeldung.position - 1] }}
    v-list-tile(
      @click='$router.push({ path: `/anmeldungen/${anmeldung.anmeldeID}/home`, query: { prev: $route.fullPath } })',
      v-for='(anmeldung, c) in data.anmeldungen.filter((a) => a.wartelistenPlatz === 0 && a.position === 1).sort((a, b) => b.position - a.position)',
      :class='`wlist-${anmeldung.wartelistenPlatz} wlist`'
    )
      v-list-tile-action
        | {{ c + 1 }}
      v-list-tile-content
        v-list-tile-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
        v-list-tile-sub-title Rolle: {{ rollen[anmeldung.position - 1] }}
    v-list-tile(
      @click='$router.push({ path: `/anmeldungen/${anmeldung.anmeldeID}/home`, query: { prev: $route.fullPath } })',
      v-for='(anmeldung, c) in data.anmeldungen.filter((a) => a.wartelistenPlatz === 0 && a.position > 1)',
      :class='`wlist-${(anmeldung.person.datumDesLetztenFZ && (anmeldung.person.datumDesLetztenFZ.input >= this.data.begin.german)) ? 0 : -1 } wlist`'
    )
      v-list-tile-action
        | {{ c + 1 }}
      v-list-tile-content
        v-list-tile-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
        v-list-tile-sub-title Rolle: {{ rollen[anmeldung.position - 1] + ((anmeldung.person.datumDesLetztenFZ && (anmeldung.person.datumDesLetztenFZ.input >= this.data.begin.german)) ? '' : ' - HAT KEIN FZ!') }}
    v-list-tile(
      @click='$router.push({ path: `/anmeldungen/${anmeldung.anmeldeID}/home`, query: { prev: $route.fullPath } })',
      v-for='(anmeldung, c) in data.anmeldungen.filter((a) => a.wartelistenPlatz < 0)',
      :class='`wlist-${anmeldung.wartelistenPlatz} wlist`'
    )
      v-list-tile-action
        | {{ c + 1 }}
      v-list-tile-content
        v-list-tile-title {{ anmeldung.person.vorname }} {{ anmeldung.person.nachname }} ({{ anmeldung.person.gebDat.german }}) | {{ getTitle(anmeldung.wartelistenPlatz) }}
        v-list-tile-sub-title Rolle: {{ rollen[anmeldung.position - 1] }}
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Emit } from 'vue-property-decorator'

@Component({})
export default class EcNAME extends Vue {
  public static meta = {}
  @Prop()
  private data!: any

  private rollen = [
    'Teilnehmer',
    'Mitarbeiter',
    'Küchenmitarbeiter',
    'Küchenleitung',
    'Leitung',
    'Hauptleitung'
  ]

  public getTitle(wplatz: number) {
    if (wplatz === 0) {
      return 'Angemeldet'
    } else if (wplatz === -1) {
      return 'Abgemeldet'
    } else {
      return `Auf Wartelistenplatz ${wplatz}`
    }
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
