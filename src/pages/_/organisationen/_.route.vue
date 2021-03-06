<template lang="pug">
  ec-wrapper(hasSheet hasDial hasHeader v-bind="config" hasReload @reload="loadData")
    template(#header)
      div(style="padding: 2px 10px")
        ec-search(label="Veranstaltung suchen" @suche="suche = $event")
    v-list(two-line)
      v-list-tile(v-for="item in data.filter(filterData)" :key="item.organisationsID" @click="$router.push({path: `organisationen/${item.organisationsID}/home`, query: {prev: $route.fullPath}})")
        v-list-tile-action
          v-icon group
        v-list-tile-content
          v-list-tile-title {{item.bezeichnung}} (ID: {{item.organisationsID}})
          v-list-tile-sub-title {{item.plz}} {{item.ort}} | {{item.land}}
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import gql from 'graphql-tag'

@Component({})
export default class EcRootIndex extends Vue {
  public static meta = {}
  private config = {
    sheet: [
      {
        id: 'orga_add',
        icon: 'add',
        label: 'Organisation hinzufügen',
        click: this.sheetClick
      }
    ],
    title: 'Organisationen'
  }

  private suche = ''
  private data: any = []

  private sheetClick(item: { id: string }) {
    alert(item.id)
  }

  private loadData() {
    this.$apolloClient
      .query({
        query: gql`
          query($authToken: String!) {
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
          authToken: this.$authToken()
        }
      })
      .then((res: any) => {
        this.data = res.data.orgas
      })
      .catch((err: any) => {
        this.$dialog.error({
          text: err.message,
          title: 'Laden fehlgeschlagen!'
        })
      })
  }

  private filterData(item: any): boolean {
    return this.suche
      .toLowerCase()
      .split(' ')
      .map((suche: string) => this.filterPart(item, suche))
      .reduce((a, b) => a && b, true)
  }

  private filterPart(item: any, suche: string): boolean {
    if (!suche) {
      return true
    }
    if (typeof item === 'string') {
      return item.toLowerCase().includes(suche)
    } else if (typeof item === 'number' || typeof item === 'boolean') {
      return item.toString().toLowerCase().includes(suche)
    } else if (item) {
      return Object.keys(item)
        .map((key) => this.filterPart(item[key], suche))
        .reduce((a, b) => a || b, false)
    } else {
      return false
    }
  }

  private created() {
    this.loadData()
  }
}
</script>
