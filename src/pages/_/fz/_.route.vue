<template lang="pug">
ec-wrapper(:title='title')
  v-select(v-model="mode" :items="[{text: 'Alles', value: 'all'}, ...ecKreisData.map((v,i)=>({text: v.bezeichnung,value: i}))]")
  v-btn(@click="download") Download
  v-data-table(
    :headers=`[
      {
        text: 'Name',
        value: 'nachname'
      },
      {
        text: 'Letzes FZ',
        value: 'datumDesLetztenFZ.input'
      },
      {
        text: 'Letzer FZ-Antrag',
        value: 'fzAntraege[0].erzeugt.input'
      }
    ]`,
    :items='currentData',
    :rows-per-page-items='[rowCount]'
  )
    template(#items='props')
      tr(
        @click='$router.push({ path: `/personen/${props.item.personID}/home`, query: { prev: $route.fullPath } })',
        :style="`${state(props.item)}`"
      )
        td {{ props.item.vorname }}  {{ props.item.nachname }} {{ props.item.gebDat.german }}
        td {{ props.item.datumDesLetztenFZ ? props.item.datumDesLetztenFZ.german : 'N/A' }}
        td {{ [props.item.fzAntraege.reduce((acc, c) => acc === null ? c : (acc.erzeugt.input > c.erzeugt.input ? acc : c), null)].map(v=>v === null ? `N/A` : `${v.erzeugt.german} - ${v.erzeugt_durch}`)[0] }}
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import gql from "graphql-tag";

interface Person {
  personID: number
  vorname: string
  nachname: string
  gebDat: {
    german: string
  }
  geschlecht: 'm' | 'w'
  fzAntraege: {
    erzeugt: {
      german: string
      input: string
    }
    erzeugt_durch: string
  }[]
  fzs: {
    gesehenVon: {
      vorname: string
      nachname: string
    }
    fzVon: {
      german: string
    }
    gesehenAm: {
      german: string
    }
    kommentar: string
  }[]
  datumDesLetztenFZ: {
    german: string
    input: string
  }
}

@Component({})
export default class EcRootIndexHome extends Vue {
  public rowCount = 0;

  private getCount() {
    const tableHeight =
      window.innerHeight - 64 - 80 - 72 - 32 - 56 - 36 - 50 - 5;
    this.rowCount = Math.floor(tableHeight / 50);
  }

  async download() {
    const rows = this.currentData.map(v => {

      const lFZ = v.datumDesLetztenFZ ? v.fzs.filter(v2=>v2.fzVon.german === v.datumDesLetztenFZ.german)[0] : null;

      // @ts-ignore
      const lAntrag = v.fzAntraege.reduce((acc, c) => acc === null ? c : acc.erzeugt.input > c.erzeugt.input ? acc : c, null)

      return [
        v.personID,
        v.vorname,
        v.nachname,
        v.gebDat.german,
        v.geschlecht,
        ...(lFZ === null ? ['N/A','N/A','N/A','N/A'] : [
          lFZ.gesehenVon.vorname + ' ' + lFZ.gesehenVon.nachname,
          lFZ.gesehenAm.german,
          lFZ.fzVon.german,
          lFZ.kommentar
        ]),

        ...(lAntrag === null ? ['N/A', 'N/A'] : [lAntrag.erzeugt.german, lAntrag.erzeugt_durch] )
        
      ].join(';')
    })

    const header = [
      'PersID',
      'Vorname',
      'Nachname',
      'GeburtsDatum',
      'Geschlecht',
      'FZ - gesehen Von',
      'FZ - gesehen Am',
      'FZ - ausgestellt Am',
      'FZ - Kommentar',
      'FZ-Antrag - Vom',
      'FZ-Antrag - Erzeugt durch'
    ].join(';')

    const file = header + '\n' + rows.join('\n')

    const blob = await new Response(file).blob()
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${this.title}.csv`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(url)
    a.remove()
  }

  state(p: Person) {
    const now = new Date().getTime()

    if(p.datumDesLetztenFZ) {
      const last = new Date(p.datumDesLetztenFZ.input).getTime()

      const validUntil = last + 1000 * 60 * 60 * 24 * 365.25 * 5
      const newFrom = last + 1000 * 60 * 60 * 24 * 365.25 * 4.5
      
      if(now > validUntil) {
        return 'color: red'
      }

      if(now < newFrom) {
        return ''
      }

      // return 'background: yellow'
      return 'color: orange'
    }

    // @ts-ignore
    const newest = p.fzAntraege.reduce((acc, c) => acc === null ? c : (acc.erzeugt.input > c.erzeugt.input ? acc : c), null)

    const newTime = new Date(newest.erzeugt.input).getTime();
    
    if((now - newTime ) / 1000 / 60 / 60 / 24 > 28) {
      return 'background: red'
    }

    return 'background: orange'
  }

  mode: number | 'all' = 'all'

  ecKreisData: {
    ecKreisID: number
    bezeichnung: string
    fzPersonen: Person[]
  }[] = []
  fzData: Person[] = []

  get currentData() {
    if(this.mode === 'all') return this.fzData

    return this.ecKreisData[this.mode].fzPersonen
  }

  get title () {
    if(this.mode === 'all') return 'Alle FZ-Personen'

    return `EC-Kreis ${this.ecKreisData[this.mode].bezeichnung}`
  }

  private loadData() {
    this.$apolloClient.query({
      query: gql`
        query($authToken: String!) {
          ecKreise(authToken: $authToken) {
            ecKreisID
            bezeichnung
            fzPersonen {
              personID
              vorname
              nachname
              gebDat {
                german
              }
              geschlecht
              fzs {
                gesehenVon {
                  vorname
                  nachname
                }
                fzVon {
                  german
                }
                gesehenAm {
                  german
                }
                kommentar
              }
              fzAntraege {
                erzeugt {
                  german
                  input
                }
                erzeugt_durch
              }
              datumDesLetztenFZ {
                german
                input
              }
            }
          }
        }
      `,
      variables: {
        authToken: this.$authToken()
      }
    }).then((res: any) => {
      this.ecKreisData = res.data.ecKreise;
    }).catch((err: any) => {
      this.$dialog.error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      });
    });

    this.$apolloClient.query({
      query: gql`
        query($authToken: String!) {
          fzPersonen(authToken: $authToken) {
            personID
            vorname
            nachname
            gebDat {
              german
            }
            geschlecht
            fzs {
              gesehenVon {
                vorname
                nachname
              }
              fzVon {
                german
              }
              gesehenAm {
                german
              }
              kommentar
            }
            fzAntraege {
              erzeugt  {
                german
                input
              }
              erzeugt_durch
            }
            datumDesLetztenFZ {
              german
              input
            }
          }
        }
      `,
      variables: {
        authToken: this.$authToken()
      }
    }).then((res: any) => {
      this.fzData = res.data.fzPersonen;
    }).catch((err: any) => {
      this.$dialog.error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      });
    });
  }

  private created() {
    this.loadData();
    this.getCount();
  }

}
</script>