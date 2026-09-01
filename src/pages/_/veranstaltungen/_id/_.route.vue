<template lang="pug">
ec-wrapper(hasSheet, hasDial, hasNav, hasXBtn, hasRouterView, v-bind='config')
  router-view(v-slot='{ Component }')
    component(:is='Component', :data='data')
  v-menu(location='bottom left')
    template(#activator='{ props: menuProps }')
      v-btn(v-bind='menuProps') TN-Liste gnerieren
    v-list
      v-list-item(@click='all')
        v-list-item-title Alle (jeweils mit und ohne Warteliste)
      v-divider
      v-list-item(
        v-for='item in tnListen',
        :key='item.name',
        @click='g(item.name, (v) => v == 0)'
      )
        v-list-item-title {{ item.label }}
      v-divider
      v-list-item(
        v-for='item in tnListen',
        :key='item.name',
        @click='g(item.name, (v) => v >= 0)'
      )
        v-list-item-title {{ item.label }} mit Warteliste
      v-divider
      v-list-item(
        v-for='item in tnListen',
        :key='item.name',
        @click='g(item.name, (v) => v > 0)'
      )
        v-list-item-title {{ item.label }} nur Warteliste
      v-divider
      v-list-item(
        v-for='item in tnListen',
        :key='item.name',
        @click='g(item.name, (v) => v < 0)'
      )
        v-list-item-title {{ item.label }} nur Abgemeldete
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import { API_BASE } from '../../../../plugins/apiBase'
import { useApollo } from '../../../../plugins/apollo'
import { useLogin } from '../../../../plugins/auth'
import { useDialog } from '../../../../plugins/dialog'
import { useRouter } from '../../../../plugins/router'

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { route } = useRouter()

const data = ref<any>({
  anmeldungen: [],
  begin: {},
  ende: {},
  veranstaltungsort: {}
})

const tnListen = ref<any>([])
// const genList = generate

const config = computed(() => {
  return {
    sheet: [
      {
        icon: 'mail',
        id: 'veranstaltung_create_tokens',
        label: 'Mitarbeiteranmeldungstoken erzeugen',
        click: async () => {
          // Erzeugt pro Rolle (rollenID >= 2, dynamisch aus der DB) einen
          // Anmeldelink über POST /v6/anmeldetoken und kopiert die Liste
          // "Rolle: Link" in die Zwischenablage.
          const res = await fetch(`${API_BASE}/v6/anmeldetoken`, {
            method: 'POST',
            headers: {
              authorization: authToken.value,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              id: parseInt(route.value.params.id as string)
            })
          })

          if (!res.ok) {
            alert(`Token-Erzeugung fehlgeschlagen (HTTP ${res.status}).`)
            return
          }

          const { gueltigTage, data } = (await res.json()) as {
            gueltigTage: number
            data: Array<{
              position: number
              bezeichnung: string
              url: string
            }>
          }

          const liste = data.map((d) => `${d.bezeichnung}: ${d.url}`).join('\n')

          window.navigator.clipboard.writeText(liste)
          alert(
            `Anmeldelinks in Zwischenablage kopiert (gültig ${gueltigTage} Tage):\n\n${liste}`
          )
        }
      }
    ],
    nav: [
      {
        icon: 'home',
        label: 'Allgemein',
        to: 'home'
      },
      {
        icon: 'euro_symbol',
        label: 'Finanzen',
        to: 'finanzen'
      },
      {
        icon: 'group',
        label: 'Anmeldungen',
        to: 'anmeldungen'
      }
    ],
    title: `${data.value.bezeichnung} (${data.value.begin.german} - ${data.value.ende.german})`,
    subTitle: 'Veranstaltung'
  }
})

// Tote TN-Listen-Generierung (war schon vor der Migration auskommentiert):
// Stubs bleiben Stubs. `all` war komplett auskommentiert, wird aber vom
// Menü referenziert — hier als No-op definiert, damit das Template in
// Vue 3 keinen Zugriff auf eine undefinierte Property macht.
// function all() {
//   tnListen.value.forEach((el: { name: string; label: string }) => {
//     g(el.name, (v) => v === 0)
//     g(el.name, (v) => v >= 0)
//   })
// }
function all() {}

function g(name: string, wList: (v: number) => boolean) {
  // genList(
  //   parseInt(route.value.params.id, 10),
  //   name,
  //   authToken.value,
  //   client,
  //   wList
  // )
}

function sheetClick(item: { id: string }) {
  alert(item.id)
}

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!, $veranstaltungsID: Int!) {
          veranstaltung(
            authToken: $authToken
            veranstaltungsID: $veranstaltungsID
          ) {
            veranstaltungsID
            bezeichnung
            begin {
              german
              input
            }
            ende {
              german
              input
            }
            hauptleiter {
              person {
                personID
                vorname
                nachname
              }
            }
            minTNAlter
            maxTNAlter
            anzahlPlaetze
            anzahlPlaetzeW
            anzahlPlaetzeM
            preisNormal
            preisLastMinute
            preisFruehbucher
            fruehbucherBis {
              german
              input
            }
            lastMinuteAb {
              german
              input
            }
            # preisAnzahlung* existieren im API-Schema nicht (Alt-Bug:
            # die Query wurde deshalb komplett mit 400 abgelehnt und die
            # Seite hat nie Daten geladen) -- Felder entfernt.
            kannVorortBezahltWerden
            hatGWarteliste
            veranstaltungsort {
              vOrtID
              bezeichnung
              plz
              ort
              land
            }
            anmeldungen {
              anmeldeID
              position
              person {
                vorname
                nachname
                geschlecht
                gebDat {
                  german
                }
                datumDesLetztenFZ {
                  german
                  input
                }
              }
              wartelistenPlatz
              anmeldeZeitpunkt {
                german
                day
                month
                year
              }
            }
          }
        }
      `,
      variables: {
        authToken: authToken.value,
        veranstaltungsID: parseInt(route.value.params.id as string)
      },
      fetchPolicy: 'no-cache'
    })
    .then((res: any) => {
      data.value = res.data.veranstaltung
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

loadData()
// getTemplates().then((res) => {
//   tnListen.value = res
// })
</script>
