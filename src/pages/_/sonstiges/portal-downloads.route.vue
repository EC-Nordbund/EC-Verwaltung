<template lang="pug">
ec-wrapper(
  title='Portal-Downloads',
  subTitle='Formulare für Freizeitleitung und EC-Kreise',
  hasSheet,
  hasDial,
  hasHeader,
  hasReload,
  :sheet='config.sheet',
  @reload='laden'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Datei suchen', @suche='suche = $event')

  v-alert.ma-2(v-if='fehlt', type='warning', variant='tonal')
    | Die Tabelle für die Downloads fehlt in der Datenbank. Bitte
    | sql/portal-downloads.sql einspielen.

  v-alert.ma-2(
    v-else-if='!dateien.length',
    type='info',
    variant='tonal'
  )
    | Noch keine Dateien hinterlegt. Über das Menü oben rechts lädst du die
    | erste hoch.

  div(v-for='gruppe in gruppen', :key='gruppe.schluessel')
    v-list-subheader.mt-2 {{ gruppe.name }}
    v-list(lines='three')
      v-list-item(v-for='d in gruppe.dateien', :key='d.downloadID')
        template(#prepend)
          v-icon(:color='d.aktiv ? undefined : "error"')
            | {{ d.aktiv ? symbol(d.mimetype) : 'visibility_off' }}
        v-list-item-title
          | {{ d.titel }}
          v-chip.ml-2(v-if='d.kategorie', size='x-small', variant='outlined')
            | {{ d.kategorie }}
          v-chip.ml-2(v-if='!d.aktiv', size='x-small', color='error')
            | im Portal ausgeblendet
        v-list-item-subtitle
          div(v-if='d.beschreibung') {{ d.beschreibung }}
          div.text-caption
            | {{ d.dateiname }} · {{ groesse(d.groesse) }} · geändert am
            |  {{ datum(d.geaendert) }}
        template(#append)
          v-menu
            template(#activator='{ props }')
              v-btn(v-bind='props', icon, variant='text')
                v-icon more_vert
            v-list(density='compact')
              v-list-item(
                title='Herunterladen',
                prepend-icon='download',
                @click='herunterladen(d)'
              )
              v-list-item(
                title='Angaben bearbeiten',
                prepend-icon='edit',
                @click='bearbeiten(d)'
              )
              v-list-item(
                title='Datei ersetzen',
                prepend-icon='upload_file',
                @click='ersetzen(d)'
              )
              v-list-item(
                :title='d.aktiv ? "Im Portal ausblenden" : "Im Portal zeigen"',
                :prepend-icon='d.aktiv ? "visibility_off" : "visibility"',
                @click='speichern(d.downloadID, { aktiv: !d.aktiv })'
              )
              v-list-item(
                title='Löschen',
                prepend-icon='delete',
                @click='loeschen(d)'
              )

  v-dialog(v-model='offen', :max-width='700')
    v-card
      v-card-title(style='white-space: normal') {{ dialogTitel }}
      v-card-text
        v-select(
          v-if='!nurDatei',
          v-model='form.bereich',
          :items='bereichsListe',
          item-title='name',
          item-value='schluessel',
          label='Bereich',
          density='compact',
          hint='Wer die Datei im Portal sieht',
          persistent-hint
        )
        v-text-field(
          v-if='!nurDatei',
          v-model='form.titel',
          label='Titel',
          density='compact',
          :counter='200'
        )
        v-combobox(
          v-if='!nurDatei',
          v-model='form.kategorie',
          :items='kategorien',
          label='Kategorie',
          density='compact',
          clearable,
          hint='Gruppiert die Liste im Portal — vorhandene auswählen oder neue eintippen',
          persistent-hint
        )
        v-textarea(
          v-if='!nurDatei',
          v-model='form.beschreibung',
          label='Beschreibung',
          rows='2',
          density='compact',
          :counter='500'
        )
        v-file-input.mt-2(
          v-if='!nurAngaben',
          v-model='datei',
          label='Datei',
          density='compact',
          prepend-icon='attach_file',
          show-size,
          :accept='typen.join(",")',
          :hint='dateiHinweis',
          persistent-hint
        )
        v-alert.mt-3(
          v-if='nurDatei',
          type='warning',
          variant='tonal',
          density='compact'
        )
          | Die bisherige Datei wird ersetzt und ist danach nicht mehr
          | abrufbar. Der Eintrag und sein Link bleiben gleich.
      v-card-actions
        v-btn(variant='text', @click='offen = false') Abbrechen
        v-spacer
        v-btn(
          variant='text',
          color='primary',
          :loading='laeuft',
          :disabled='!bereit',
          @click='absenden'
        ) Speichern
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { API_BASE } from '../../../plugins/apiBase'
import { errorHandler } from '../../../helpers'

/**
 * Pflege des Download-Bereichs im EC-Portal.
 *
 * Die Dateien liegen als Blob in der Datenbank (`portalDownload`) und nicht im
 * Dateisystem: die API läuft ohne dauerhaftes Volume, die Sicherung ist der
 * DB-Dump. Eine Datei daneben wäre nach dem nächsten Deployment weg.
 *
 * Zwei feste Bereiche — „Für Freizeiten" sieht, wer eine Veranstaltung leitet
 * (inklusive Küchenleitung), „Für EC-Kreise" sieht, wer für einen Kreis
 * zuständig ist. Wer beides macht, sieht beides.
 */
const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()

const dateien = ref<any[]>([])
const bereichsListe = ref<{ schluessel: string; name: string }[]>([])
const typen = ref<string[]>([])
const typenKlartext = ref<string[]>([])
const maxBytes = ref(10 * 1024 * 1024)
const fehlt = ref(false)
const suche = ref('')

const offen = ref(false)
const laeuft = ref(false)
const datei = ref<File | File[] | null>(null)
const bearbeitet = ref<any>(null)
const nurDatei = ref(false)
const form = ref<any>({
  bereich: 'freizeit',
  titel: '',
  kategorie: '',
  beschreibung: ''
})

const config = {
  sheet: [
    {
      id: 'download_add',
      icon: 'upload_file',
      label: 'Datei hochladen',
      click: () => hochladen()
    }
  ]
}

const nurAngaben = computed(() => !!bearbeitet.value && !nurDatei.value)

const dialogTitel = computed(() => {
  if (nurDatei.value) return `Datei ersetzen: ${bearbeitet.value?.titel}`
  if (bearbeitet.value) return `Bearbeiten: ${bearbeitet.value.titel}`
  return 'Datei hochladen'
})

const dateiHinweis = computed(
  () =>
    `Höchstens ${Math.round(maxBytes.value / 1024 / 1024)} MB. Erlaubt: ${typenKlartext.value.join(', ')}`
)

const bereit = computed(() => {
  if (nurDatei.value) return !!gewaehlteDatei()
  if (!form.value.titel?.trim()) return false
  return bearbeitet.value ? true : !!gewaehlteDatei()
})

const gefiltert = computed(() => {
  const s = suche.value.trim().toLowerCase()
  if (!s) return dateien.value
  return dateien.value.filter((d) =>
    `${d.titel} ${d.beschreibung} ${d.kategorie} ${d.dateiname}`
      .toLowerCase()
      .includes(s)
  )
})

/** Nach Bereich gruppiert; leere Bereiche fallen weg. */
const gruppen = computed(() =>
  bereichsListe.value
    .map((b) => ({
      ...b,
      dateien: gefiltert.value.filter((d) => d.bereich === b.schluessel)
    }))
    .filter((b) => b.dateien.length)
)

/** Vorhandene Kategorien als Vorschlagsliste — beide Bereiche zusammen. */
const kategorien = computed(() => [
  ...new Set(dateien.value.map((d) => d.kategorie).filter(Boolean))
])

function gewaehlteDatei(): File | null {
  const d = datei.value
  if (!d) return null
  return Array.isArray(d) ? (d[0] ?? null) : d
}

function symbol(mimetype: string) {
  if (mimetype.includes('pdf')) return 'picture_as_pdf'
  if (mimetype.startsWith('image/')) return 'image'
  if (mimetype.includes('sheet') || mimetype.includes('excel'))
    return 'table_view'
  if (mimetype.includes('zip')) return 'folder_zip'
  return 'description'
}

function groesse(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function datum(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function laden() {
  fetch(`${API_BASE}/v6/portal-download`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      dateien.value = res.dateien
      bereichsListe.value = Object.entries(res.bereiche).map(
        ([schluessel, name]) => ({ schluessel, name: String(name) })
      )
      typen.value = res.typen
      typenKlartext.value = res.typenKlartext
      maxBytes.value = res.maxBytes
      fehlt.value = false
    })
    .catch((err: any) => {
      const txt = String(err.message || err)
      if (txt.includes('nicht eingerichtet')) {
        fehlt.value = true
        return
      }
      error({ text: txt, title: 'Laden fehlgeschlagen!' })
    })
}

laden()

function hochladen() {
  bearbeitet.value = null
  nurDatei.value = false
  datei.value = null
  form.value = {
    bereich: bereichsListe.value[0]?.schluessel ?? 'freizeit',
    titel: '',
    kategorie: '',
    beschreibung: ''
  }
  offen.value = true
}

function bearbeiten(d: any) {
  bearbeitet.value = d
  nurDatei.value = false
  datei.value = null
  form.value = {
    bereich: d.bereich,
    titel: d.titel,
    kategorie: d.kategorie,
    beschreibung: d.beschreibung
  }
  offen.value = true
}

function ersetzen(d: any) {
  bearbeitet.value = d
  nurDatei.value = true
  datei.value = null
  offen.value = true
}

/** Datei als base64 lesen — ohne den data:-Präfix, den readAsDataURL voranstellt. */
function alsBase64(f: File): Promise<string> {
  return new Promise((auf, ab) => {
    const leser = new FileReader()
    leser.onload = () => auf(String(leser.result).split(',')[1] ?? '')
    leser.onerror = () => ab(new Error('Die Datei ließ sich nicht lesen.'))
    leser.readAsDataURL(f)
  })
}

async function absenden() {
  laeuft.value = true
  try {
    const f = gewaehlteDatei()
    const rumpf: any = nurDatei.value ? {} : { ...form.value }

    if (f) {
      if (f.size > maxBytes.value) {
        throw new Error(
          `Die Datei ist ${groesse(f.size)} groß, erlaubt sind ${groesse(maxBytes.value)}.`
        )
      }
      rumpf.dateiname = f.name
      // Der Browser lässt den Typ bei unbekannten Endungen leer; der Server
      // lehnt das mit einer verständlichen Meldung ab.
      rumpf.mimetype = f.type || 'application/octet-stream'
      rumpf.inhalt = await alsBase64(f)
    }

    const ziel = bearbeitet.value
      ? `${API_BASE}/v6/portal-download/${bearbeitet.value.downloadID}`
      : `${API_BASE}/v6/portal-download`

    await fetch(ziel, {
      method: bearbeitet.value ? 'PUT' : 'POST',
      headers: {
        authorization: authToken.value,
        'content-type': 'application/json'
      },
      body: JSON.stringify(rumpf)
    }).then(errorHandler)

    notifyInfo(bearbeitet.value ? 'Gespeichert.' : 'Datei hochgeladen.')
    offen.value = false
    laden()
  } catch (err: any) {
    error({ text: err.message || err, title: 'Speichern fehlgeschlagen!' })
  } finally {
    laeuft.value = false
  }
}

function speichern(downloadID: number, aenderung: Record<string, unknown>) {
  fetch(`${API_BASE}/v6/portal-download/${downloadID}`, {
    method: 'PUT',
    headers: {
      authorization: authToken.value,
      'content-type': 'application/json'
    },
    body: JSON.stringify(aenderung)
  })
    .then(errorHandler)
    .then(() => laden())
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Speichern fehlgeschlagen!' })
    )
}

function loeschen(d: any) {
  if (
    !window.confirm(
      `"${d.titel}" wirklich löschen? Die Datei ist danach weg und im Portal nicht mehr abrufbar.`
    )
  ) {
    return
  }

  fetch(`${API_BASE}/v6/portal-download/${d.downloadID}`, {
    method: 'DELETE',
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo('Gelöscht.')
      laden()
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Löschen fehlgeschlagen!' })
    )
}

/**
 * Herunterladen mit Anmeldung: ein <a href> schickt den Authorization-Header
 * nicht mit, die Datei muss also geholt und als Blob weitergereicht werden.
 */
function herunterladen(d: any) {
  fetch(`${API_BASE}/v6/portal-download/${d.downloadID}/datei`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.blob())
    .then((blob) => {
      const a = document.getElementById('ec-download') as HTMLAnchorElement
      const url = URL.createObjectURL(blob)
      a.href = url
      a.download = d.dateiname
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Download fehlgeschlagen!' })
    )
}
</script>
