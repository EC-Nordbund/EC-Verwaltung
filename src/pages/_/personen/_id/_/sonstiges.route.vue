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
      v-list-item-subtitle Mitglied im EC-Kreis
    v-divider
    v-list-item(@click='() => {}')
      template(#prepend)
        v-icon badge
      v-list-item-title
        v-chip.mr-2.mb-1(
          v-for='k in mitarbeit',
          :key='k.ecKreisID',
          size='small',
          closable,
          @click:close='entferneMitarbeit(k)'
        ) {{ k.bezeichnung }}
        em(v-if='mitarbeitGeladen && !mitarbeit.length') keine
      v-list-item-subtitle Mitarbeit in EC-Kreisen (Führungszeugnis-Pflicht, FZ-Liste im Portal)
      template(#append)
        v-btn(icon, :title='"Mitarbeit in einem EC-Kreis eintragen"', @click.stop='oeffneMitarbeit')
          v-icon add

  v-dialog(v-model='mitarbeitOffen', max-width='480px')
    v-card
      v-card-title Mitarbeit eintragen
      v-card-subtitle {{ data.vorname }} {{ data.nachname }}
      v-card-text
        v-alert.mb-4(type='info', variant='tonal', density='compact')
          | Mitarbeit heißt: Die Person steht in der Mitarbeiter- und FZ-Liste
          | dieses Kreises im Portal und in seiner Monats-Mail. Die
          | Mitgliedschaft bleibt davon unberührt.
        v-autocomplete(
          v-model='mitarbeitNeu',
          :items='kreisItems',
          :loading='kreiseLaden',
          label='EC-Kreis',
          density='compact',
          hide-details='auto'
        )
      v-card-actions
        v-spacer
        v-btn(variant='text', @click='mitarbeitOffen = false') Abbrechen
        v-btn(
          color='primary',
          :disabled='!mitarbeitNeu || mitarbeitLaedt',
          :loading='mitarbeitLaedt',
          @click='fuegeMitarbeitHinzu'
        ) Eintragen
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDialog } from '../../../../../plugins/dialog'
import { useRouter } from '../../../../../plugins/router'
import { useLogin } from '../../../../../plugins/auth'
import { API_BASE } from '../../../../../plugins/apiBase'
import { errorHandler } from '../../../../../helpers'

const props = withDefaults(defineProps<{ data?: any }>(), {
  // Vue 3: Objekt-Default als Factory
  data: () => ({ person: {} })
})

const { error, notifyInfo } = useDialog()
// navigate = push mit query.prev = aktuelle fullPath (wie bisher)
const { navigate } = useRouter()
const { authToken } = useLogin()

/**
 * Mitarbeit in EC-Kreisen (Tabelle ecKreisMitarbeit) -- getrennt von der
 * Mitgliedschaft `data.ecKreis`, die aus der GraphQL-Personenabfrage kommt.
 * Mitglied ist man in genau einem Kreis, mitarbeiten kann man in mehreren,
 * und das Führungszeugnis gehört dorthin, wo jemand mitarbeitet.
 *
 * Bewusst REST (/v6/personen/:id/mitarbeit, EC-Api api/portal-account.ts)
 * mit dem rohen fetch-Muster des Repos, wie die EC-Kreise-Seite: so lädt
 * dieser Tab nach dem Eintragen nur seine Chips nach statt der ganzen Person.
 * Die /v6-Aufrufe laufen nacheinander (Limit zwei pro Sekunde).
 */
const mitarbeit = ref<any[]>([])
const mitarbeitGeladen = ref(false)
const mitarbeitOffen = ref(false)
const mitarbeitLaedt = ref(false)
const mitarbeitNeu = ref<number | null>(null)
const kreise = ref<any[]>([])
const kreiseLaden = ref(false)

const kreisItems = computed(() =>
  kreise.value
    .filter((k) => !mitarbeit.value.some((m) => m.ecKreisID === k.ecKreisID))
    .map((k) => ({ value: k.ecKreisID, title: k.bezeichnung }))
)

function ladeMitarbeit() {
  const id = props.data?.personID
  if (!id) return
  fetch(`${API_BASE}/v6/personen/${id}/mitarbeit`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      mitarbeit.value = res.kreise
      mitarbeitGeladen.value = true
    })
    .catch((err: any) => {
      error({
        text: err.message || err,
        title: 'Mitarbeit laden fehlgeschlagen!'
      })
    })
}

function oeffneMitarbeit() {
  mitarbeitNeu.value = null
  mitarbeitOffen.value = true
  if (kreise.value.length) return
  kreiseLaden.value = true
  fetch(`${API_BASE}/v6/eckreis`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      kreise.value = res.kreise
    })
    .catch((err: any) => {
      error({
        text: err.message || err,
        title: 'EC-Kreise laden fehlgeschlagen!'
      })
    })
    .finally(() => {
      kreiseLaden.value = false
    })
}

function fuegeMitarbeitHinzu() {
  if (!mitarbeitNeu.value || mitarbeitLaedt.value) return
  mitarbeitLaedt.value = true
  fetch(
    `${API_BASE}/v6/personen/${props.data.personID}/mitarbeit/${mitarbeitNeu.value}`,
    {
      method: 'PUT',
      headers: { authorization: authToken.value }
    }
  )
    .then(errorHandler)
    .then(() => {
      mitarbeitOffen.value = false
      notifyInfo('Mitarbeit eingetragen.')
      ladeMitarbeit()
    })
    .catch((err: any) => {
      error({ text: err.message || err, title: 'Eintragen fehlgeschlagen!' })
    })
    .finally(() => {
      mitarbeitLaedt.value = false
    })
}

function entferneMitarbeit(k: any) {
  if (
    !window.confirm(
      `Mitarbeit in „${k.bezeichnung}" wirklich entfernen?\n\nDie Person taucht dann in der FZ-Liste und der Monats-Mail dieses Kreises nicht mehr auf. Mitgliedschaft und Führungszeugnisse bleiben.`
    )
  ) {
    return
  }
  fetch(
    `${API_BASE}/v6/personen/${props.data.personID}/mitarbeit/${k.ecKreisID}`,
    {
      method: 'DELETE',
      headers: { authorization: authToken.value }
    }
  )
    .then(errorHandler)
    .then(() => {
      notifyInfo('Mitarbeit entfernt.')
      ladeMitarbeit()
    })
    .catch((err: any) => {
      error({ text: err.message || err, title: 'Entfernen fehlgeschlagen!' })
    })
}

watch(() => props.data?.personID, ladeMitarbeit, { immediate: true })

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
