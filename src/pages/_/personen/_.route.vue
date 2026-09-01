<template lang="pug">
ec-wrapper(
  hasSheet,
  hasHeader,
  hasDial,
  v-bind='config',
  hasReload,
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Person suchen', @suche='suche = $event')
  v-data-table(
    :headers=`[
    {
      title: 'Vorname',
      key: 'vorname'
    },
    {
      title: 'Nachname',
      key: 'nachname'
    },
    {
      title: 'GebDat',
      key: 'gebDat'
    }
  ]`,
    :items='filteredData',
    :items-per-page='rowCount'
  )
    template(#item='{ item }')
      tr(
        @click='navigate(`/personen/${item.personID}/home`)',
        :class='"geschlecht-" + item.geschlecht'
      )
        td {{ item.vorname }}
        td {{ item.nachname }}
        td {{ formatGebDat(item.gebDat) }}
  template(#dialogs)
    formular-selector(name='addPerson', ref='addPerson')
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import gql from 'graphql-tag'
import { API_BASE } from '../../../plugins/apiBase'
import { useApollo } from '../../../plugins/apollo'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { useNotification } from '../../../plugins/notify'
import { useRouter } from '../../../plugins/router'
import { empty } from '../../../helpers'
import filterGenerator from '../../../util/filter.util'

const { client } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()
const { route, navigate } = useRouter()

const suche = ref('')
const rowCount = ref(0)
const data = ref<any[]>([])

const addPerson = useTemplateRef<any>('addPerson')

const filteredData = computed(() =>
  data.value.filter(filterGenerator(suche.value))
)

function formatGebDat(gebDat: string) {
  return gebDat.split('-').reverse().join('.')
}

const config = {
  sheet: [
    {
      id: 'pers_add',
      icon: 'person_add',
      label: 'Person hinzufügen',
      click: () => {
        addPerson
          .value!.show()
          .then(
            (data: {
              vorname: string
              nachname: string
              gebDat: string
              geschlecht: string
            }) => {
              client
                .mutate({
                  mutation: gql`
                    mutation (
                      $vorname: String!
                      $nachname: String!
                      $gebDat: String!
                      $geschlecht: String!
                      $authToken: String!
                    ) {
                      addPerson(
                        vorname: $vorname
                        nachname: $nachname
                        gebDat: $gebDat
                        geschlecht: $geschlecht
                        authToken: $authToken
                      )
                    }
                  `,
                  variables: {
                    ...data,
                    anmeldeID: route.value.params.id,
                    authToken: authToken.value
                  }
                })
                .then((res: any) => {
                  createNotification({
                    title: 'Neue Person',
                    body: `Du hast erfolgreich eine neue Person angelegt`
                  })
                  navigate(`/personen/${res.data.addPerson}/home`)
                })
                .catch((err: any) => {
                  error({
                    text: err.message,
                    title: 'Speichern fehlgeschlagen!'
                  })
                })
            }
          )
          .catch(empty)
      }
    }
  ],
  title: 'Personen',
  subTitle: 'Liste'
}

function loadData() {
  fetch(`${API_BASE}/v6/personen`, {
    headers: { authorization: authToken.value }
  })
    .then((res) => res.json())
    .then((resData: any) => {
      data.value = resData.personen
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

function getCount() {
  const tableHeight = window.innerHeight - 64 - 80 - 72 - 32 - 56 - 36 - 50 - 5
  rowCount.value = Math.floor(tableHeight / 50)
}

loadData()
getCount()
</script>
<style>
.geschlecht-w {
  background-color: #f000a0;
  opacity: 0.9;
}
.geschlecht-m {
  background-color: #00a0f0;
  opacity: 0.9;
}
</style>
