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

  v-list(lines='three')
    v-list-item(
      v-for='k in filtered',
      :key='k.ecKreisID',
      @click='setzeVerantwortlichen(k)'
    )
      template(#prepend)
        v-icon place
      v-list-item-title {{ k.bezeichnung }} (ID: {{ k.ecKreisID }})
      v-list-item-subtitle
        div
          strong Portal-Zugriff:&nbsp;
          span(v-if='k.verantwortlich') {{ k.verantwortlich.vorname }} {{ k.verantwortlich.nachname }}
          span.text-medium-emphasis(v-else) niemand hinterlegt
        div
          | Anrede der Monats-Mail: {{ k.fzVerantwortlicherText || '—' }} · {{ k.email || 'keine Mailadresse' }}
      template(#append)
        v-icon(:color='k.verantwortlich ? "success" : undefined')
          | {{ k.verantwortlich ? 'verified_user' : 'person_off' }}

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

async function setzeVerantwortlichen(k: any) {
  if (!personen.value.length) {
    await ladePersonen().catch(() => undefined)
  }

  formConfig.value = ecKreisVerantwortlich({
    allePersonen: personen.value,
    bezeichnung: k.bezeichnung,
    initval: { personID: k.verantwortlich?.personID ?? null }
  })

  // Warten, bis der Dialog mit der neuen Konfiguration gerendert ist.
  await new Promise((r) => setTimeout(r, 0))

  dlg.value
    ?.show()
    .then((form: { personID: number | null }) =>
      fetch(`${API_BASE}/v6/eckreis/${k.ecKreisID}/verantwortlicher`, {
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
