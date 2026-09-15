<template lang="pug">
div
  v-alert.mb-4(v-if='schemaHinweis', type='warning', variant='tonal') {{ schemaHinweis }}
  v-alert.mb-4(v-if='fehler', type='error', variant='tonal') {{ fehler }}
  v-progress-linear(v-if='loading', indeterminate, color='primary')
  p.text-medium-emphasis(v-if='!loading && !fehler && eintraege.length === 0') Keine Einträge.
  v-timeline(v-if='eintraege.length > 0', side='end', density='compact', align='start')
    v-timeline-item(
      v-for='e in eintraege',
      :key='e.protokollID',
      :dot-color='aktionInfo(e.aktion).color',
      :icon='aktionInfo(e.aktion).icon',
      size='small'
    )
      .d-flex.flex-wrap.align-center.ga-2
        strong {{ aktionInfo(e.aktion).label }}
        span.text-medium-emphasis {{ eintragZeit(e.ts) }} · {{ e.benutzer || "unbekannt" }}
      //- Auf Freizeit-Ebene steht die Person dabei — sonst wüsste man bei
      //- einer gelöschten Anmeldung nicht mehr, wen es betraf.
      .text-body-2(v-if='mitPerson')
        a(
          v-if='e.aktion !== "loeschen" && anmeldungExistiert(e)',
          href='#',
          @click.prevent='navigate(`/anmeldungen/${e.anmeldeID}/home`)'
        ) {{ e.person || `Person ${e.personID}` }}
        a(
          v-else,
          href='#',
          @click.prevent='navigate(`/personen/${e.personID}/home`)'
        ) {{ e.person || `Person ${e.personID}` }}
        span.text-medium-emphasis  ({{ e.anmeldeID }})
      .text-body-2.mt-1(v-if='e.begruendung') „{{ e.begruendung }}“
      v-table.mt-2(
        v-if='zeilen(e).length > 0',
        density='compact',
        style='max-width: 640px'
      )
        tbody
          tr(v-for='z in zeilen(e)', :key='z.label')
            td.text-medium-emphasis(style='width: 40%') {{ z.label }}
            td(v-if='e.aktion === "loeschen"') {{ z.nach }}
            td(v-else) {{ z.von }} → {{ z.nach }}
      .text-caption.text-medium-emphasis.mt-1(v-if='e.aktion === "loeschen"') Stand zum Zeitpunkt der Löschung
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { API_BASE } from '../plugins/apiBase'
import { useLogin } from '../plugins/auth'
import { useRouter } from '../plugins/router'
import { errorHandler } from '../helpers'
import {
  aenderungen,
  aktionInfo,
  eintragZeit,
  endstand,
  type ProtokollEintrag
} from '../util/anmeldungProtokoll.util'

/**
 * Protokoll-Liste für eine Anmeldung oder eine ganze Freizeit.
 *
 * Genau einer der beiden Filter wird gesetzt. `reloadKey` erlaubt dem
 * Eltern-Layout, nach einer Aktion (Rücknahme) neu laden zu lassen, ohne die
 * Komponente neu zu erzeugen.
 */
const props = defineProps<{
  anmeldeID?: string
  veranstaltungsID?: number | string
  reloadKey?: number
}>()

defineOptions({ name: 'EcAnmeldungProtokoll' })

const { authToken } = useLogin()
const { navigate } = useRouter()

const eintraege = ref<ProtokollEintrag[]>([])
const loading = ref(false)
const fehler = ref<string | null>(null)
const schemaHinweis = ref<string | null>(null)

const mitPerson = computed(() => !props.anmeldeID)

/**
 * Gelöschte anmeldeIDs sammeln: ältere Einträge derselben ID (abmelden, eine
 * frühere Rücknahme) sollen nicht auf eine Seite verlinken, die es nicht mehr
 * gibt — sie führen stattdessen zur Person.
 */
const geloeschteIDs = computed(
  () =>
    new Set(
      eintraege.value
        .filter((e) => e.aktion === 'loeschen')
        .map((e) => e.anmeldeID)
    )
)

function anmeldungExistiert(e: ProtokollEintrag) {
  return !geloeschteIDs.value.has(e.anmeldeID)
}

function zeilen(e: ProtokollEintrag) {
  return e.aktion === 'loeschen' ? endstand(e) : aenderungen(e)
}

function laden() {
  const params = new URLSearchParams()
  if (props.anmeldeID) params.set('anmeldeID', props.anmeldeID)
  if (props.veranstaltungsID)
    params.set('veranstaltungsID', String(props.veranstaltungsID))
  if ([...params.keys()].length === 0) return

  loading.value = true
  fehler.value = null
  fetch(`${API_BASE}/v6/anmeldung/protokoll?${params}`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      eintraege.value = res.eintraege ?? []
      schemaHinweis.value = res.schemaHinweis ?? null
    })
    .catch((err: any) => {
      fehler.value = String(err?.message || err)
    })
    .finally(() => {
      loading.value = false
    })
}

watch(() => [props.anmeldeID, props.veranstaltungsID, props.reloadKey], laden, {
  immediate: true
})
</script>
