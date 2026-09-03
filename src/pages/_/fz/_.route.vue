<template lang="pug">
ec-wrapper(:title='title', subTitle='Führungszeugnisse', hasReload, @reload='loadData')
  .d-flex.align-center.ga-4.px-4.pt-2
    v-select(
      v-model='mode',
      :items='modeItems',
      label='Auswahl',
      density='compact',
      hide-details,
      style='max-width: 320px'
    )
    v-btn(
      color='primary',
      variant='flat',
      :disabled='currentData.length === 0',
      @click='download'
    ) Download
  v-data-table(
    :headers=`[
      { title: 'Name', key: 'nachname' },
      { title: 'Letztes FZ', key: 'datumDesLetztenFZ.input' },
      { title: 'Letzter FZ-Antrag', key: 'letzterAntrag', sortable: false }
    ]`,
    :items='currentData',
    :items-per-page='rowCount'
  )
    template(#item='{ item }')
      tr(
        :style='state(item)',
        @click='navigate({ path: `/personen/${item.personID}/home` })'
      )
        td {{ item.vorname }} {{ item.nachname }} {{ item.gebDat.german }}
        td {{ item.datumDesLetztenFZ ? item.datumDesLetztenFZ.german : 'N/A' }}
        td {{ letzterAntragText(item) }}
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApollo } from '../../../plugins/apollo'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { useRouter } from '../../../plugins/router'

interface FzAntrag {
  erzeugt: { german: string; input: string }
  erzeugt_durch: string
}

interface Fz {
  gesehenVon: { vorname: string; nachname: string }
  fzVon: { german: string }
  gesehenAm: { german: string }
  kommentar: string
}

interface Person {
  personID: number
  vorname: string
  nachname: string
  gebDat: { german: string }
  geschlecht: 'm' | 'w'
  fzs: Fz[]
  fzAntraege: FzAntrag[]
  datumDesLetztenFZ: { german: string; input: string } | null
}

interface EcKreis {
  ecKreisID: number
  bezeichnung: string
  fzPersonen: Person[]
}

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { navigate } = useRouter()

const mode = ref<number | 'all'>('all')
const ecKreisData = ref<EcKreis[]>([])
const fzData = ref<Person[]>([])
const rowCount = ref(0)

const modeItems = computed(() => [
  { title: 'Alles', value: 'all' as const },
  ...ecKreisData.value.map((v, i) => ({ title: v.bezeichnung, value: i }))
])

const currentData = computed(() =>
  mode.value === 'all'
    ? fzData.value
    : (ecKreisData.value[mode.value as number]?.fzPersonen ?? [])
)

const title = computed(() =>
  mode.value === 'all'
    ? 'Alle FZ-Personen'
    : `EC-Kreis ${ecKreisData.value[mode.value as number]?.bezeichnung ?? ''}`
)

/** Jüngster FZ-Antrag einer Person (null, wenn es keinen gibt). */
function letzterAntrag(p: Person): FzAntrag | null {
  return p.fzAntraege.reduce<FzAntrag | null>(
    (acc, c) => (acc === null || c.erzeugt.input > acc.erzeugt.input ? c : acc),
    null
  )
}

function letzterAntragText(p: Person) {
  const a = letzterAntrag(p)
  return a === null ? 'N/A' : `${a.erzeugt.german} - ${a.erzeugt_durch}`
}

const JAHR_MS = 1000 * 60 * 60 * 24 * 365.25

/**
 * Zeilenfarbe (1:1 aus dem Alt-Stand, Branch old-version):
 * - FZ vorhanden und jünger als 4,5 Jahre  -> unauffällig
 * - FZ zwischen 4,5 und 5 Jahren alt       -> orange Schrift (läuft bald ab)
 * - FZ älter als 5 Jahre                   -> rote Schrift, mit offenem
 *                                             Antrag rot hinterlegt
 * - gar kein FZ                            -> orange hinterlegt, und rot,
 *                                             wenn der Antrag > 28 Tage alt ist
 */
