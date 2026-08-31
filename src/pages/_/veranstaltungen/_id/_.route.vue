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
          const res = await fetch(`${API_BASE}/api-v4/anmeldetoken`, {
            method: 'POST',
            headers: {
              authorization: authToken.value,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              id: parseInt(route.value.params.id as string)
            })
          })

          const d = (await res.json()).data

          const createMailText = (code: string) => `Moin,
Damit du im EC System für die Veranstaltung eingtragen bist, möchte ich dich bitten dich unter dem folgenden Link anzumelden:

https://www.ec-nordbund.de/anmeldung/mitarbeiter/${code}

Oder gehe auf https://www.ec-nordbund.de/anmeldung/mitarbeiter und füge den Code

${code}

ein.


Solltest du ein (neues) erweitertes Führungszeugnis benötigen erhältst den benötigten Antrag direkt nach der Anmeldung per Mail.

Gruß
Thomas Seeger
`

          window.navigator.clipboard.writeText(`Moin,
Du bist Freizeitleiter.

Hinweis: die Links funktionieren nur bis zu begin der Veranstaltung oder 100 Tage

Bitte melde dich selber über diesen Link an:
${d[4]}
(über diesen Link darf sich genau EINE PERSON anmelden. Diese Person ist dann z.B. auf der TN-Liste der Leiter)

Alle anderen Veranstaltungsleiter bitte über diesen Link:
${d[3]}

Desweiteren sende folgende E-Mail weiter an deine Mitarbeiter (bitte sende nur den Link an die Personen die ihn auch benötigen):

Normale Mitarbeiter:

${createMailText(d[0])}

Küchen Mitarbeiter:

${createMailText(d[1])}

Küchenleitung:

${createMailText(d[2])}


            `)
          alert('Mail-Text in Zwischenablage kopiert.')
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
            preisAnzahlungNormal
            preisAnzahlungLastMinute
            preisAnzahlungFruehbucher
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
