<template lang="pug">
ec-wrapper(
  v-bind='config',
  hasSheet,
  hasDial,
  hasHeader,
  hasReload,
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Suchen (Name, Ort, E-Mail …)', @suche='suche = $event')
      //- Die Anzahl muss hier stehen: `subTitle` von ec-wrapper wird nur ans
      //- Lesezeichen weitergegeben und nie angezeigt. Ohne diese Zeile wüsste
      //- niemand, wie viel Arbeit noch vor ihm liegt — und bei paginierter
      //- Tabelle sieht man die Gesamtzahl auch sonst nirgends.
      .d-flex.align-center.ga-2.flex-wrap
        span.text-body-2.text-medium-emphasis(v-if='!loading')
          template(v-if='gefiltert') {{ filtered.length }} von {{ paare.length }} Vorschlägen
          template(v-else) {{ paare.length }} {{ paare.length === 1 ? 'Vorschlag' : 'Vorschläge' }}
        v-chip(
          v-if='personFilter',
          closable,
          size='small',
          @click:close='personFilter = 0'
        )
          | Nur Paare mit personID {{ personFilter }}
        v-chip(
          v-if='nurSichere',
          closable,
          size='small',
          color='error',
          @click:close='nurSichere = false'
        )
          | Nur hohe Übereinstimmung

  v-progress-linear(v-if='loading', indeterminate, color='primary')

  v-alert.ma-2(v-if='schemaHinweis', type='warning', variant='tonal', density='compact')
    | {{ schemaHinweis }}

  v-alert.ma-2(v-if='fehler', type='error', variant='tonal')
    | {{ fehler }}
    template(#append)
      v-btn(variant='text', @click='loadData') Erneut versuchen

  v-alert.ma-2(
    v-else-if='!loading && !paare.length',
    type='success',
    variant='tonal',
    icon='verified'
  )
    | Keine Dubletten gefunden – es gibt derzeit keine Personen, die sich
    | ähnlich genug sind.

  //- Rückgängig für "kein Duplikat". Die Aktion ist nicht zerstörend, deshalb
  //- läuft sie ohne Rückfrage — dafür muss sie sich zurücknehmen lassen.
  v-alert.ma-2(
    v-if='zuletztIgnoriert',
    type='info',
    variant='tonal',
    density='compact'
  )
    | „{{ name(zuletztIgnoriert.person_1) }}" und
    | „{{ name(zuletztIgnoriert.person_2) }}" sind als kein Duplikat gespeichert.
    template(#append)
      v-btn(variant='text', size='small', :disabled='!!busy', @click='ignorierenZurueck')
        | Rückgängig

  //- Nach einem Merge können weitere Vorschläge veraltet sein. Bewusst ein
  //- Hinweis mit Knopf statt eines automatischen Neuladens: die Liste soll
  //- nicht unter den Fingern wegspringen, während weitergearbeitet wird.
  v-alert.ma-2(v-if='stale', type='warning', variant='tonal', density='compact')
    | Durch das Zusammenführen können sich weitere Vorschläge geändert haben.
    template(#append)
      v-btn(variant='text', size='small', @click='loadData') Liste neu laden

  v-data-table(
    v-if='paare.length',
    :headers=`[
      { title: 'Treffer', key: 'score', width: 110 },
      { title: 'Person A', key: 'person_1' },
      { title: 'Person B', key: 'person_2' },
      { title: 'Hinweise', key: 'gruende', sortable: false },
      { title: '', key: 'aktionen', sortable: false, align: 'end', width: 320 }
    ]`,
    :items='filtered',
    :items-per-page='rowCount'
  )
    template(#item='{ item }')
      tr(:key='key(item)')
        td
          v-chip(:color='scoreColor(item.stufe)', variant='flat', size='small')
            | {{ item.score }}
          .text-caption.text-medium-emphasis {{ item.stufe }}
        td(style='cursor: pointer', @click='vergleichen(item)')
          .font-weight-medium(:class='"g-" + item.person_1.geschlecht')
            | {{ item.person_1.vorname }} {{ item.person_1.nachname }}
          .text-caption.text-medium-emphasis
            | {{ formatGebDat(item.person_1.gebDat) }} · ID {{ item.person_1.personID }}
          .text-caption.text-medium-emphasis(v-if='item.person_1.adresse')
            | {{ item.person_1.adresse }}
        td(style='cursor: pointer', @click='vergleichen(item)')
          .font-weight-medium(:class='"g-" + item.person_2.geschlecht')
            | {{ item.person_2.vorname }} {{ item.person_2.nachname }}
          .text-caption.text-medium-emphasis
            | {{ formatGebDat(item.person_2.gebDat) }} · ID {{ item.person_2.personID }}
          .text-caption.text-medium-emphasis(v-if='item.person_2.adresse')
            | {{ item.person_2.adresse }}
        td
          v-chip.ma-1(
            v-for='g in item.gruende',
            :key='g.code',
            size='x-small',
            variant='tonal',
            :color='regelInfo(g.code).color'
          )
            v-icon(start, size='x-small') {{ regelInfo(g.code).icon }}
            | {{ regelInfo(g.code).label }}
            v-tooltip(activator='parent', location='top') {{ g.text }}
        td.text-right(style='white-space: nowrap')
          v-btn.mr-1(
            size='small',
            variant='tonal',
            :color='item.vorschlagBehalten === item.person_1.personID ? "primary" : undefined',
            :disabled='!!busy',
            :loading='busy === key(item) + ":1"',
            @click='mergen(item, item.person_1, item.person_2)'
          )
            | {{ item.person_1.personID }} behalten
            v-tooltip(activator='parent', location='top')
              | {{ item.person_2.personID }} wird gelöscht
          v-btn.mr-1(
            size='small',
            variant='tonal',
            :color='item.vorschlagBehalten === item.person_2.personID ? "primary" : undefined',
            :disabled='!!busy',
            :loading='busy === key(item) + ":2"',
            @click='mergen(item, item.person_2, item.person_1)'
          )
            | {{ item.person_2.personID }} behalten
            v-tooltip(activator='parent', location='top')
              | {{ item.person_1.personID }} wird gelöscht
          v-btn.mr-1(
            icon,
            variant='text',
            size='small',
            :disabled='!!busy',
            @click='keinDuplikat(item)'
          )
            v-icon link_off
            v-tooltip(activator='parent', location='top') Kein Duplikat
          v-btn(icon, variant='text', size='small', @click='vergleichen(item)')
            v-icon compare_arrows
            v-tooltip(activator='parent', location='top') Details vergleichen

    template(#no-data)
      .pa-4.text-medium-emphasis Kein Vorschlag passt zur Suche.

  template(#dialogs)
    ec-dublette-merge(ref='mergeDialog')
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { API_BASE } from '../../../../plugins/apiBase'
import { useLogin } from '../../../../plugins/auth'
import { useDialog } from '../../../../plugins/dialog'
import { useRouter } from '../../../../plugins/router'
import { empty, errorHandler } from '../../../../helpers'
import filterGenerator from '../../../../util/filter.util'
import {
  formatGebDat,
  personName as name,
  regelInfo,
  scoreColor,
  paarKey,
  type DublettenPaar,
  type DublettenPerson
} from '../../../../util/dubletten.util'

/**
 * Vorgeschlagene Personen-Dubletten.
 *
 * Die Seite war seit dem ersten Commit ein Platzhalter ("EmptyComponent"),
 * obwohl der Menüeintrag existierte. `personen` hat UNIQUE(vorname, nachname,
 * gebDat) — exakt doppelte Sätze kann es also gar nicht geben; jede echte
 * Dublette unterscheidet sich in Schreibweise oder Geburtsdatum, und genau das
 * bewertet die Erkennung in der API (/v6/dubletten/kandidaten).
 *
 * Die Liste ist der Hauptarbeitsweg: jede Zeile trägt beide Richtungen und
 * "kein Duplikat" als Knöpfe, damit eine Liste von Vorschlägen ohne einen
 * einzigen Seitenwechsel abgearbeitet werden kann. Die Detailansicht
 * (/:idA/:idB) ist für die unklaren Fälle da.
 */

const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()
const { navigate, numberQueryRef, booleanQueryRef } = useRouter()

const mergeDialog = useTemplateRef<any>('mergeDialog')

const suche = ref('')
const personFilter = numberQueryRef('person')
const nurSichere = booleanQueryRef('sicher')
const paare = ref<DublettenPaar[]>([])
const loading = ref(true)
const fehler = ref<string | null>(null)
const schemaHinweis = ref<string | null>(null)
/** Paar-Key der laufenden Aktion; sperrt alle Knöpfe. */
const busy = ref<string | null>(null)
const stale = ref(false)
const zuletztIgnoriert = ref<DublettenPaar | null>(null)
const rowCount = ref(0)

const config = computed(() => ({
  title: 'Dubletten: Personen',
  subTitle: paare.value.length
    ? `${paare.value.length} Vorschläge`
    : 'keine Vorschläge',
  sheet: [
    {
      id: 'dub_neu',
      icon: 'refresh',
      label: 'Vorschläge neu berechnen',
      click: neuBerechnen
    },
    {
      id: 'dub_sicher',
      icon: 'filter_alt',
      label: nurSichere.value
        ? 'Alle Übereinstimmungen zeigen'
        : 'Nur hohe Übereinstimmung',
      click: () => {
        nurSichere.value = !nurSichere.value
      }
    }
  ]
}))

/**
 * Was die Suche durchsuchen darf.
 *
 * Bewusst nicht das ganze Paar-Objekt: `filterGenerator` geht rekursiv über alle
 * Felder, und dazu gehören die Begründungstexte. Eine Suche nach „Klein" traf
 * deshalb 12 von 14 Paaren — weil in der Behalten-Begründung „die kleinere ID"
 * steht. Gesucht wird hier nach Personen, also nur in Personendaten.
 */
function suchbar(p: DublettenPaar) {
  const felder = (q: typeof p.person_1) => ({
    vorname: q.vorname,
    nachname: q.nachname,
    gebDat: q.gebDat,
    personID: q.personID,
    adresse: q.adresse ?? '',
    emails: q.emails,
    telefone: q.telefone
  })
  return { a: felder(p.person_1), b: felder(p.person_2) }
}

const filtered = computed(() => {
  const passt = filterGenerator(suche.value)
  let liste = paare.value.filter((p) => passt(suchbar(p)))
  if (personFilter.value) {
    liste = liste.filter(
      (p) =>
        p.personID_1 === personFilter.value ||
        p.personID_2 === personFilter.value
    )
  }
  if (nurSichere.value) {
    liste = liste.filter((p) => p.stufe === 'hoch')
  }
  return liste
})

/** Ist die Anzeige eingeschränkt? Entscheidet, ob "x von y" sinnvoll ist. */
const gefiltert = computed(
  () => !!suche.value || !!personFilter.value || nurSichere.value
)

function key(p: DublettenPaar) {
  return paarKey(p.personID_1, p.personID_2)
}

function kopf() {
  return { authorization: authToken.value }
}

function jsonKopf() {
  return { ...kopf(), 'content-type': 'application/json' }
}

/** Meldungen aus der API kommen als text/plain (siehe helpers.errorHandler). */
function melde(err: any, titel: string) {
  const text = String(err?.message || err || 'Unbekannter Fehler')
  error({ text, title: titel })
}

function loadData() {
  loading.value = true
  fehler.value = null
  fetch(`${API_BASE}/v6/dubletten/kandidaten`, { headers: kopf() })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      paare.value = res.paare ?? []
      schemaHinweis.value = res.schemaHinweis ?? null
      stale.value = false
      zuletztIgnoriert.value = null
    })
    .catch((err: any) => {
      // Inline statt Modal: der Zustand muss sichtbar bleiben, auch nachdem ein
      // Dialog weggeklickt wäre.
      fehler.value = String(err?.message || err)
    })
    .finally(() => {
      loading.value = false
    })
}

function neuBerechnen() {
  loading.value = true
  fehler.value = null
  fetch(`${API_BASE}/v6/dubletten/neu-berechnen`, {
    method: 'POST',
    headers: kopf()
  })
    .then(errorHandler)
    .then(() => loadData())
    .catch((err: any) => {
      fehler.value = String(err?.message || err)
      loading.value = false
    })
}

/**
 * Zusammenführen. `behalten` bleibt, `entfernen` wird gelöscht.
 *
 * Nach Erfolg wird die Liste NICHT neu geladen: das erledigte Paar fliegt
 * lokal heraus, ebenso alle anderen Paare, die die gelöschte Person enthalten
 * (die sind ab jetzt ungültig). Das hält die Arbeitsliste stabil und spart den
 * Rundlauf.
 */
function mergen(
  paar: DublettenPaar,
  behalten: DublettenPerson,
  entfernen: DublettenPerson
) {
  const richtung = behalten.personID === paar.person_1.personID ? ':1' : ':2'
  mergeDialog.value
    ?.show(behalten, entfernen)
    .then(() => {
      busy.value = key(paar) + richtung
      return fetch(`${API_BASE}/v6/dubletten/merge`, {
        method: 'POST',
        headers: jsonKopf(),
        body: JSON.stringify({
          personID_behalten: behalten.personID,
          personID_entfernen: entfernen.personID,
          score: paar.score
        })
      })
        .then(errorHandler)
        .then((res) => res.json())
        .then(() => {
          const vorher = paare.value.length
          paare.value = paare.value.filter(
            (p) =>
              p.personID_1 !== entfernen.personID &&
              p.personID_2 !== entfernen.personID
          )
          // Mehr als nur dieses Paar verschwunden? Dann hingen weitere
          // Vorschläge an der gelöschten Person.
          if (vorher - paare.value.length > 1) stale.value = true
          notifyInfo(
            `${entfernen.vorname} ${entfernen.nachname} wurde mit ${behalten.vorname} ${behalten.nachname} zusammengeführt.`
          )
        })
        .catch((err: any) => melde(err, 'Zusammenführen fehlgeschlagen!'))
        .finally(() => {
          busy.value = null
        })
    })
    .catch(empty)
}

/**
 * Paar dauerhaft als "kein Duplikat" ablegen.
 *
 * Ohne Rückfrage, weil nichts gelöscht wird — dafür mit Rückgängig-Banner. Ein
 * Bestätigungsdialog pro Zeile würde das zügige Abarbeiten zunichte machen.
 */
function keinDuplikat(paar: DublettenPaar) {
  busy.value = key(paar)
  fetch(`${API_BASE}/v6/dubletten/kein-duplikat`, {
    method: 'POST',
    headers: jsonKopf(),
    body: JSON.stringify({
      personID_1: paar.personID_1,
      personID_2: paar.personID_2
    })
  })
    .then(errorHandler)
    .then(() => {
      paare.value = paare.value.filter((p) => key(p) !== key(paar))
      zuletztIgnoriert.value = paar
      notifyInfo('Als kein Duplikat gespeichert.')
    })
    .catch((err: any) => melde(err, 'Speichern fehlgeschlagen!'))
    .finally(() => {
      busy.value = null
    })
}

function ignorierenZurueck() {
  const paar = zuletztIgnoriert.value
  if (!paar) return
  busy.value = key(paar)
  fetch(
    `${API_BASE}/v6/dubletten/kein-duplikat/${paar.personID_1}/${paar.personID_2}`,
    { method: 'DELETE', headers: kopf() }
  )
    .then(errorHandler)
    .then(() => {
      paare.value = [paar, ...paare.value]
      zuletztIgnoriert.value = null
      notifyInfo('Markierung zurückgenommen.')
    })
    .catch((err: any) => melde(err, 'Rückgängig fehlgeschlagen!'))
    .finally(() => {
      busy.value = null
    })
}

function vergleichen(paar: DublettenPaar) {
  // navigate() setzt ?prev=, damit der X-Knopf der Detailansicht zurückführt.
  navigate(`/dublikate/personen/${paar.personID_1}/${paar.personID_2}`)
}

function getCount() {
  const tableHeight = window.innerHeight - 64 - 80 - 72 - 32 - 56 - 36 - 50 - 5
  rowCount.value = Math.max(5, Math.floor(tableHeight / 72))
}

loadData()
getCount()
</script>

<style scoped>
/* Keine Zeilenfarbe wie in der Personenliste: eine Zeile zeigt hier ZWEI
   Personen, eine durchgefärbte Zeile wäre also sinnlos. Stattdessen nur der
   Name dezent gefärbt (Werte aus config/theme.ts). */
.g-m {
  color: #4697ba;
}
.g-w {
  color: #c243aa;
}
</style>
