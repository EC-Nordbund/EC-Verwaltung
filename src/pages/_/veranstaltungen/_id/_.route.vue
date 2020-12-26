<template lang="pug">
ec-wrapper(hasSheet, hasDial, hasNav, hasXBtn, hasRouterView, v-bind='config')
  template
    router-view(:data='data')
    v-menu(bottom, left)
      template(v-slot:activator='{ on }')
        v-btn(v-on='on') TN-Liste gnerieren
      v-list
        v-list-tile(@click='all')
          v-list-tile-title Alle (jeweils mit und ohne Warteliste)
        v-divider
        v-list-tile(
          v-for='item in tnListen',
          @click='g(item.name, (v) => v == 0)'
        )
          v-list-tile-title {{ item.label }}
        v-divider
        v-list-tile(
          v-for='item in tnListen',
          @click='g(item.name, (v) => v >= 0)'
        )
          v-list-tile-title {{ item.label }} mit Warteliste
        v-divider
        v-list-tile(
          v-for='item in tnListen',
          @click='g(item.name, (v) => v > 0)'
        )
          v-list-tile-title {{ item.label }} nur Warteliste
        v-divider
        v-list-tile(
          v-for='item in tnListen',
          @click='g(item.name, (v) => v < 0)'
        )
          v-list-tile-title {{ item.label }} nur Abgemeldete
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { generate, getTemplates } from '../../../../tnList';
import gql from 'graphql-tag';

@Component({})
export default class EcRootIndex extends Vue {
  private get config() {
    return {
      sheet: [
        {
          icon: 'mail',
          id: 'veranstaltung_create_tokens',
          label: 'Mitarbeiteranmeldungstoken erzeugen',
          click: async () => {
            const res = await fetch(
              'https://api.ec-nordbund.de/api-v4/anmeldetoken',
              {
                method: 'POST',
                headers: {
                  'authorization': this.$authToken(),
                  'content-type': 'application/json'
                },
                body: JSON.stringify({ id: parseInt(this.$route.params.id) })
              }
            );

            const d = (await res.json()).data;

            const createMailText = (code: string) => `Moin,
Damit du im EC System für die Veranstaltung eingtragen bist, möchte ich dich bitten dich unter dem folgenden Link anzumelden:

https://www.ec-nordbund.de/anmeldung/mitarbeiter/${code}

Oder gehe auf https://www.ec-nordbund.de/anmeldung/mitarbeiter und füge den Code

${code}

ein.


Solltest du ein (neues) erweitertes Führungszeugnis benötigen erhältst den benötigten Antrag direkt nach der Anmeldung per Mail.

Gruß
Thomas Seeger
`;

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


            `);
            alert('Mail-Text in Zwischenablage kopiert.');
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
      title: `${this.data.bezeichnung} (${this.data.begin.german} - ${this.data.ende.german})`,
      subTitle: 'Veranstaltung'
    };
  }
  public static meta = {};

  public data: any = {
    anmeldungen: [],
    begin: {},
    ende: {},
    veranstaltungsort: {}
  };

  private tnListen: any = [];
  private genList = generate;

  private all() {
    this.tnListen.forEach((el: { name: string; label: string }) => {
      this.g(el.name, (v) => v === 0);
      this.g(el.name, (v) => v >= 0);
    });
  }

  private g(name: string, wList: (v: number) => boolean) {
    this.genList(
      parseInt(this.$route.params.id, 10),
      name,
      this.$authToken(),
      this.$apolloClient,
      wList
    );
  }

  private sheetClick(item: { id: string }) {
    alert(item.id);
  }

  private loadData() {
    this.$apolloClient
      .query({
        query: gql`
          query($authToken: String!, $veranstaltungsID: Int!) {
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
          authToken: this.$authToken(),
          veranstaltungsID: parseInt(this.$route.params.id)
        },
        fetchPolicy: 'no-cache'
      })
      .then((res: any) => {
        this.data = res.data.veranstaltung;
      })
      .catch((err: any) => {
        this.$dialog.error({
          text: err.message,
          title: 'Laden fehlgeschlagen!'
        });
      });
  }

  private created() {
    this.loadData();
    getTemplates().then((res) => {
      this.tnListen = res;
    });
  }
}
</script>