function state(p: Person) {
  const now = new Date().getTime()
  const newest = letzterAntrag(p)
  const newTime = newest ? new Date(newest.erzeugt.input).getTime() : 0

  if (p.datumDesLetztenFZ) {
    const last = new Date(p.datumDesLetztenFZ.input).getTime()

    if (now > last + JAHR_MS * 5) {
      return newest !== null ? 'background: red' : 'color: red'
    }
    if (now < last + JAHR_MS * 4.5) {
      return ''
    }
    return 'color: orange'
  }

  if ((now - newTime) / 1000 / 60 / 60 / 24 > 28) {
    return 'background: red'
  }
  return 'background: orange'
}

/** Semikolon-CSV: Felder mit ; " oder Zeilenumbruch müssen gequotet werden. */
function csvCell(value: unknown) {
  const s = String(value ?? '')
  return /[";\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

function download() {
  const header = [
    'PersID',
    'Vorname',
    'Nachname',
    'GeburtsDatum',
    'Geschlecht',
    'FZ - gesehen Von',
    'FZ - gesehen Am',
    'FZ - ausgestellt Am',
    'FZ - Kommentar',
    'FZ-Antrag - Vom',
    'FZ-Antrag - Erzeugt durch'
  ]

  const rows = currentData.value.map((v) => {
    const lFZ = v.datumDesLetztenFZ
      ? v.fzs.filter((f) => f.fzVon.german === v.datumDesLetztenFZ!.german)[0]
      : undefined
    const lAntrag = letzterAntrag(v)

    return [
      v.personID,
      v.vorname,
      v.nachname,
      v.gebDat.german,
      v.geschlecht,
      ...(lFZ
        ? [
            `${lFZ.gesehenVon.vorname} ${lFZ.gesehenVon.nachname}`,
            lFZ.gesehenAm.german,
            lFZ.fzVon.german,
            lFZ.kommentar
          ]
        : ['N/A', 'N/A', 'N/A', 'N/A']),
      ...(lAntrag
        ? [lAntrag.erzeugt.german, lAntrag.erzeugt_durch]
        : ['N/A', 'N/A'])
    ]
      .map(csvCell)
      .join(';')
  })

  // BOM, sonst zeigt Excel die Umlaute in den Namen als Mojibake
  const file = '﻿' + [header.join(';'), ...rows].join('\n')
  const url = URL.createObjectURL(
    new Blob([file], { type: 'text/csv;charset=utf-8' })
  )

  const a = document.getElementById('ec-download') as HTMLAnchorElement
  a.href = url
  a.download = `${title.value}.csv`
  a.click()
  // Ohne Verzögerung bricht Chromium den Download gelegentlich ab
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

const PERSON_FIELDS = `
  personID
  vorname
  nachname
  gebDat {
    german
  }
  geschlecht
  fzs {
    gesehenVon {
      vorname
      nachname
    }
    fzVon {
      german
    }
    gesehenAm {
      german
    }
    kommentar
  }
  fzAntraege {
    erzeugt {
      german
      input
    }
    erzeugt_durch
  }
  datumDesLetztenFZ {
    german
    input
  }
`

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!) {
          ecKreise(authToken: $authToken) {
            ecKreisID
            bezeichnung
            fzPersonen {
              ${PERSON_FIELDS}
            }
          }
        }
      `,
      variables: { authToken: authToken.value },
      fetchPolicy: 'no-cache'
    })
    .then((res: any) => {
      ecKreisData.value = res.data.ecKreise
    })
    .catch((err: any) => {
      error({ text: err.message, title: 'Laden fehlgeschlagen!' })
    })

  client
    .query({
      query: gql`
        query ($authToken: String!) {
          fzPersonen(authToken: $authToken) {
            ${PERSON_FIELDS}
          }
        }
      `,
      variables: { authToken: authToken.value },
      fetchPolicy: 'no-cache'
    })
    .then((res: any) => {
      fzData.value = res.data.fzPersonen
    })
    .catch((err: any) => {
      error({ text: err.message, title: 'Laden fehlgeschlagen!' })
    })
}

function getCount() {
  const tableHeight = window.innerHeight - 64 - 80 - 72 - 32 - 56 - 36 - 50 - 5
  rowCount.value = Math.floor(tableHeight / 50)
}

loadData()
getCount()
</script>
