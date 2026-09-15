<template lang="pug">
ec-wrapper(
  hasSheet,
  hasDial,
  hasNav,
  hasXBtn,
  hasReload,
  hasRouterView,
  v-bind='config',
  @getData='getData'
)
  router-view(v-slot='{ Component }')
    component(
      :is='Component',
      :data='data',
      :reloadKey='reloadKey',
      @reload='$emit("reload")'
    )
  template(#dialogs)
    formular-selector(name='abmelden', ref='abmelden')
    formular-selector(name='editBemerkungen', ref='editBemerkungen')
    //- Direkt an formular-dialog gebunden statt über formular-selector: die
    //- Configs hängen von der geladenen Anmeldung ab (Rolle, Beträge) und
    //- müssen sich mit ihr ändern — der Selector wertet seinen Kontext nur
    //- einmal aus.
    formular-dialog(v-bind='ruecknahmeConfig', ref='ruecknahme')
    formular-dialog(v-bind='loeschenConfig', ref='loeschen')
    ec-anmeldung-kontakt(
      :data='data',
      ref='formKontakt',
      @reload='$emit("reload")'
    )
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useApollo } from '../../../../plugins/apollo'
import { useLogin } from '../../../../plugins/auth'
import { API_BASE } from '../../../../plugins/apiBase'
import { useDialog } from '../../../../plugins/dialog'
import { useNotification } from '../../../../plugins/notify'
import { useRouter } from '../../../../plugins/router'
import { empty, errorHandler } from '../../../../helpers'
import { ecForm } from '../../../../config/form'

// import { genReport, existsReport } from '../../../../report';

defineEmits(['reload'])

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()
const { route, navigate } = useRouter()

const abmelden = useTemplateRef<{ show: () => Promise<any> }>('abmelden')
const editBemerkungen = useTemplateRef<{ show: () => Promise<any> }>(
  'editBemerkungen'
)
const formKontakt = useTemplateRef<{ show: () => void }>('formKontakt')
const ruecknahme = useTemplateRef<{ show: () => Promise<any> }>('ruecknahme')
const loeschen = useTemplateRef<{ show: () => Promise<any> }>('loeschen')

const data = ref<any>({
  person: { gebDat: {} },
  veranstaltung: { begin: {}, ende: {} },
  adresse: {},
  email: {},
  telefon: {},
  anmeldeZeitpunkt: {},
  DSGVO_einverstaendnis: {}
})
const best = ref(false)
const info = ref(false)

// Zählt nach jeder protokollierten Aktion hoch; der Protokoll-Tab lädt dann neu.
const reloadKey = ref(0)

const istAbgemeldet = computed(() => data.value.wartelistenPlatz < 0)

/** Gezahlt abzüglich Rückzahlung und Abmeldegebühr — gleiche Rechnung wie die API. */
const offenerBetrag = computed(() =>
  Math.max(
    0,
    (data.value.bisherBezahlt ?? 0) -
      (data.value.rueckbezahlt ?? 0) -
      (data.value.abmeldeGebuehr ?? 0)
  )
)

const ruecknahmeConfig = computed(() =>
  ecForm.abmeldungRuecknahme({
    istTeilnehmer: data.value.position === 1,
    abmeldeGebuehr: data.value.abmeldeGebuehr ?? 0,
    rueckbezahlt: data.value.rueckbezahlt ?? 0
  })
)

const loeschenConfig = computed(() =>
  ecForm.anmeldungLoeschen({
    anmeldeID: String(route.value.params.id),
    offenerBetrag: offenerBetrag.value
  })
)

function jsonKopf() {
  return {
    authorization: authToken.value,
    'content-type': 'application/json'
  }
}

/** Meldungen aus der API kommen als text/plain (siehe helpers.errorHandler). */
function zeigeFehler(titel: string) {
  return (err: any) => {
    error({ text: String(err?.message || err), title: titel })
  }
}

function abmeldungZuruecknehmen() {
  ruecknahme
    .value!.show()
    .then((formData: { ziel: string; begruendung: string }) =>
      fetch(
        `${API_BASE}/v6/anmeldung/${encodeURIComponent(
          String(route.value.params.id)
        )}/ruecknahme`,
        {
          method: 'POST',
          headers: jsonKopf(),
          body: JSON.stringify(formData)
        }
      )
        .then(errorHandler)
        .then((res) => res.json())
        .then((res: { wartelistenPlatz: number }) => {
          createNotification({
            title: 'Abmeldung zurückgenommen',
            body:
              res.wartelistenPlatz === 0
                ? 'Die Person ist wieder angemeldet.'
                : `Die Person steht jetzt auf Wartelistenplatz ${res.wartelistenPlatz}.`
          })
          reloadKey.value++
          getData()
        })
        .catch(zeigeFehler('Rücknahme fehlgeschlagen!'))
    )
    .catch(empty)
}

