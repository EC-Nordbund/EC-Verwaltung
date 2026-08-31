<template lang="pug">
v-card-text(style='overflow: auto')
  v-list(lines='two')
    v-list-item(@click='copy(data.anmeldeID)')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.anmeldeID }}
      v-list-item-subtitle AnmeldeID (Wird dem TN/MA mitgeteilt)
    v-list-item(@click='navigate(`/personen/${data.person.personID}/home`)')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.person.vorname }} {{ data.person.nachname }}
      v-list-item-subtitle GebDat: {{ data.person.gebDat.german }}
    v-list-item(
      @click='navigate(`/veranstaltungen/${data.veranstaltung.veranstaltungsID}/home`)'
    )
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.veranstaltung.bezeichnung }}
      v-list-item-subtitle {{ data.veranstaltung.begin.german }} - {{ data.veranstaltung.ende.german }}
    v-list-item
      template(#prepend)
        v-icon person
      v-list-item-title {{ rollen[data.position - 1] }}
      v-list-item-subtitle Rolle
    v-list-item(v-if='data.wartelistenPlatz > 0')
      template(#prepend)
        v-icon person
      v-list-item-title Platz: {{ data.wartelistenPlatz }}
      v-list-item-subtitle Warteliste
    v-list-item(v-if='data.wartelistenPlatz === 0')
      template(#prepend)
        v-icon person
      v-list-item-title Angemeldet
    v-list-item(v-if='data.wartelistenPlatz < 0')
      template(#prepend)
        v-icon person
      v-list-item-title Abgemeldet
    v-divider
    v-list-item(@click='alert("Hier erscheint irgendwann eine Karte...")')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.adresse.strasse }}
      v-list-item-subtitle {{ data.adresse.plz }} {{ data.adresse.ort }}
    v-list-item(@click='location.href = `mailto:${data.email.eMail}`')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.email.eMail }}
    v-list-item(@click='location.href = `tel:${data.telefon.telefon}`')
      template(#prepend)
        v-icon person
      v-list-item-title {{ telefonFormater(data.telefon.telefon) }}
    v-divider
    v-list-item
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.anmeldeZeitpunkt.german }}
      v-list-item-subtitle AnmeldeDatum
    v-list-item
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.DSGVO_einverstaendnis.german }}
      v-list-item-subtitle DSGVO-Zustimmung
    v-list-item(v-if='data.bestaetigungsBrief')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.bestaetigungsBrief.german }}
      v-list-item-subtitle Bestätigungsbrief
    v-list-item(v-if='data.infoBrief')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.infoBrief.german }}
      v-list-item-subtitle Infobrief
    v-list-item(v-if='data.abmeldeZeitpunkt')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.abmeldeZeitpunkt.german }}
      v-list-item-subtitle Abmeldezeitpunkt
</template>

<script setup lang="ts">
import { useRouter } from '../../../../../plugins/router'
import { telefonFormater } from '../../../../../plugins/telefonFilter'

withDefaults(defineProps<{ data?: any }>(), {
  data: () => ({ person: {} })
})

const { navigate } = useRouter()

// Template-Globals (Vue 2 `with(this)`-Fallthrough) — in Vue 3 explizit:
const location = window.location
const alert = (text: string) => window.alert(text)

const copy = (text: string) => navigator.clipboard.writeText(text)

const rollen = [
  'Teilnehmer',
  'Mitarbeiter',
  'Küchenmitarbeiter',
  'Küchenleitung',
  'Leitung',
  'Hauptleitung'
]
</script>
