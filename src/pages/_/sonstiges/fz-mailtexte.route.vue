<template lang="pug">
ec-wrapper(
  title='FZ-Mailtexte',
  subTitle='Was das Führungszeugnis-System verschickt',
  hasHeader,
  hasReload,
  @reload='laden'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Mail suchen', @suche='suche = $event')

  v-alert.ma-2(v-if='fehlt', type='warning', variant='tonal')
    | Die Tabelle für die Mailtexte fehlt in der Datenbank. Bis sie eingespielt
    | ist, verschickt das FZ-System die Texte, die in seinem Quelltext stehen.

  v-list(lines='three')
    v-list-item(
      v-for='v in gefiltert',
      :key='v.schluessel',
      @click='oeffnen(v)'
    )
      template(#prepend)
        v-icon(:color='v.empfaenger === "kreis" ? "primary" : undefined')
          | {{ v.empfaenger === 'kreis' ? 'groups' : 'person' }}
      v-list-item-title {{ v.name }}
      v-list-item-subtitle
        div {{ v.beschreibung }}
        div.text-caption
          | Betreff: {{ v.betreff }}
          //- Nur nach einer echten Bearbeitung: beim Ausliefern setzt die
          //- Datenbank den Zeitstempel selbst, "zuletzt geändert" waere dann
          //- eine Falschaussage.
          span(v-if='v.geaendertVon')  · zuletzt geändert am {{ datum(v.geaendertAm) }}
      template(#append)
        v-icon edit

  v-dialog(v-model='offen', :max-width='900', scrollable)
    v-card(v-if='aktuell')
      v-card-title(style='white-space: normal') {{ aktuell.name }}
      v-card-subtitle(style='white-space: normal') {{ aktuell.beschreibung }}

      v-tabs(v-model='reiter', density='compact')
        v-tab(value='text') Text
        v-tab(value='vorschau') Vorschau
        v-tab(value='historie') Frühere Fassungen

      v-divider

      v-card-text(style='max-height: 60vh')
        div(v-if='reiter === "text"')
          v-text-field(
            v-model='betreff',
            label='Betreff',
            density='compact',
            :counter='255'
          )
          .mb-2
            span.text-caption.mr-2 Platzhalter einfügen:
            v-chip.mr-1.mb-1(
              v-for='p in aktuell.platzhalter',
              :key='p',
              size='small',
              variant='outlined',
              @click='einfuegen(p)'
            ) {{ marke(p) }}
          v-textarea(
            ref='textfeld',
            v-model='text',
            label='HTML-Text der Mail',
            rows='16',
            style='font-family: monospace; font-size: 13px'
          )

        div(v-else-if='reiter === "vorschau"')
          .text-caption.mb-1
            | Betreff: <strong>{{ vorschauBetreff }}</strong>
          v-divider.mb-3
          //- Der Text ist HTML und wird genau so verschickt. Die API weist
          //- Skript-Anteile beim Speichern ab.
          div(v-html='vorschauText')
          v-alert.mt-4(type='info', variant='tonal', density='compact')
            | Beispielwerte eingesetzt — in der echten Mail stehen dort die
            | Daten der jeweiligen Person.

        div(v-else)
          v-alert(
            v-if='!versionen.length',
            type='info',
            variant='tonal',
            density='compact'
          ) Dieser Text wurde noch nie geändert.
          v-list(v-else, density='compact')
            v-list-item(v-for='f in versionen', :key='f.versionID')
              v-list-item-title
                | {{ datum(f.ts) }}, {{ zeit(f.ts) }} Uhr
                span(v-if='f.benutzer')  · {{ f.benutzer }}
              v-list-item-subtitle
                | {{ f.zeichen }} Zeichen{{ f.anmerkung ? ' · ' + f.anmerkung : '' }}
              template(#append)
                v-btn(
                  variant='text',
                  size='small',
                  @click='wiederherstellen(f)'
                ) Zurückholen

      v-divider
      v-card-actions
        v-btn(variant='text', @click='offen = false') Abbrechen
        v-spacer
        v-btn(
          v-if='reiter !== "historie"',
          variant='text',
          color='primary',
          :disabled='!geaendert',
          @click='speichern'
        ) Speichern
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { API_BASE } from '../../../plugins/apiBase'
import { errorHandler } from '../../../helpers'

/**
 * Pflege der Mailtexte des Führungszeugnis-Systems.
 *
 * Die zehn Texte standen bis 09/2026 im Quelltext des FZ-Systems (eigenes
 * Repo, PHP-Cron). Eine Formulierung zu ändern brauchte einen Entwickler und
 * ein Deployment — für Sätze, die die Landesreferentin schreibt und
 * verantwortet.
 *
 * Welche Mails es gibt, entscheidet weiterhin der Code: hier lassen sich nur
 * Betreff und Text ändern, nichts anlegen und nichts löschen.
 *
 * Jede Änderung legt die vorherige Fassung in der Historie ab. Diese Texte
 * teilen Menschen mit, dass sie nicht mehr mit Kindern arbeiten dürfen — wer
 * das wann wie formuliert hat, muss nachlesbar bleiben.
 */
const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()
const textfeld = useTemplateRef<any>('textfeld')

const suche = ref('')
const vorlagen = ref<any[]>([])
const beispielwerte = ref<Record<string, string>>({})
const fehlt = ref(false)

const offen = ref(false)
const reiter = ref('text')
const aktuell = ref<any>(null)
const betreff = ref('')
const text = ref('')
const versionen = ref<any[]>([])

const gefiltert = computed(() => {
  const s = suche.value.trim().toLowerCase()
  if (!s) return vorlagen.value
  return vorlagen.value.filter((v) =>
    `${v.name} ${v.beschreibung} ${v.betreff}`.toLowerCase().includes(s)
  )
})

const geaendert = computed(
  () =>
    !!aktuell.value &&
    (betreff.value !== aktuell.value.betreff ||
      text.value !== aktuell.value.text)
)

/**
 * Anzeigeform eines Platzhalters.
 *
 * Nicht direkt im Template: eine geschweifte Klammerfolge innerhalb einer
 * Interpolation beendet diese vorzeitig ("Unterminated string constant").
 */
function marke(name: string) {
  return `{{${name}}}`
}

/** Platzhalter durch Beispielwerte ersetzen, wie es der Cron beim Versand tut. */
function fuellen(roh: string) {
  let s = roh
  for (const [name, wert] of Object.entries(beispielwerte.value)) {
    s = s.split(`{{${name}}}`).join(wert)
  }
  return s
}

const vorschauBetreff = computed(() => fuellen(betreff.value))
const vorschauText = computed(() => fuellen(text.value))

function datum(iso: string) {
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

function laden() {
  fetch(`${API_BASE}/v6/fz-mailvorlage`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      vorlagen.value = res.vorlagen
      beispielwerte.value = res.beispielwerte
      fehlt.value = false
    })
    .catch((err: any) => {
      // 503 heißt: SQL noch nicht eingespielt. Das ist kein Fehler des
      // Benutzers, sondern ein offener Deployschritt.
      const txt = String(err.message || err)
      if (txt.includes('Mailvorlagen-Tabellen')) {
        fehlt.value = true
        return
      }
      error({ text: txt, title: 'Laden fehlgeschlagen!' })
    })
}

laden()

function oeffnen(v: any) {
  aktuell.value = v
  betreff.value = v.betreff
  text.value = v.text
  reiter.value = 'text'
  versionen.value = []
  offen.value = true
  ladeVersionen()
}

function ladeVersionen() {
  fetch(`${API_BASE}/v6/fz-mailvorlage/${aktuell.value.schluessel}/versionen`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      versionen.value = res.versionen
    })
    .catch(() => undefined)
}

/** Platzhalter an der Cursorposition einsetzen, nicht am Ende. */
function einfuegen(name: string) {
  const el = textfeld.value?.$el?.querySelector('textarea') as
    HTMLTextAreaElement | undefined
  const marke = `{{${name}}}`

  if (!el) {
    text.value += marke
    return
  }

  const start = el.selectionStart ?? text.value.length
  const ende = el.selectionEnd ?? start
  text.value = text.value.slice(0, start) + marke + text.value.slice(ende)

  requestAnimationFrame(() => {
    el.focus()
    el.setSelectionRange(start + marke.length, start + marke.length)
  })
}

function speichern() {
  fetch(`${API_BASE}/v6/fz-mailvorlage/${aktuell.value.schluessel}`, {
    method: 'PUT',
    headers: {
      authorization: authToken.value,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ betreff: betreff.value, text: text.value })
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      notifyInfo(
        'Gespeichert. Ab dem nächsten Lauf verschickt das FZ-System den neuen Text.'
      )
      aktuell.value = res
      betreff.value = res.betreff
      text.value = res.text
      laden()
      ladeVersionen()
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Speichern fehlgeschlagen!' })
    )
}

function wiederherstellen(f: any) {
  if (
    !window.confirm(
      `Fassung vom ${datum(f.ts)} zurückholen? Der aktuelle Text wandert dabei selbst in die Historie.`
    )
  ) {
    return
  }

  fetch(
    `${API_BASE}/v6/fz-mailvorlage/${aktuell.value.schluessel}/wiederherstellen`,
    {
      method: 'POST',
      headers: {
        authorization: authToken.value,
        'content-type': 'application/json'
      },
      body: JSON.stringify({ versionID: f.versionID })
    }
  )
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      notifyInfo('Alte Fassung ist wieder aktiv.')
      aktuell.value = res
      betreff.value = res.betreff
      text.value = res.text
      reiter.value = 'text'
      laden()
      ladeVersionen()
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Zurückholen fehlgeschlagen!' })
    )
}
</script>
