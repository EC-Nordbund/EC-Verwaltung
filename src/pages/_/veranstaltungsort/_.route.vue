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
      :key='item.vOrtID',
      @click='open(item)'
    )
      template(#prepend)
        v-icon group
      v-list-item-title {{ item.bezeichnung }} (ID: {{ item.vOrtID }})
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

const config = {
  sheet: [
    {
      id: 'ver_ort_add',
      icon: 'add',
      label: 'Veranstaltungsort hinzufügen',
      click: sheetClick
    }
  ],
  title: 'Veranstaltungsorte'
}

function sheetClick(item: { id: string }) {
  alert(item.id)
}

function open(item: any) {
  // navigate (pushWithPrev) ergänzt query.prev = aktuelle fullPath — wie
  // früher $router.push({..., query: { prev: $route.fullPath }})
  navigate(`veranstaltungsort/${item.vOrtID}/home`)
}

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!) {
          vorte(authToken: $authToken) {
            vOrtID
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
      data.value = res.data.vorte
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
