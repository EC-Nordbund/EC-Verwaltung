<template lang="pug">
ec-wrapper(
  title='Dateivorlagen',
  subTitle='Briefe, Formulare und Texte, die die API verschickt und erzeugt',
  hasSheet,
  hasDial,
  hasHeader,
  hasReload,
  :sheet='config.sheet',
  @reload='laden'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Vorlage suchen', @suche='suche = $event')

  v-alert.ma-2(v-if='fehlt', type='warning', variant='tonal')
    | Die Tabellen für die Dateivorlagen fehlen in der Datenbank. Bitte
    | sql/datei-vorlagen.sql einspielen. Bis dahin nimmt die API die Dateien,
    | die mit dem Deployment ausgeliefert wurden.

  v-alert.ma-2(
    v-for='(w, i) in warnungen',
    :key='`warnung-${i}`',
    type='error',
    variant='tonal',
    density='compact'
  ) {{ w }}

  v-alert.ma-2(
    v-if='imContainer.length',
    type='warning',
    variant='tonal',
    density='compact'
  )
    | {{ containerHinweis }}
    template(#append)
      v-btn(
        variant='text',
        size='small',
        :loading='laeuft',
        @click='uebernehmenAlle'
      ) Alle übernehmen

  div(v-for='gruppe in gruppiert', :key='gruppe.schluessel')
    v-list-subheader.mt-2 {{ gruppe.name }}
    v-list(lines='three')
      v-list-item(
        v-for='v in gruppe.vorlagen',
        :key='v.schluessel',
        @click='oeffnen(v)'
      )
        template(#prepend)
          v-icon(:color='statusFarbe(v.status)') {{ symbol(v.art) }}
        v-list-item-title
          | {{ v.name }}
          v-chip.ml-2(
            size='x-small',
            :color='statusFarbe(v.status)',
            variant='flat'
          ) {{ statusText(v.status) }}
        v-list-item-subtitle
          div {{ v.beschreibung }}
          div.text-caption
            template(v-if='v.dateiname')
              | {{ v.dateiname }}
              //- Die Größe kennt die API nur für Einträge in der Datenbank.
              span(v-if='v.groesse != null')  · {{ groesse(v.groesse) }}
              span(v-if='v.status === "db"')
                |  · geändert am {{ datum(v.geaendertAm) }}
                span(v-if='v.benutzer')  von {{ v.benutzer }}
            template(v-else) Keine Datei vorhanden.
        template(#append)
          v-icon edit

  //- Dialog je Vorlage: Datei bzw. Text bearbeiten, Historie.
  v-dialog(v-model='offen', :max-width='900', scrollable)
    v-card(v-if='aktuell')
      v-card-title(style='white-space: normal')
        | {{ aktuell.name }}
        v-chip.ml-2(
          size='small',
          :color='statusFarbe(aktuell.status)',
          variant='flat'
        ) {{ statusText(aktuell.status) }}
      v-card-subtitle(style='white-space: normal') {{ aktuell.beschreibung }}

      v-tabs(v-model='reiter', density='compact')
        v-tab(value='datei') {{ aktuell.art === 'md' ? 'Text' : 'Datei' }}
        v-tab(value='historie') Frühere Fassungen

      v-divider

      v-card-text(style='max-height: 65vh')
        div(v-if='reiter === "datei"')
          p.text-body-2(v-if='aktuell.verwendung')
            strong Verwendung:
            |  {{ aktuell.verwendung }}

          .mb-3(v-if='aktuell.platzhalter.length')
            span.text-caption.mr-2 Platzhalter, die die API einsetzt:
            v-chip.mr-1.mb-1(
              v-for='p in aktuell.platzhalter',
              :key='p',
              size='small',
              variant='outlined'
            ) {{ p }}

          v-alert.mb-3(
            v-if='aktuell.status === "container"',
            type='warning',
            variant='tonal',
            density='compact'
          )
            | Diese Datei liegt nur im Dateisystem des API-Servers. Bitte in die
            | Datenbank übernehmen, sonst ist sie nach dem nächsten Deployment weg.
          v-alert.mb-3(
            v-else-if='aktuell.status === "fehlt"',
            type='error',
            variant='tonal',
            density='compact'
          )
            | Es gibt weder eine Datei in der Datenbank noch eine ausgelieferte.
            | Alles, was diese Vorlage braucht, schlägt fehl, bis eine hochgeladen ist.
          v-alert.mb-3(
            v-else-if='aktuell.status === "auslieferung"',
            type='info',
            variant='tonal',
            density='compact'
          )
            | Es gilt die Fassung, die mit dem Code ausgeliefert wurde. Eine
            | hochgeladene Datei hat Vorrang; „Zurücksetzen" nimmt sie wieder weg.

          .text-body-2.mb-3(v-if='aktuell.dateiname')
            | Aktuell: <strong>{{ aktuell.dateiname }}</strong>
            span(v-if='aktuell.groesse != null')  · {{ groesse(aktuell.groesse) }}
            span(v-if='aktuell.status === "db"')
              |  · gespeichert am {{ datum(aktuell.geaendertAm) }}
              span(v-if='aktuell.benutzer')  von {{ aktuell.benutzer }}

          .mb-4
            v-btn.mr-2.mb-1(
              v-if='aktuell.dateiname',
              variant='tonal',
              size='small',
              prepend-icon='download',
              @click='herunterladen(aktuell)'
            ) Herunterladen
            v-btn.mr-2.mb-1(
              v-if='aktuell.kannUebernehmen',
              variant='tonal',
              size='small',
              color='warning',
              prepend-icon='save',
              :loading='laeuft',
              @click='uebernehmen(aktuell)'
            ) In die Datenbank übernehmen
            v-btn.mr-2.mb-1(
              v-if='aktuell.kannProbe && aktuell.art !== "md" && aktuell.dateiname',
              variant='tonal',
              size='small',
              prepend-icon='preview',
              :loading='laeuft',
              @click='probe(aktuell)'
            ) {{ probeText(aktuell.art) }}
            v-btn.mr-2.mb-1(
              v-if='aktuell.kannZuruecksetzen',
              variant='tonal',
              size='small',
              color='error',
              prepend-icon='restart_alt',
              @click='entfernen(aktuell)'
            ) Auf Auslieferungsstand zurücksetzen
            v-btn.mr-2.mb-1(
              v-else-if='aktuell.kannLoeschen',
              variant='tonal',
              size='small',
              color='error',
              prepend-icon='delete',
              @click='entfernen(aktuell)'
            ) Löschen

          v-divider.mb-3

          //- Text-Vorlagen (Markdown) werden direkt hier bearbeitet.
          template(v-if='aktuell.art === "md"')
            v-textarea(
              v-model='text',
              label='Text (Markdown)',
              rows='16',
              :loading='textLaedt',
              style='font-family: monospace; font-size: 13px'
            )
            v-text-field(
              v-model='anmerkung',
              label='Anmerkung zur Änderung (optional)',
              density='compact',
              :counter='200'
            )
            .d-flex
              v-btn(
                variant='tonal',
                size='small',
                prepend-icon='preview',
                :loading='laeuft',
                @click='vorschauText'
              ) Vorschau
              v-spacer
              v-btn(
                variant='text',
                color='primary',
                :disabled='!textGeaendert',
                :loading='laeuft',
                @click='speichernText'
              ) Speichern

          //- Binaere Vorlagen: Datei ersetzen. Vor dem Speichern laesst sich
          //- die noch nicht gespeicherte Datei mit Beispieldaten probieren.
          template(v-else)
            v-file-input(
              v-model='datei',
              :label='aktuell.dateiname ? "Datei ersetzen" : "Datei hochladen"',
              density='compact',
              prepend-icon='attach_file',
              show-size,
              :accept='akzeptiert(aktuell.art)',
              :hint='dateiHinweis(aktuell.art)',
              persistent-hint
            )
            v-text-field.mt-2(
              v-model='anmerkung',
              label='Anmerkung zur Änderung (optional)',
              density='compact',
              :counter='200'
            )
            .d-flex.mt-1
              v-btn(
                v-if='aktuell.kannProbe',
                variant='tonal',
                size='small',
                prepend-icon='preview',
                :disabled='!gewaehlteDatei()',
                :loading='laeuft',
                @click='probe(aktuell, true)'
              ) Neue Datei probieren
              v-spacer
              v-btn(
                variant='text',
                color='primary',
                :disabled='!gewaehlteDatei()',
                :loading='laeuft',
                @click='hochladen'
              ) Speichern

        div(v-else)
          v-alert(
            v-if='!versionen.length',
            type='info',
            variant='tonal',
            density='compact'
          ) Es gibt keine früheren Fassungen.
          v-list(v-else, density='compact', lines='two')
            v-list-item(v-for='f in versionen', :key='f.versionID')
              v-list-item-title
                | {{ datum(f.ts) }}, {{ zeit(f.ts) }} Uhr
                span(v-if='f.benutzer')  · {{ f.benutzer }}
              v-list-item-subtitle
                | {{ f.dateiname }} · {{ groesse(f.groesse) }}{{ f.anmerkung ? ' · ' + f.anmerkung : '' }}
              template(#append)
                v-btn(
                  variant='text',
                  size='small',
                  icon,
                  title='Diese Fassung herunterladen',
                  @click='herunterladenVersion(f)'
                )
                  v-icon download
                v-btn(
                  variant='text',
                  size='small',
                  @click='wiederherstellen(f)'
                ) Zurückholen

      v-divider
      v-card-actions
        v-btn(variant='text', @click='offen = false') Schließen

  //- Neues Familienmitglied, z. B. der Sicherungsschein fuers naechste Jahr.
  v-dialog(v-model='jahrOffen', :max-width='600')
    v-card(v-if='jahrFamilie')
      v-card-title(style='white-space: normal') {{ jahrFamilie.name }} für ein Jahr hinzufügen
      v-card-text
        v-combobox(
          v-model='jahr',
          :items='jahrFamilie.vorschlaege.map(String)',
          label='Jahr',
          density='compact',
          hint='Das Jahr, in dem die Veranstaltung beginnt',
          persistent-hint
        )
        v-file-input.mt-3(
          v-model='jahrDatei',
          label='Datei',
          density='compact',
          prepend-icon='attach_file',
          show-size,
          :accept='akzeptiert(jahrFamilie.art)',
          :hint='dateiHinweis(jahrFamilie.art)',
          persistent-hint
        )
      v-card-actions
        v-btn(variant='text', @click='jahrOffen = false') Abbrechen
        v-spacer
        v-btn(
          variant='text',
          color='primary',
          :disabled='!jahrBereit',
          :loading='laeuft',
          @click='jahrSpeichern'
        ) Hochladen

  //- HTML-Vorschau eines Textes, so wie er in der Mail steht.
  v-dialog(v-model='vorschauOffen', :max-width='800', scrollable)
    v-card
      v-card-title Vorschau
      v-divider
      v-card-text(style='max-height: 70vh')
        //- Die API rendert Markdown zu HTML und weist Skript-Anteile beim
        //- Speichern ab; die Vorschau zeigt genau das, was in die Mail geht.
        div(v-html='vorschauHtml')
      v-divider
      v-card-actions
        v-spacer
        v-btn(variant='text', @click='vorschauOffen = false') Schließen
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { API_BASE } from '../../../plugins/apiBase'
import { errorHandler } from '../../../helpers'

/**
 * Pflege der Dateivorlagen der API.
 *
 * Bestätigungsbriefe, Sicherungsscheine, der Führungszeugnis-Antrag, die
 * TN-Listen-Vorlagen und die Datenschutztexte der Anmeldemails lagen bis
 * 09/2026 als Dateien neben dem API-Code — einige nur auf dem Prod-Server,
 * von Hand hingelegt. Der Sicherungsschein fürs nächste Jahr brauchte damit
 * einen Entwickler und ein Deployment.
 *
 * Jetzt liegen sie als Blob in der Datenbank (`dateiVorlage`) und werden hier
 * hochgeladen. Welche Vorlagen es gibt, bestimmt weiterhin der Code (Katalog
 * in der API); nur bei Familien wie dem Sicherungsschein lassen sich neue
 * Mitglieder (Jahre) anlegen. Fehlt ein Eintrag in der Datenbank, nimmt die
 * API die mit dem Code ausgelieferte Datei — solange es sie gibt.
 *
 * Jede Änderung legt die vorherige Fassung in der Historie ab und lässt sich
 * zurückholen. Vor dem Speichern lässt sich eine Datei mit Beispieldaten
 * probieren, damit ein falscher Platzhalter nicht erst im echten Brief auffällt.
 */
const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()

const BASE = `${API_BASE}/v6/dateivorlage`

interface Vorlage {
  schluessel: string
  gruppe: string
  name: string
  beschreibung: string
  verwendung: string
  art: 'docx' | 'xlsx' | 'pdf' | 'md'
  platzhalter: string[]
  status: 'db' | 'auslieferung' | 'container' | 'fehlt'
  dateiname: string | null
  mimetype: string | null
  groesse: number | null
  sha256: string | null
  geaendertAm: string | null
  benutzer: string
  kannLoeschen: boolean
  kannZuruecksetzen: boolean
  kannProbe: boolean
  kannUebernehmen: boolean
  familie: string | null
}

interface Familie {
  schluessel: string
  name: string
  art: Vorlage['art']
  vorschlaege: number[]
}

const gruppen = ref<{ schluessel: string; name: string }[]>([])
const vorlagen = ref<Vorlage[]>([])
const familien = ref<Familie[]>([])
const warnungen = ref<string[]>([])
const maxBytes = ref(10 * 1024 * 1024)
const fehlt = ref(false)
const suche = ref('')
const laeuft = ref(false)

const offen = ref(false)
const reiter = ref('datei')
const aktuell = ref<Vorlage | null>(null)
const datei = ref<File | File[] | null>(null)
const anmerkung = ref('')
const text = ref('')
const textGeladen = ref('')
const textLaedt = ref(false)
const versionen = ref<any[]>([])

const jahrOffen = ref(false)
const jahrFamilie = ref<Familie | null>(null)
const jahr = ref('')
const jahrDatei = ref<File | File[] | null>(null)

const vorschauOffen = ref(false)
const vorschauHtml = ref('')

const config = computed(() => ({
  sheet: familien.value.map((f) => ({
    id: `familie_${f.schluessel}`,
    icon: 'add',
    label: `${f.name}: Jahr hinzufügen`,
    click: () => jahrDialog(f)
  }))
}))

const gefiltert = computed(() => {
  const s = suche.value.trim().toLowerCase()
  if (!s) return vorlagen.value
  return vorlagen.value.filter((v) =>
    `${v.name} ${v.beschreibung} ${v.schluessel} ${v.dateiname ?? ''}`
      .toLowerCase()
      .includes(s)
  )
})

/** Nach Gruppe in der Reihenfolge der API; leere Gruppen fallen weg. */
const gruppiert = computed(() =>
  gruppen.value
    .map((g) => ({
      ...g,
      vorlagen: gefiltert.value.filter((v) => v.gruppe === g.schluessel)
    }))
    .filter((g) => g.vorlagen.length)
)

const imContainer = computed(() =>
  vorlagen.value.filter((v) => v.status === 'container')
)

const textGeaendert = computed(() => text.value !== textGeladen.value)

const containerHinweis = computed(() => {
  const n = imContainer.value.length
  return n === 1
    ? 'Eine Vorlage liegt bisher nur im Dateisystem des API-Servers und ist nach dem nächsten Deployment weg, wenn sie nicht in die Datenbank übernommen wird.'
    : `${n} Vorlagen liegen bisher nur im Dateisystem des API-Servers und sind nach dem nächsten Deployment weg, wenn sie nicht in die Datenbank übernommen werden.`
})

const jahrBereit = computed(
  () => /^\d{4}$/.test(String(jahr.value).trim()) && !!erste(jahrDatei.value)
)

/* ------------------------------------------------------------ Anzeige --- */

function statusText(status: Vorlage['status']) {
  return {
    db: 'in der Datenbank',
    auslieferung: 'Auslieferungsstand',
    container: 'nur im Container',
    fehlt: 'fehlt'
  }[status]
}

function statusFarbe(status: Vorlage['status']) {
  return {
    db: 'success',
    auslieferung: undefined,
    container: 'warning',
    fehlt: 'error'
  }[status]
}

function symbol(art: Vorlage['art']) {
  return {
    docx: 'description',
    xlsx: 'table_view',
    pdf: 'picture_as_pdf',
    md: 'notes'
  }[art]
}

function probeText(art: Vorlage['art']) {
  return art === 'xlsx' ? 'Probe-Excel erzeugen' : 'Probe-PDF erzeugen'
}

const MIME: Record<Vorlage['art'], string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  md: 'text/markdown'
}

function akzeptiert(art: Vorlage['art']) {
  return `.${art},${MIME[art]}`
}

function dateiHinweis(art: Vorlage['art']) {
  return `Eine ${art.toUpperCase()}-Datei, höchstens ${Math.round(
    maxBytes.value / 1024 / 1024
  )} MB.`
}

function groesse(bytes: number | null) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function datum(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function zeit(iso: string) {
  return new Date(iso).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Vuetify 4 liefert je nach Einstellung File oder File[]. */
function erste(d: File | File[] | null): File | null {
  if (!d) return null
  return Array.isArray(d) ? (d[0] ?? null) : d
}

function gewaehlteDatei(): File | null {
  return erste(datei.value)
}

function meldung(err: any): string {
  return String(err?.message ?? err)
}

/* -------------------------------------------------------------- Laden --- */

function laden() {
  fetch(BASE, { headers: { authorization: authToken.value } })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      gruppen.value = res.gruppen
      vorlagen.value = res.vorlagen
      familien.value = res.familien
      warnungen.value = res.warnungen
      maxBytes.value = res.maxBytes
      fehlt.value = false
      // Offener Dialog: den Eintrag auf den frischen Stand ziehen
      if (aktuell.value) {
        aktuell.value =
          vorlagen.value.find(
            (v) => v.schluessel === aktuell.value!.schluessel
          ) ?? null
      }
    })
    .catch((err: any) => {
      // 503 heißt: SQL noch nicht eingespielt — ein offener Deployschritt,
      // kein Fehler des Benutzers.
      const txt = meldung(err)
      if (txt.includes('nicht eingerichtet')) {
        fehlt.value = true
        return
      }
      error({ text: txt, title: 'Laden fehlgeschlagen!' })
    })
}

laden()

function oeffnen(v: Vorlage) {
  aktuell.value = v
  reiter.value = 'datei'
  datei.value = null
  anmerkung.value = ''
  text.value = ''
  textGeladen.value = ''
  versionen.value = []
  offen.value = true
  ladeVersionen()
  if (v.art === 'md' && v.dateiname) ladeText()
}

function ladeVersionen() {
  if (!aktuell.value) return
  fetch(`${BASE}/${aktuell.value.schluessel}/versionen`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      versionen.value = res.versionen
    })
    .catch(() => undefined)
}

function ladeText() {
  if (!aktuell.value) return
  textLaedt.value = true
  fetch(`${BASE}/${aktuell.value.schluessel}/datei`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.text())
    .then((t) => {
      text.value = t
      textGeladen.value = t
    })
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Text konnte nicht geladen werden!' })
    )
    .finally(() => {
      textLaedt.value = false
    })
}

/* ---------------------------------------------------------- Speichern --- */

/** Datei als base64 lesen — ohne den data:-Präfix, den readAsDataURL voranstellt. */
function alsBase64(f: File): Promise<string> {
  return new Promise((auf, ab) => {
    const leser = new FileReader()
    leser.onload = () => auf(String(leser.result).split(',')[1] ?? '')
    leser.onerror = () => ab(new Error('Die Datei ließ sich nicht lesen.'))
    leser.readAsDataURL(f)
  })
}

/**
 * Schreibender Aufruf mit Rückfrage: die API antwortet 409, wenn die Vorlage
 * Platzhalter enthält, die sie nicht kennt (Tippfehler oder eine neue
 * Variable). Das ist eine Warnung, keine Sperre — auf Wunsch wird mit
 * `trotzdem` erneut gesendet. Liefert false, wenn abgebrochen wurde.
 */
async function sendenMitRueckfrage(
  url: string,
  methode: string,
  rumpf: Record<string, unknown>
): Promise<Response | false> {
  const senden = (r: Record<string, unknown>) =>
    fetch(url, {
      method: methode,
      headers: {
        authorization: authToken.value,
        'content-type': 'application/json'
      },
      body: JSON.stringify(r)
    })

  let res = await senden(rumpf)
  if (res.status === 409) {
    const txt = await res.text()
    if (!window.confirm(`${txt}\n\nTrotzdem speichern?`)) return false
    res = await senden({ ...rumpf, trotzdem: true })
  }
  await errorHandler(res)
  return res
}

async function dateiRumpf(f: File): Promise<Record<string, unknown>> {
  if (f.size > maxBytes.value) {
    throw new Error(
      `Die Datei ist ${groesse(f.size)} groß, erlaubt sind ${groesse(maxBytes.value)}.`
    )
  }
  return {
    dateiname: f.name,
    // Der Browser lässt den Typ bei unbekannten Endungen leer; die API prüft
    // ohnehin den Inhalt und meldet verständlich, wenn er nicht passt.
    mimetype: f.type || 'application/octet-stream',
    inhalt: await alsBase64(f)
  }
}

async function hochladen() {
  const f = gewaehlteDatei()
  if (!aktuell.value || !f) return
  laeuft.value = true
  try {
    const res = await sendenMitRueckfrage(
      `${BASE}/${aktuell.value.schluessel}`,
      'PUT',
      { ...(await dateiRumpf(f)), anmerkung: anmerkung.value }
    )
    if (!res) return
    const antwort = await res.json()
    notifyInfo(
      antwort.warnungen?.length
        ? 'Gespeichert — mit Warnungen, siehe Rückfrage.'
        : 'Gespeichert. Die API nimmt ab sofort die neue Datei.'
    )
    datei.value = null
    anmerkung.value = ''
    laden()
    ladeVersionen()
  } catch (err: any) {
    error({ text: meldung(err), title: 'Speichern fehlgeschlagen!' })
  } finally {
    laeuft.value = false
  }
}

async function speichernText() {
  if (!aktuell.value) return
  laeuft.value = true
  try {
    const res = await sendenMitRueckfrage(
      `${BASE}/${aktuell.value.schluessel}/text`,
      'PUT',
      { text: text.value, anmerkung: anmerkung.value }
    )
    if (!res) return
    notifyInfo('Gespeichert. Die nächste Mail enthält den neuen Text.')
    textGeladen.value = text.value
    anmerkung.value = ''
    laden()
    ladeVersionen()
  } catch (err: any) {
    error({ text: meldung(err), title: 'Speichern fehlgeschlagen!' })
  } finally {
    laeuft.value = false
  }
}

/* ------------------------------------------------------------- Probe --- */

/**
 * Probe-Ausgabe mit Beispieldaten. Mit `neu` wird die im Feld gewählte,
 * noch nicht gespeicherte Datei geprüft — so lässt sich ein Brief ansehen,
 * bevor er die bisherige Fassung verdrängt.
 */
async function probe(v: Vorlage, neu = false) {
  laeuft.value = true
  try {
    const rumpf: Record<string, unknown> = {}
    if (neu) {
      const f = gewaehlteDatei()
      if (!f) return
      rumpf.inhalt = (await dateiRumpf(f)).inhalt
    }
    const res = await fetch(`${BASE}/${v.schluessel}/probe`, {
      method: 'POST',
      headers: {
        authorization: authToken.value,
        'content-type': 'application/json'
      },
      body: JSON.stringify(rumpf)
    }).then(errorHandler)
    const blob = await res.blob()
    if (v.art === 'xlsx') {
      speichereBlob(blob, `Probe-${v.dateiname ?? v.schluessel + '.xlsx'}`)
    } else {
      oeffneBlob(blob)
    }
  } catch (err: any) {
    error({ text: meldung(err), title: 'Probe fehlgeschlagen!' })
  } finally {
    laeuft.value = false
  }
}

async function vorschauText() {
  if (!aktuell.value) return
  laeuft.value = true
  try {
    const res = await fetch(`${BASE}/${aktuell.value.schluessel}/probe`, {
      method: 'POST',
      headers: {
        authorization: authToken.value,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ text: text.value })
    }).then(errorHandler)
    vorschauHtml.value = await res.text()
    vorschauOffen.value = true
  } catch (err: any) {
    error({ text: meldung(err), title: 'Vorschau fehlgeschlagen!' })
  } finally {
    laeuft.value = false
  }
}

/* --------------------------------------------------- Uebernehmen etc. --- */

function uebernehmen(v: Vorlage) {
  laeuft.value = true
  fetch(`${BASE}/${v.schluessel}/uebernehmen`, {
    method: 'POST',
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo('In die Datenbank übernommen.')
      laden()
      ladeVersionen()
    })
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Übernehmen fehlgeschlagen!' })
    )
    .finally(() => {
      laeuft.value = false
    })
}