function anmeldungLoeschen() {
  loeschen
    .value!.show()
    .then((formData: { begruendung: string; trotzOffenerZahlung?: boolean }) =>
      fetch(
        `${API_BASE}/v6/anmeldung/${encodeURIComponent(
          String(route.value.params.id)
        )}/loeschen`,
        {
          method: 'POST',
          headers: jsonKopf(),
          body: JSON.stringify({
            begruendung: formData.begruendung,
            trotzOffenerZahlung: formData.trotzOffenerZahlung === true
          })
        }
      )
        .then(errorHandler)
        .then((res) => res.json())
        .then((res: { veranstaltungsID: number }) => {
          createNotification({
            title: 'Anmeldung gelöscht',
            body: 'Die Anmeldung wurde endgültig gelöscht. Der Vorgang steht im Protokoll der Veranstaltung.'
          })
          // Die Seite gehört zu einem Datensatz, den es nicht mehr gibt —
          // weiter zum Protokoll der Freizeit, wo der Eintrag jetzt steht.
          navigate(`/veranstaltungen/${res.veranstaltungsID}/protokoll`)
        })
        .catch(zeigeFehler('Löschen fehlgeschlagen!'))
    )
    .catch(empty)
}

const config = computed(() => ({
  sheet: [
    {
      id: 'anmel_rep_bestbrief',
      icon: 'markunread_mailbox',
      label: 'Bestätigungsbrief per Mail verschicken',
      disabled:
        data.value.abmeldeZeitpunkt !== null ||
        data.value.wartelistenPlatz !== 0,
      click: async () => {
        if (data.value.bestaetigungsBrief !== null) {
          if (
            !confirm(
              `Brief wurde ${data.value.bestaetigungsBrief.german} bereits verschickt. Erneut verschicken?`
            )
          ) {
            return
          }
        }
        const res = await fetch(
          `${API_BASE}/v6/best-brief/anmeldung/${route.value.params.id}`,
          { headers: { authorization: authToken.value } }
        )
        if (res.ok) {
          alert('Bestätigungsbrief wurde verschickt.')
        } else {
          alert(`Versand fehlgeschlagen (HTTP ${res.status}).`)
        }
      }
    },
    {
      id: 'anmel_rep_infobrief',
      icon: 'markunread_mailbox',
      label: 'Infobrief generieren und Drucken',
      disabled:
        !info.value ||
        data.value.abmeldeZeitpunkt !== null ||
        data.value.wartelistenPlatz !== 0,
      click: () => {
        if (data.value.infoBrief !== null) {
          if (
            !confirm(
              `Brief wurde ${data.value.infoBrief.german} bereits generiert. Erneut generieren?`
            )
          ) {
            return
          }
        }
        // genReport(
        //   `info-brief-${this.data.veranstaltung.veranstaltungsID}`,
        //   this.data,
        //   `infobrief-${this.$route.params.id}.docx`
        // ).then((r) => {
        //   this.$apolloClient.mutate({
        //     mutation: gql`
        //       mutation($anmeldeID: String!, $authToken: String!) {
        //         anmeldunginfobrief(anmeldeID: $anmeldeID, authToken: $authToken)
        //       }
        //     `,
        //     variables: {
        //       authToken: this.$authToken(),
        //       anmeldeID: this.$route.params.id
        //     }
        //   });
        // });
      }
    },
    {
      id: 'anmel_abmelden',
      icon: 'person_add_disabled',
      label: 'Person abmelden',
      disabled: data.value.wartelistenPlatz === -1,
      click: () => {
        abmelden
          .value!.show()
          .then(
            (formData: { weg: string; kommentar: string; gebuehr: string }) => {
              client
                .mutate({
                  mutation: gql`
                    mutation (
                      $anmeldeID: String!
                      $weg: String!
                      $gebuehr: Int!
                      $kommentar: String!
                      $authToken: String!
                    ) {
                      abmelden(
                        anmeldeID: $anmeldeID
                        weg: $weg
                        gebuehr: $gebuehr
                        kommentar: $kommentar
                        authToken: $authToken
                      )
                    }
                  `,
                  variables: {
                    ...formData,
                    gebuehr: parseInt(formData.gebuehr),
                    anmeldeID: route.value.params.id,
                    authToken: authToken.value
                  }
                })
                .then(() => {
                  createNotification({
                    title: 'Erfolgreich Abgemeldet',
                    body: `Du hast erfolgreich die Person abgemeldet.`
                  })
                  reloadKey.value++
                  getData()
                })
                .catch((err) => {
                  error({
                    text: err.message,
                    title: 'Speichern fehlgeschlagen!'
                  })
                })
            }
          )
          .catch(empty)
      }
    },
    {
      id: 'anmel_ruecknahme',
      icon: 'undo',
      label: 'Abmeldung zurücknehmen',
      disabled: !istAbgemeldet.value,
      click: abmeldungZuruecknehmen
    },
    {
      id: 'anmel_loeschen',
      icon: 'delete_forever',
      label: 'Abgemeldete Anmeldung löschen',
      disabled: !istAbgemeldet.value,
      click: anmeldungLoeschen
    },
    {
      id: 'anmel_bemerkungenEdit',
      icon: 'edit',
      label: 'Bemerkungen editieren',
      click: () => {
        editBemerkungen
          .value!.show()
          .then((formData: any) => {
            client
              .mutate({
                mutation: gql`
                  mutation (
                    $authToken: String!
                    $anmeldeID: String!
                    $vegetarisch: Boolean!
                    $gesundheitsinformationen: String!
                    $bemerkungen: String!
                    $lebensmittelAllergien: String!
                  ) {
                    anmeldungBesonderheiten(
                      authToken: $authToken
                      anmeldeID: $anmeldeID
                      vegetarisch: $vegetarisch
                      gesundheitsinformationen: $gesundheitsinformationen
                      bemerkungen: $bemerkungen
                      lebensmittelAllergien: $lebensmittelAllergien
                    )
                  }
                `,
                variables: {
                  ...formData,
                  anmeldeID: route.value.params.id,
                  authToken: authToken.value
                }
              })
              .then(() => {
                createNotification({
                  title: 'Bemerkungen editieren',
                  body: `Du hast erfolgreich die Bemerkungen geändert.`
                })
                getData()
              })
              .catch((err: any) => {
                error({
                  text: err.message,
                  title: 'Speichern fehlgeschlagen!'
                })
              })
          })
          .catch(empty)
      }
    },
    {
      id: 'anmel_kontakt',
      icon: 'contact_mail',
      label: 'Kontaktdaten editieren',
      click: () => {
        formKontakt.value!.show()
      }
    },
    {
      id: 'anmel_nachrücken',
      icon: 'transfer_within_a_station',
      label: 'Nachrücken lassen',
      disabled: data.value.wartelistenPlatz <= 0,
      click: () => {
        if (
          confirm(
            'Sicher, dass die Person Nachrücken soll?\n\n Die Person hat also bestätigt, dass sie Nachrücken kann.'
          )
        ) {
          client.mutate({
            mutation: gql`
              mutation ($anmeldeID: String!, $authToken: String!) {
                nachruecken(anmeldeID: $anmeldeID, authToken: $authToken)
              }
            `,
            variables: {
              anmeldeID: route.value.params.id,
              authToken: authToken.value
            }
          })
        }
      }
    }
  ],
  nav: [
    {
      icon: 'home',
      label: 'Allgemein',
      to: `/anmeldungen/${route.value.params.id}/home`
    },
    {
      icon: 'euro_symbol',
      label: 'Finanzen',
      to: `/anmeldungen/${route.value.params.id}/finanzen`
    },
    {
      icon: 'extension',
      label: 'Sonstiges',
      to: `/anmeldungen/${route.value.params.id}/sonstiges`
    },
    {
      icon: 'history',
      label: 'Protokoll',
      to: `/anmeldungen/${route.value.params.id}/protokoll`
    }
  ],
  title: `${(data.value.person || {}).vorname} ${
    (data.value.person || {}).nachname
  } - ${(data.value.veranstaltung || {}).bezeichnung}`,
  subTitle: 'Anmeldung'
}))

