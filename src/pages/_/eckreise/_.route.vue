<template lang="pug">
ec-wrapper(
  title='EC-Kreise',
  hasHeader,
  hasReload,
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='EC-Kreis suchen', @suche='suche = $event')

  v-list(lines='two')
    v-list-item(v-for='k in filtered', :key='k.ecKreisID')
      template(#prepend)
        v-icon place
      v-list-item-title {{ k.bezeichnung }} (ID: {{ k.ecKreisID }})
      v-list-item-subtitle
        div
          | Monats-Mail an {{ k.email || 'keine Adresse' }}, Anrede
          | „{{ k.fzVerantwortlicherText || '—' }}"
      template(#append)
        .d-flex.ga-2.flex-wrap.py-2
          v-btn(
            size='small',
            variant='outlined',
            prepend-icon='verified_user',
            @click='setzeVerantwortlichen(k, "fz")'
          )
            | Führungszeugnisse:&nbsp;
            strong(v-if='k.fzVerantwortlich') {{ k.fzVerantwortlich.vorname }} {{ k.fzVerantwortlich.nachname }}
            em(v-else) offen
          v-btn(
            size='small',
            variant='outlined',
            prepend-icon='groups',
            @click='setzeVerantwortlichen(k, "ort")'
          )
            | Mitglieder:&nbsp;
            strong(v-if='k.ortsverantwortlich') {{ k.ortsverantwortlich.vorname }} {{ k.ortsverantwortlich.nachname }}
            em(v-else) offen
          v-btn(
            size='small',
            variant='outlined',
            prepend-icon='shield',
            @click='oeffneSchutzkonzept(k)'
          ) Schutzkonzept-E-Mails

  v-dialog(v-model='skOffen', max-width='560px')
    v-card(v-if='skKreis')
      v-card-title Schutzkonzept-E-Mails
      v-card-subtitle {{ skKreis.bezeichnung }}
      v-card-text
        v-alert.mb-4(type='info', variant='tonal', density='compact')
          | Wer hier eingetragen ist, kann sich auf schutzkonzept.ec-nordbund.de
          | mit einem Anmeldecode per Mail anmelden und das Schutzkonzept dieses
          | EC-Kreises bearbeiten und veröffentlichen.
        v-progress-linear.mb-2(v-if='skLaedt', indeterminate)
        .mb-4
          v-chip.mr-2.mb-2(
            v-for='e in skEmails',
            :key='e.skKreisEmailID',
            closable,
            @click:close='entferneSkEmail(e)'
          ) {{ e.email }}
          em(v-if='!skLaedt && !skEmails.length') Noch keine Adresse eingetragen.
        v-form.d-flex.ga-2.align-start(@submit.prevent='fuegeSkEmailHinzu')
          v-text-field(
            v-model='skNeu',
            label='E-Mail-Adresse',
            type='email',
            density='compact',
            hide-details='auto'
          )
          v-btn(
            type='submit',
            color='primary',
            :disabled='!skNeu.trim() || skLaedt'
          ) Hinzufügen
      v-card-actions
        v-spacer
        v-btn(variant='text', @click='skOffen = false') Schließen

  template(#dialogs)
    formular-dialog(
      ref='dlg',
      v-bind='formConfig',
      v-if='formConfig'
    )
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { API_BASE } from '../../../plugins/apiBase'
import { empty, errorHandler } from '../../../helpers'
import ecKreisVerantwortlich from '../../../config/forms/ecKreisVerantwortlich.form'

/**
 * Pflege der EC-Kreise — bisher gab es dafür keine Seite; `ecKreise` war im
 * GraphQL-Schema nur lesbar und hatte keine Mutation.
 *
 * Hier wird die neue Spalte `ecKreis.fz_verantwortlicher_personID` gesetzt:
 * die Person, die sich im Portal anmelden und die FZ-Liste dieses Kreises
 * sehen darf. Der bisherige Freitext `fz_verantwortlicher` bleibt daneben
 * bestehen — er ist die Anrede in der Monats-Mail (fz-mail-system/cron.php)
 * und wird beim Speichern automatisch mitgeschrieben. Beide Werte stehen
 * bewusst nebeneinander in der Liste, sonst entstehen zwei Wahrheiten, von
 * denen man nur eine sieht.
 *
 * Bewusst REST statt GraphQL (Vorgabe für dieses Modul) und mit dem rohen
 * fetch-Muster des Repos statt eines neuen Clients.
 */
const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()
const dlg = useTemplateRef<any>('dlg')

const suche = ref('')
const data = ref<any[]>([])
const personen = ref<any[]>([])
const formConfig = ref<any>(null)

const filtered = computed(() => data.value.filter(filterData))

function loadData() {
  fetch(`${API_BASE}/v6/eckreis`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      data.value = res.kreise
    })
    .catch((err: any) => {
      error({ text: err.message || err, title: 'Laden fehlgeschlagen!' })
    })
}

function ladePersonen() {
  return fetch(`${API_BASE}/v6/personen`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      personen.value = res.personen
    })
}

loadData()
ladePersonen().catch(() => undefined)

async function setzeVerantwortlichen(k: any, rolle: 'fz' | 'ort') {
  if (!personen.value.length) {
    await ladePersonen().catch(() => undefined)
  }

  const aktuell = rolle === 'fz' ? k.fzVerantwortlich : k.ortsverantwortlich

  formConfig.value = ecKreisVerantwortlich({
    allePersonen: personen.value,
    bezeichnung: k.bezeichnung,
    rolle,
    initval: { personID: aktuell?.personID ?? null }
  })

  // Warten, bis der Dialog mit der neuen Konfiguration gerendert ist.
  await new Promise((r) => setTimeout(r, 0))

  dlg.value
    ?.show()
    .then((form: { personID: number | null }) =>
      fetch(`${API_BASE}/v6/eckreis/${k.ecKreisID}/verantwortlicher/${rolle}`, {
        method: 'PUT',
        headers: {
          authorization: authToken.value,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ personID: form.personID })
      })
        .then(errorHandler)
        .then(() => {
          notifyInfo('Zuständigkeit gespeichert.')
          loadData()
        })
        .catch((err: any) =>
          error({
            text: err.message || err,
            title: 'Speichern fehlgeschlagen!'
          })
        )
    )
    .catch(empty)
}