function uebernehmenAlle() {
  if (
    !window.confirm(
      `${imContainer.value.length} Vorlage(n) aus dem Dateisystem des API-Servers in die Datenbank übernehmen?`
    )
  ) {
    return
  }
  laeuft.value = true
  fetch(`${BASE}/uebernehmen-alle`, {
    method: 'POST',
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      const fehler: { schluessel: string; grund: string }[] = res.fehler ?? []
      if (fehler.length) {
        error({
          text:
            `Übernommen: ${res.uebernommen.length}. Fehlgeschlagen:\n` +
            fehler.map((f) => `${f.schluessel}: ${f.grund}`).join('\n'),
          title: 'Nicht alles übernommen'
        })
      } else {
        notifyInfo(`${res.uebernommen.length} Vorlage(n) übernommen.`)
      }
      laden()
    })
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Übernehmen fehlgeschlagen!' })
    )
    .finally(() => {
      laeuft.value = false
    })
}

function entfernen(v: Vorlage) {
  const frage = v.kannZuruecksetzen
    ? `„${v.name}" auf den Auslieferungsstand zurücksetzen? Die hochgeladene Datei wird entfernt, die API nimmt wieder die ausgelieferte Fassung. Die Historie bleibt.`
    : `„${v.name}" wirklich löschen? Danach gibt es diese Vorlage nicht mehr; alles, was sie braucht, schlägt fehl.`
  if (!window.confirm(frage)) return

  fetch(`${BASE}/${v.schluessel}`, {
    method: 'DELETE',
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo(v.kannZuruecksetzen ? 'Zurückgesetzt.' : 'Gelöscht.')
      if (!v.kannZuruecksetzen) offen.value = false
      laden()
      ladeVersionen()
    })
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Fehlgeschlagen!' })
    )
}

