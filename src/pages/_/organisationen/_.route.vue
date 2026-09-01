<template lang="pug">
ec-wrapper(
  hasSheet,
  hasDial,
  hasHeader,
  v-bind='config',
  hasReload,
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Veranstaltung suchen', @suche='suche = $event')
  v-list(lines='two')
    v-list-item(
      v-for='item in data.filter(filterData)',
      :key='item.organisationsID',
      @click='openOrganisation(item)'
    )
      template(#prepend)
        v-icon group
      v-list-item-title {{ item.bezeichnung }} (ID: {{ item.organisationsID }})
      v-list-item-subtitle {{ item.plz }} {{ item.ort }} | {{ item.land }}
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useApollo } from '../../../plugins/apollo'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { useRouter } from '../../../plugins/router'

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { navigate } = useRouter()

const suche = ref('')
const data = ref<any[]>([])

function sheetClick(item: { id: string }) {
  alert(item.id)
}

const config = {
  sheet: [
    {
      id: 'orga_add',
      icon: 'add',
      label: 'Organisation hinzufügen',
      click: sheetClick
    }
  ],
  title: 'Organisationen'
}

function openOrganisation(item: any) {
  // ersetzt $router.push({..., query: {prev: $route.fullPath}})
  navigate(`organisationen/${item.organisationsID}/home`)
}

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!) {
          orgas(authToken: $authToken) {
            organisationsID
            bezeichnung
            plz
            ort
            land
          }
        }
      `,
      variables: {
        authToken: authToken.value
      }
    })
    .then((res: any) => {
      data.value = res.data.orgas
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
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
  if (!s) {
    return true
  }
  if (typeof item === 'string') {
    return item.toLowerCase().includes(s)
  } else if (typeof item === 'number' || typeof item === 'boolean') {
    return item.toString().toLowerCase().includes(s)
  } else if (item) {
    return Object.keys(item)
      .map((key) => filterPart(item[key], s))
      .reduce((a, b) => a || b, false)
  } else {
    return false
  }
}

loadData()
</script>
