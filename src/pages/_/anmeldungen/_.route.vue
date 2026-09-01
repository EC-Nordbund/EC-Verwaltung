<template lang="pug">
ec-wrapper(
  hasSheet,
  hasHeader,
  hasDial,
  hasReload,
  v-bind='config',
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Anmeldung suchen', @suche='suche = $event')
  v-data-table(
    :headers='headers',
    :items='filtered',
    :items-per-page='rowCount'
  )
    template(#item='{ item }')
      tr(@click='openAnmeldung(item)')
        td {{ item.anmeldeID }}
        td {{ item.person.vorname }} {{ item.person.nachname }} ({{ item.person.gebDat.german }})
        td {{ item.veranstaltung.bezeichnung }} ({{ item.veranstaltung.begin.german }} - {{ item.veranstaltung.ende.german }})
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useApollo } from '../../../plugins/apollo'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { useRouter } from '../../../plugins/router'
import filterGenerator from '../../../util/filter.util'

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { navigate } = useRouter()

const rowCount = ref(0)
const data = ref<any[]>([])
const suche = ref('')

// Vuetify 4: Header-Felder text->title, value->key
const headers = [
  {
    title: 'AnmeldeID',
    key: 'anmeldeID',
    width: '75px'
  },
  {
    title: 'Person',
    key: 'person.personID',
    width: '45%'
  },
  {
    title: 'Veranstaltung',
    key: 'veranstaltung.veranstaltungsID',
    width: '45%'
  }
]

const filtered = computed(() => data.value.filter(filterGenerator(suche.value)))

const config = {
  sheet: [
    {
      id: 'anmel_add',
      icon: 'assignment_ind',
      label: 'Anmeldung eingeben',
      click: sheetClick
    }
  ],
  title: 'Anmeldungen'
}

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!) {
          anmeldungen(authToken: $authToken) {
            anmeldeID
            person {
              personID
              vorname
              nachname
              gebDat {
                german
              }
            }
            veranstaltung {
              veranstaltungsID
              bezeichnung
              begin {
                german
              }
              ende {
                german
              }
            }
          }
        }
      `,
      variables: {
        authToken: authToken.value
      },
      fetchPolicy: 'no-cache'
    })
    .then((res: any) => {
      data.value = res.data.anmeldungen
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

function sheetClick(item: { id: string }) {
  alert(item.id)
}

function openAnmeldung(item: any) {
  // navigate() setzt query.prev automatisch auf die aktuelle fullPath
  // (entspricht dem früheren expliziten { prev: $route.fullPath })
  navigate(`/anmeldungen/${item.anmeldeID}/home`)
}

function getCount() {
  const tableHeight = window.innerHeight - 64 - 80 - 72 - 32 - 56 - 36 - 50 - 5
  rowCount.value = Math.floor(tableHeight / 50)
}

loadData()
getCount()
</script>