function wiederherstellen(f: any) {
  if (!aktuell.value) return
  if (
    !window.confirm(
      `Fassung vom ${datum(f.ts)} zurückholen? Die aktuelle Fassung wandert dabei selbst in die Historie.`
    )
  ) {
    return
  }
  fetch(`${BASE}/${aktuell.value.schluessel}/wiederherstellen`, {
    method: 'POST',
    headers: {
      authorization: authToken.value,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ versionID: f.versionID })
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo('Alte Fassung ist wieder aktiv.')
      reiter.value = 'datei'
      laden()
      ladeVersionen()
      if (aktuell.value?.art === 'md') ladeText()
    })
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Zurückholen fehlgeschlagen!' })
    )
}

/* ------------------------------------------------------------ Familie --- */

function jahrDialog(f: Familie) {
  jahrFamilie.value = f
  jahr.value = String(f.vorschlaege[0] ?? new Date().getFullYear())
  jahrDatei.value = null
  jahrOffen.value = true
}

async function jahrSpeichern() {
  const f = erste(jahrDatei.value)
  if (!jahrFamilie.value || !f) return
  laeuft.value = true
  try {
    const res = await sendenMitRueckfrage(
      `${BASE}/${jahrFamilie.value.schluessel}.${String(jahr.value).trim()}`,
      'PUT',
      await dateiRumpf(f)
    )
    if (!res) return
    notifyInfo(
      `${jahrFamilie.value.name} ${String(jahr.value).trim()} hochgeladen.`
    )
    jahrOffen.value = false
    laden()
  } catch (err: any) {
    error({ text: meldung(err), title: 'Hochladen fehlgeschlagen!' })
  } finally {
    laeuft.value = false
  }
}

