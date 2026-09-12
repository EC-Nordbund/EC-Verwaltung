<template lang="pug">
ec-wrapper(
  title='Portal-Zugänge',
  subTitle='Freizeitleiter und Ortsverantwortliche',
  hasSheet,
  hasDial,
  hasHeader,
  hasReload,
  :sheet='config.sheet',
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Person suchen', @suche='suche = $event')

  v-alert.ma-2(v-if='!data.length', type='info', variant='tonal')
    | Noch keine Portal-Zugänge angelegt. Über das Menü oben rechts kannst du
    | einen anlegen — die Person bekommt dann eine Einladung per Mail.

  v-list(lines='three')
    v-list-item(v-for='a in filtered', :key='a.portalUserID')
      template(#prepend)
        v-icon(:color='a.aktiv ? undefined : "error"')
          | {{ a.aktiv ? 'vpn_key' : 'block' }}
      v-list-item-title
        | {{ a.vorname }} {{ a.nachname }}
        v-chip.ml-2(v-if='a.superuser', size='x-small', color='warning') Vollzugriff
        v-chip.ml-2(v-if='!a.aktiv', size='x-small', variant='outlined') deaktiviert
      v-list-item-subtitle
        div {{ a.email }}
        div
          span(v-if='!a.passwortGesetzt && a.offeneEinladung') Einladung verschickt, Passwort noch nicht gesetzt
          span(v-else-if='!a.passwortGesetzt') Kein Passwort gesetzt – Einladung erneut senden
          span(v-else-if='a.gesperrt') Wegen zu vieler Fehlversuche vorübergehend gesperrt
          span(v-else-if='a.lastLogin') Zuletzt angemeldet: {{ datum(a.lastLogin) }}
          span(v-else) Noch nie angemeldet
      template(#append)
        v-menu
          template(#activator='{ props }')
            v-btn(v-bind='props', icon, variant='text')
              v-icon more_vert
          v-list(density='compact')
            v-list-item(
              title='Einladung erneut senden',
              prepend-icon='mail',
              :disabled='!a.aktiv',
              @click='einladen(a)'
            )
            v-list-item(
              :title='a.superuser ? "Vollzugriff entziehen" : "Vollzugriff geben"',
              prepend-icon='admin_panel_settings',
              @click='patch(a, { superuser: !a.superuser })'
            )
            v-list-item(
              :title='a.aktiv ? "Zugang deaktivieren" : "Zugang aktivieren"',
              :prepend-icon='a.aktiv ? "block" : "check"',
              @click='umschalten(a)'
            )

  template(#dialogs)
    formular-dialog(ref='dlg', v-bind='formConfig', v-if='formConfig')
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { API_BASE } from '../../../plugins/apiBase'
import { empty, errorHandler } from '../../../helpers'
import portalAccount from '../../../config/forms/portalAccount.form'

/**
 * Verwaltung der Portal-Zugänge.
 *
 * Die Zugänge liegen in einer eigenen Tabelle (`portalUser`), getrennt von den
 * Verwaltungs-Konten in `users`: anderes Passwortverfahren, anderes
 * JWT-Secret, anderer Rechtekreis. Ein Portal-Zugang darf ausdrücklich nicht
 * in die Verwaltung kommen.
 *
 * Passwörter werden hier nie vergeben — die Person bekommt einen Einmal-Link
 * per Mail und setzt es selbst. Deshalb gibt es hier auch kein
 * "Passwort zurücksetzen", sondern nur "Einladung erneut senden".
 */
const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()
const dlg = useTemplateRef<any>('dlg')

const suche = ref('')
const data = ref<any[]>([])
const personen = ref<any[]>([])
const formConfig = ref<any>(null)

const config = {
  sheet: [
    {
      id: 'portal_add',
      icon: 'person_add',
      label: 'Portal-Zugang anlegen',
      click: anlegen
    }
  ]
}

const filtered = computed(() => data.value.filter(filterData))

function datum(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function loadData() {
  fetch(`${API_BASE}/v6/portal-account`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      data.value = res.accounts
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Laden fehlgeschlagen!' })
    )
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

async function anlegen() {
  if (!personen.value.length) await ladePersonen().catch(() => undefined)

  // Personen mit bestehendem Zugang aussortieren: pro Person gibt es genau
  // einen (UNIQUE auf personID), ein zweiter liefe in einen 409.
  const vergeben = new Set(data.value.map((a) => a.personID))
  formConfig.value = portalAccount({
    allePersonen: personen.value.filter((p: any) => !vergeben.has(p.personID))
  })
  await new Promise((r) => setTimeout(r, 0))

  dlg.value
    ?.show()
    .then((form: any) =>
      fetch(`${API_BASE}/v6/portal-account`, {
        method: 'POST',
        headers: {
          authorization: authToken.value,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          personID: form.personID,
          email: form.email,
          superuser: !!form.superuser
        })
      })
        .then(errorHandler)
        .then(() => {
          notifyInfo('Zugang angelegt, Einladung verschickt.')
          loadData()
        })
        .catch((err: any) =>
          error({ text: err.message || err, title: 'Anlegen fehlgeschlagen!' })
        )
    )
    .catch(empty)
}

function einladen(a: any) {
  fetch(`${API_BASE}/v6/portal-account/${a.portalUserID}/invite`, {
    method: 'POST',
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo(`Einladung an ${a.email} verschickt.`)
      loadData()
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Versand fehlgeschlagen!' })
    )
}

function patch(a: any, aenderung: Record<string, unknown>) {
  fetch(`${API_BASE}/v6/portal-account/${a.portalUserID}`, {
    method: 'PATCH',
    headers: {
      authorization: authToken.value,
      'content-type': 'application/json'
    },
    body: JSON.stringify(aenderung)
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo('Gespeichert.')
      loadData()
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Speichern fehlgeschlagen!' })
    )
}

function umschalten(a: any) {
  // Rückfrage nur beim Entziehen: das nimmt jemandem den Zugang und entwertet
  // offene Einladungslinks.
  if (
    a.aktiv &&
    !window.confirm(
      `Zugang von ${a.vorname} ${a.nachname} wirklich deaktivieren? Die Person kann sich dann nicht mehr anmelden.`
    )
  ) {
    return
  }
  patch(a, { aktiv: !a.aktiv })
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
