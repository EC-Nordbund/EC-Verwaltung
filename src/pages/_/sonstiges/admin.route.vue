<template lang="pug">
ec-wrapper(
  title='Administration',
  subTitle='Benutzer der Verwaltung',
  hasSheet,
  hasDial,
  hasHeader,
  hasReload,
  :sheet='config.sheet',
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Benutzer suchen', @suche='suche = $event')

  v-alert.ma-2(type='info', variant='tonal', density='compact')
    | Jeder Benutzer der Verwaltung darf hier Benutzer anlegen und sperren.
    | Gelöscht wird nicht: gesperrte Benutzer bleiben in der Liste und können
    | wieder entsperrt werden.

  v-list(lines='two')
    v-list-item(v-for='u in filtered', :key='u.userID')
      template(#prepend)
        v-icon(:color='u.aktiv ? undefined : "error"')
          | {{ u.aktiv ? 'person' : 'block' }}
      v-list-item-title
        | {{ u.username }}
        v-chip.ml-2(v-if='u.userID === eigeneUserID', size='x-small', color='info') Das bist du
        v-chip.ml-2(v-if='!u.aktiv', size='x-small', color='error', variant='outlined') gesperrt
      v-list-item-subtitle
        div
          span(v-if='u.vorname || u.nachname') {{ u.vorname }} {{ u.nachname }}
          span(v-else) Person {{ u.personID }} nicht gefunden
        div
          span(v-if='u.aktiv') Gültig bis {{ datum(u.ablaufDatum) }}
          span(v-else) Gesperrt bzw. abgelaufen seit {{ datum(u.ablaufDatum) }}
          span(v-if='u.lastLogin') &nbsp;· Zuletzt angemeldet: {{ datum(u.lastLogin) }}
      template(#append)
        v-menu
          template(#activator='{ props }')
            v-btn(v-bind='props', icon, variant='text')
              v-icon more_vert
          v-list(density='compact')
            v-list-item(
              v-if='u.aktiv',
              title='Benutzer sperren',
              prepend-icon='block',
              :disabled='u.userID === eigeneUserID',
              @click='sperren(u)'
            )
            v-list-item(
              :title='u.aktiv ? "Ablaufdatum ändern" : "Benutzer entsperren"',
              :prepend-icon='u.aktiv ? "event" : "check"',
              @click='ablaufAendern(u)'
            )
            v-list-item(
              title='Passwort neu setzen',
              prepend-icon='vpn_key',
              @click='passwortSetzen(u)'
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
import {
  userAblauf,
  userAnlegen,
  userPasswort
} from '../../../config/forms/verwaltungUser.form'

/**
 * Administration: Benutzer der Verwaltung (Tabelle `users`).
 *
 * Es gibt keine Rollen -- jeder angemeldete Benutzer ist Admin und darf hier
 * alles. Gelöscht wird nicht, nur gesperrt: die Benutzer-ID steht in
 * Protokollen und Historien. Eine Sperre setzt das Ablaufdatum auf heute und
 * wirkt sofort, auch für bereits angemeldete Sitzungen (EC-Api,
 * users/sperre.ts). Entsperren heißt, ein neues Ablaufdatum zu setzen.
 *
 * Getrennt davon sind die Portal-Zugänge (eigene Tabelle, eigene Seite).
 */
const { authToken } = useLogin()
const { error, notifyInfo } = useDialog()
const dlg = useTemplateRef<any>('dlg')

const suche = ref('')
const data = ref<any[]>([])
const eigeneUserID = ref(0)
const personen = ref<any[]>([])
const formConfig = ref<any>(null)

const config = {
  sheet: [
    {
      id: 'user_add',
      icon: 'person_add',
      label: 'Benutzer hinzufügen',
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

/** Heute in einem Jahr als YYYY-MM-DD: Vorschlag für neue und entsperrte Zugänge. */
function inEinemJahr() {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  const zwei = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`
}

function loadData() {
  fetch(`${API_BASE}/v6/user`, {
    headers: { authorization: authToken.value }
  })
    .then(errorHandler)
    .then((res) => res.json())
    .then((res: any) => {
      data.value = res.users
      eigeneUserID.value = res.eigeneUserID
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

async function zeigeFormular(cfg: any): Promise<any> {
  formConfig.value = cfg
  await new Promise((r) => setTimeout(r, 0))
  return dlg.value?.show()
}

async function anlegen() {
  if (!personen.value.length) await ladePersonen().catch(() => undefined)

  zeigeFormular(
    userAnlegen({ allePersonen: personen.value, ablaufDatum: inEinemJahr() })
  )
    .then((form: any) =>
      fetch(`${API_BASE}/v6/user`, {
        method: 'POST',
        headers: {
          authorization: authToken.value,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          personID: form.personID,
          username: form.username,
          passwort: form.passwort,
          ablaufDatum: form.ablaufDatum
        })
      })
        .then(errorHandler)
        .then(() => {
          notifyInfo(`Benutzer ${form.username} angelegt.`)
          loadData()
        })
        .catch((err: any) =>
          error({ text: err.message || err, title: 'Anlegen fehlgeschlagen!' })
        )
    )
    .catch(empty)
}

function patch(u: any, aenderung: Record<string, unknown>, meldung: string) {
  return fetch(`${API_BASE}/v6/user/${u.userID}`, {
    method: 'PATCH',
    headers: {
      authorization: authToken.value,
      'content-type': 'application/json'
    },
    body: JSON.stringify(aenderung)
  })
    .then(errorHandler)
    .then(() => {
      notifyInfo(meldung)
      loadData()
    })
    .catch((err: any) =>
      error({ text: err.message || err, title: 'Speichern fehlgeschlagen!' })
    )
}

function sperren(u: any) {
  if (
    !window.confirm(
      `Benutzer ${u.username} wirklich sperren? Die Person wird sofort abgemeldet und kann sich nicht mehr anmelden.`
    )
  ) {
    return
  }
  patch(u, { gesperrt: true }, `Benutzer ${u.username} gesperrt.`)
}

function ablaufAendern(u: any) {
  zeigeFormular(
    userAblauf({
      name: u.username,
      ablaufDatum: u.aktiv ? u.ablaufDatum : inEinemJahr(),
      gesperrt: !u.aktiv
    })
  )
    .then((form: any) =>
      patch(
        u,
        { ablaufDatum: form.ablaufDatum },
        u.aktiv
          ? `Ablaufdatum von ${u.username} gespeichert.`
          : `Benutzer ${u.username} entsperrt.`
      )
    )
    .catch(empty)
}

function passwortSetzen(u: any) {
  zeigeFormular(userPasswort({ name: u.username }))
    .then((form: any) =>
      patch(
        u,
        { passwort: form.passwort },
        `Passwort von ${u.username} neu gesetzt.`
      )
    )
    .catch(empty)
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