/* ---------------------------------------------------------- Download --- */

/**
 * Herunterladen mit Anmeldung: ein <a href> schickt den Authorization-Header
 * nicht mit, die Datei muss also geholt und als Blob weitergereicht werden.
 */
function speichereBlob(blob: Blob, name: string) {
  const a = document.getElementById('ec-download') as HTMLAnchorElement
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

/** PDF oder HTML in einem neuen Tab zeigen statt speichern. */
function oeffneBlob(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const fenster = window.open(url, '_blank')
  if (!fenster) {
    // Popup blockiert: dann wenigstens als Datei anbieten
    speichereBlob(blob, 'Probe.pdf')
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function herunterladen(v: Vorlage) {
  fetch(`${BASE}/${v.schluessel}/datei`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.blob())
    .then((blob) => speichereBlob(blob, v.dateiname ?? v.schluessel))
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Download fehlgeschlagen!' })
    )
}

function herunterladenVersion(f: any) {
  if (!aktuell.value) return
  fetch(`${BASE}/${aktuell.value.schluessel}/version/${f.versionID}/datei`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.blob())
    .then((blob) =>
      speichereBlob(blob, f.dateiname ?? aktuell.value!.schluessel)
    )
    .catch((err: any) =>
      error({ text: meldung(err), title: 'Download fehlgeschlagen!' })
    )
}
</script>
