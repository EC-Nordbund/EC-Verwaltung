<template lang="pug">
ec-wrapper(title='Home')
  h1 Vielen Dank für deinen Einsatz im EC-Nordbund!
  h1 Aktuell geplante Änderungen (tw. schon angefangen)
  ul
    li Sicherheitsrelevante Änderung am Login (ist schon sicher wird dann nur noch sicherer)
    li Dokumentgenerierung soll nicht mehr im Browser stattfinden sondern auf dem Sever => Schneller und sicherer
    li Offline / Datenspaar Modus (Da will ich [Sebastian] mich mal genauer mit beschäftigen da mich dort die Technologien interessiert)
    li Verbesserte API (Ort wo die Daten geladen werden) dort finden regelmäßige Änderungen statt.
  h1 Änderungen
  h3 Version 3.1.0
  ul
    li Kleine Änderungen
    li mehr als 400KB JavaScript entfernt (unterstützen jetzt nicht mehr den Internet Explorer von Microsoft)
  h3 Version 3.0.0
  ul
    li Etliche updates von benutzen Bibliotheken (sicherheitsupdates)
    li Neues Login System
    li Teileweise Offline Support der Seite (gesamte seite wird Lokal gespeichert nur für die Daten wird eine Internetverbindung benötigt)
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class EcRootIndexHome extends Vue {}
</script>