function getData() {
  client
    .query({
      query: gql`
        query ($authToken: String!, $anmeldeID: String!) {
          anmeldung(authToken: $authToken, anmeldeID: $anmeldeID) {
            anmeldeID
            person {
              personID
              vorname
              nachname
              gebDat {
                german
              }
              geschlecht
            }
            veranstaltung {
              veranstaltungsID
              bezeichnung
              begin {
                input
                german
                year
              }
              ende {
                input
                german
              }
            }
            position
            adresse {
              adressID
              strasse
              plz
              ort
            }
            email {
              eMailID
              eMail
            }
            telefon {
              telefonID
              telefon
            }
            wartelistenPlatz
            bisherBezahlt
            anmeldeZeitpunkt {
              german
            }
            abmeldeZeitpunkt {
              german
            }
            abmeldeGebuehr
            wegDerAbmeldung
            rueckbezahlt
            kommentarAbmeldung
            vegetarisch
            lebensmittelAllergien
            gesundheitsinformationen
            bemerkungen
            radfahren
            fahrgemeinschaften
            klettern
            sichEntfernen
            bootFahren
            schwimmen
            DSGVO_einverstaendnis {
              german
            }
            bestaetigungsBrief {
              german
            }
            infoBrief {
              german
            }
            extra_json
          }
        }
      `,
      variables: {
        authToken: authToken.value,
        anmeldeID: route.value.params.id
      },
      fetchPolicy: 'no-cache'
    })
    .then(async (res: any) => {
      // null, wenn es die Anmeldung nicht (mehr) gibt — seit dem Löschen
      // abgemeldeter Anmeldungen ein regulärer Fall (Lesezeichen, Verlauf).
      // Die Platzhalter-Daten bleiben stehen, sonst stolpern die computeds.
      if (!res.data.anmeldung) {
        error({
          text: `Es gibt keine Anmeldung mit der ID ${route.value.params.id} – sie wurde vermutlich gelöscht. Der Vorgang steht dann im Protokoll der Veranstaltung.`,
          title: 'Anmeldung nicht gefunden'
        })
        return
      }
      data.value = res.data.anmeldung

      // this.best = await existsReport(`best-brief-${this.data.veranstaltung.veranstaltungsID}`);
      // this.info = await existsReport(`info-brief-${this.data.veranstaltung.veranstaltungsID}`);
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

getData()
</script>