/*
 * Schutzkonzept-E-Mails: bewusst erst beim Öffnen des Dialogs geladen, nicht
 * für alle Kreise auf einmal -- das Limit auf /v6 würde eine Salve von
 * Einzelabfragen ausbremsen.
 */
const skOffen = ref(false)
const skKreis = ref<any>(null)
const skEmails = ref<{ skKreisEmailID: number; email: string }[]>([])
const skNeu = ref('')
const skLaedt = ref(false)
/*
 * Laufende Nummer der letzten Ladeanfrage. Wird der Dialog schnell für einen
 * anderen Kreis geöffnet, kann die ältere Antwort später eintreffen -- ohne
 * diesen Abgleich stünden dann die Adressen des ersten Kreises unter dem Titel
 * des zweiten, und Entfernen liefe mit fremden IDs ins 404.
 */
let skAnfrage = 0

function ladeSkEmails() {
  const anfrage = ++skAnfrage
  skLaedt.value = true
  return fetch(
    `${API_BASE}/v6/eckreis/${skKreis.value.ecKreisID}/schutzkonzept-email`,
    { headers: { authorization: authToken.value } }
  )
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      if (anfrage === skAnfrage) skEmails.value = res.emails
    })
    .catch((err: any) => {
      if (anfrage === skAnfrage) {
        error({ text: err.message || err, title: 'Laden fehlgeschlagen!' })
      }
    })
    .finally(() => {
      // Nur die jüngste Anfrage beendet die Ladeanzeige, sonst gäbe eine
      // überholte Antwort den Knopf frei, während die aktuelle noch lädt.
      if (anfrage === skAnfrage) skLaedt.value = false
    })
}

function oeffneSchutzkonzept(k: any) {
  skKreis.value = k
  skEmails.value = []
  skNeu.value = ''
  skOffen.value = true
  ladeSkEmails()
}

function fuegeSkEmailHinzu() {
  const email = skNeu.value.trim()
  if (!email) return
  const kreis = skKreis.value
  skLaedt.value = true
  fetch(`${API_BASE}/v6/eckreis/${kreis.ecKreisID}/schutzkonzept-email`, {
    method: 'POST',
    headers: {
      authorization: authToken.value,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ email })
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo('E-Mail-Adresse eingetragen.')
      // Inzwischen anderer Kreis im Dialog: dessen Liste und Eingabe nicht anfassen.
      if (skKreis.value !== kreis) return
      skNeu.value = ''
      return ladeSkEmails()
    })
    .catch((err: any) => {
      if (skKreis.value === kreis) skLaedt.value = false
      error({ text: err.message || err, title: 'Speichern fehlgeschlagen!' })
    })
}

function entferneSkEmail(e: { skKreisEmailID: number; email: string }) {
  if (
    !window.confirm(
      `${e.email} wirklich entfernen? Die Adresse verliert sofort den Zugang.`
    )
  ) {
    return
  }
  const kreis = skKreis.value
  skLaedt.value = true
  fetch(
    `${API_BASE}/v6/eckreis/${kreis.ecKreisID}/schutzkonzept-email/${e.skKreisEmailID}`,
    { method: 'DELETE', headers: { authorization: authToken.value } }
  )
    .then(errorHandler)
    .then(() => {
      notifyInfo('E-Mail-Adresse entfernt.')
      if (skKreis.value !== kreis) return
      return ladeSkEmails()
    })
    .catch((err: any) => {
      if (skKreis.value === kreis) skLaedt.value = false
      error({ text: err.message || err, title: 'Entfernen fehlgeschlagen!' })
    })
}

function filterData(item: any): boolean {
  return suche.value
    .toLowerCase()
    .split(' ')
    .map((s: string) => filterPart(item, s))
    .reduce((a, b) => a && b, true)
}

function filterPart(item: any, s: string): boolean {
  if (!s) return true
  if (typeof item === 'string') return item.toLowerCase().includes(s)
  if (typeof item === 'number' || typeof item === 'boolean') {
    return item.toString().toLowerCase().includes(s)
  }
  if (item) {
    return Object.keys(item)
      .map((key) => filterPart(item[key], s))
      .reduce((a, b) => a || b, false)
  }
  return false
}
</script>
