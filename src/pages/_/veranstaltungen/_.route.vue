<template lang="pug">
ec-wrapper(hasSheet, hasDial, hasHeader, v-bind='config', hasReload, @reload='loadData')
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='Veranstaltung suchen', @suche='suche = $event')
  v-list(lines='two')
    v-list-item(
      v-for='item in filteredData',
      :key='item.veranstaltungsID',
      @click='openItem(item)'
    )
      template(#prepend)
        v-icon group
      v-list-item-title {{ item.bezeichnung }} (ID: {{ item.veranstaltungsID }})
      v-list-item-subtitle {{ item.begin.german }} - {{ item.ende.german }}
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
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
      id: 'vera_add',
      icon: 'add',
      label: 'Veranstaltung hinzufügen',
      click: sheetClick
    }
  ],
  title: 'Veranstaltungen'
}

// gefilterte + umgedrehte Liste als computed (statt filter().reverse()
// direkt im Template — Vue-3-Regel: keine mutierenden Array-Methoden in
// Template-Ausdrücken)
const filteredData = computed(() => data.value.filter(filterData).reverse())

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!) {
          veranstaltungen(authToken: $authToken) {
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
      `,
      variables: {
        authToken: authToken.value
      }
    })
    .then((res: any) => {
      data.value = res.data.veranstaltungen
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

loadData()

function openItem(item: any) {
  navigate({ path: `veranstaltungen/${item.veranstaltungsID}/home` })
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

function sheetClick(item: { id: string }) {
  alert(item.id)
}
</script>
