<template lang="pug">
v-card-text
  v-list(lines='two')
    v-list-item(
      v-for='a in data.ak',
      @click='navigate({ path: `/ak/${a.ak.akID}` })'
    )
      template(#prepend)
        v-icon group
      v-list-item-title AK: {{ a.ak.bezeichnung }}
      v-list-item-subtitle {{ stadien[a.currentStatus] }}
    v-divider(v-if='data.fzs.length > 0')
    v-list-item(v-for='fz in data.fzs', @click='showAll(fz.kommentar)')
      template(#prepend)
        v-icon assignment
      v-list-item-title FZ vom {{ fz.fzVon.german }} | {{ fz.kommentar }}
      v-list-item-subtitle gesehen von: {{ fz.gesehenVon.vorname }} {{ fz.gesehenVon.nachname }} gesehen am {{ fz.gesehenAm.german }}
    v-divider(v-if='data.fzAntraege.length > 0')
    v-list-item(v-for='fz in data.fzAntraege')
      template(#prepend)
        v-icon mail
      v-list-item-title {{ fz.erzeugt.german }} ({{ fz.erzeugt_durch }})
      v-list-item-subtitle FZ-Antrag
    v-divider(v-if='data.Notizen')
    v-list-item(v-if='data.Notizen', @click='() => {}')
      template(#prepend)
        v-icon notes
      v-list-item-title {{ data.Notizen }}
      v-list-item-subtitle Notizen
      template(#append)
        v-btn(icon, @click='showAll(data.Notizen)')
          v-icon search
    v-divider(v-if='data.juleica')
    template(v-for='juleica in data.juleica')
      v-list-item(
        @click='() => {}',
        :class='isJuleicaOld(juleica) ? "isOld" : ""'
      )
        template(#prepend)
          v-icon credit_card
        v-list-item-title {{ juleica.juleicanummer }}
        v-list-item-subtitle(v-if='juleica.gueltig_bis') JuLeiCa gültig bis {{ juleica.gueltig_bis.german }}
        v-list-item-subtitle(v-else) JuLeiCa (Kein Gültigkeitsdatum hinterlegt)
    v-divider(v-if='data.tags')
    template(v-for='tag in data.tags')
      v-list-item(@click='() => {}')
        template(#prepend)
          v-icon label
        template(v-if='tag.notiz')
          v-list-item-title {{ tag.notiz }}
          v-list-item-subtitle {{ tag.tag.bezeichnung }}
        v-list-item-title(v-else) {{ tag.tag.bezeichnung }}
        template(#append, v-if='tag.notiz')
          v-btn(icon, @click='showAll(tag.notiz)')
            v-icon search
    v-divider(v-if='data.ecKreis')
    v-list-item(v-if='data.ecKreis', @click='() => {}')
      template(#prepend)
        v-icon supervised_user_circle
      v-list-item-title {{ data.ecKreis.bezeichnung }}
      v-list-item-subtitle EC-Kreis
</template>

<script setup lang="ts">
import { useDialog } from '../../../../../plugins/dialog'
import { useRouter } from '../../../../../plugins/router'

withDefaults(defineProps<{ data?: any }>(), {
  // Vue 3: Objekt-Default als Factory
  data: () => ({ person: {} })
})

const { notifyInfo } = useDialog()
// navigate = push mit query.prev = aktuelle fullPath (wie bisher)
const { navigate } = useRouter()

const stadien = ['Ausgetreten', 'Mitglied', 'Vertreter', 'Leiter']

function showAll(value: string) {
  notifyInfo(value)
}

// Template-Global `new Date()` ist in Vue 3 nicht mehr verfügbar —
// Vergleich in eine Methode verlagert (Verhalten unverändert).
function isJuleicaOld(juleica: any) {
  return new Date() > new Date(juleica.gueltig_bis.input)
}
</script>
