<template lang="pug">
ec-wrapper(
  hasXBtn,
  hasNav,
  hasSheet,
  hasHeader,
  hasDial,
  v-bind='config',
  hasReload,
  @reload='loadData'
)
  router-view(v-slot='{ Component }')
    component(:is='Component', :data='data', @reload='loadData')
  template(#dialogs)
    //- ec-fz-antrag(ref="fzAntrag" :data="data" @reload="loadData")
    formular-dialog(v-bind='fzAntragConfig', ref='fzAntrag')
    formular-dialog(v-bind='fzAddConfig', ref='addFZ')
    formular-dialog(v-bind='mergePersonConfig', ref='mergePerson')
    formular-selector(name='addMail', ref='addMail')
    formular-selector(name='addTelefon', ref='addTelefon')
    formular-selector(name='addAdresse', ref='addAdresse')
    formular-selector(name='personStamm', ref='editStamm')
</template>
<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import gql from 'graphql-tag'
import { ecForm } from '../../../../config/form'
import { useApollo } from '../../../../plugins/apollo'
import { useLogin } from '../../../../plugins/auth'
import { useDialog } from '../../../../plugins/dialog'
import { useNotification } from '../../../../plugins/notify'
import { useRouter } from '../../../../plugins/router'
import { empty } from '../../../../helpers'

const { client } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()
const { route } = useRouter()

const allePersonen = ref<any[]>([])

const data = ref<any>({
  gebDat: {},
  adressen: [],
  telefone: [],
  emails: [],
  fzs: [],
  fzAntraege: [],
  ak: []
})

const fzAntrag = useTemplateRef<any>('fzAntrag')
const addFZ = useTemplateRef<any>('addFZ')
const mergePerson = useTemplateRef<any>('mergePerson')
const addMail = useTemplateRef<any>('addMail')
const addTelefon = useTemplateRef<any>('addTelefon')
const addAdresse = useTemplateRef<any>('addAdresse')
const editStamm = useTemplateRef<any>('editStamm')

// Die ecForm-Factories erhalten statt der Komponenteninstanz (`this`)
// ein explizites Parameter-Objekt mit genau den genutzten Feldern.
const mergePersonConfig = computed(() =>
  ecForm.personMerge({
    allePersonen: allePersonen.value,
    routeParamsId: route.value.params.id as string
  })
)

const fzAntragConfig = computed(() =>
  ecForm.generateFZAntrag({ data: data.value })
)

const fzAddConfig = computed(() =>
  ecForm.addFZ({
    allePersonen: allePersonen.value,
    routeParamsId: route.value.params.id as string
  })
)

const config = computed(() => {
  return {
    sheet: [
      {
        icon: 'home',
        id: 'pers_add_adresse',
        label: 'Adresse hinzufügen',
        click: () => {
          addAdresse
            .value!.show()
            .then(
              (formData: {
                adresse: { strasse: string; plz: string; ort: string }
              }) => {
                client
                  .mutate({
                    mutation: gql`
                      mutation (
                        $authToken: String!
                        $personID: Int!
                        $strasse: String!
                        $plz: String!
                        $ort: String!
                      ) {
                        addAdresse(
                          personID: $personID
                          strasse: $strasse
                          plz: $plz
                          ort: $ort
                          authToken: $authToken
                        )
                      }
                    `,
                    variables: {
                      ...formData.adresse,
                      authToken: authToken.value,
                      personID: data.value.personID
                    }
                  })
                  .then((res: any) => {
                    createNotification({
                      title: 'Neue Adresse',
                      body: `Adresse erfolgreich hinzugefügt`
                    })
                    loadData()
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
      },
      {
        icon: 'mail',
        id: 'pers_add_email',
        label: 'Email hinzufügen',
        click: () => {
          addMail
            .value!.show()
            .then((formData: { email: string }) => {
              client
                .mutate({
                  mutation: gql`
                    mutation (
                      $authToken: String!
                      $personID: Int!
                      $email: String!
                    ) {
                      addEmail(
                        personID: $personID
                        email: $email
                        authToken: $authToken
                      )
                    }
                  `,
                  variables: {
                    email: formData.email,
                    authToken: authToken.value,
                    personID: data.value.personID
                  }
                })
                .then((res: any) => {
                  createNotification({
                    title: 'Neue Email',
                    body: `Email erfolgreich hinzugefügt`
                  })
                  loadData()
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
        icon: 'phone',
        id: 'pers_add_telefon',
        label: 'Telefon hinzufügen',
        click: () => {
          addTelefon
            .value!.show()
            .then((formData: { telefon: string }) => {
              client
                .mutate({
                  mutation: gql`
                    mutation (
                      $authToken: String!
                      $personID: Int!
                      $telefon: String!
                    ) {
                      addTelefon(
                        personID: $personID
                        telefon: $telefon
                        authToken: $authToken
                      )
                    }
                  `,
                  variables: {
                    telefon: formData.telefon,
                    authToken: authToken.value,
                    personID: data.value.personID
                  }
                })
                .then((res: any) => {
                  createNotification({
                    title: 'Neue Telefonnummer',
                    body: `Telefonnummer erfolgreich hinzugefügt`
                  })
                  loadData()
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
        icon: 'call_merge',
        id: 'pers_merge',
        label: 'Person mergen',
        click: () => {
          mergePerson
            .value!.show()
            .then((res: { falsch: number }) => {
              console.log(res)
              client
                .mutate({
                  mutation: gql`
                    mutation (
                      $authToken: String!
                      $richtig: Int!
                      $falsch: Int!
                    ) {
                      mergePersons(
                        authToken: $authToken
                        personID_richtig: $richtig
                        personID_falsch: $falsch
                      )
                    }
                  `,
                  variables: {
                    falsch: res.falsch,
                    authToken: authToken.value,
                    richtig: parseInt(route.value.params.id as string)
                  }
                })
                .then(() => {
                  createNotification({
                    title: 'Personen gemergt',
                    body: `Du hast erfolgreich die Personen zusammengeführt.`
                  })
                  loadData()
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
        icon: 'assignment',
        id: 'pers_create_fz_antrag',
        label: 'FZ-Antrag generieren',
        click: () => {
          const generate = (mail: string) => {
            client
              .mutate({
                mutation: gql`
                  mutation (
                    $personID: Int!
                    $authToken: String!
                    $email: String!
                  ) {
                    addFZAntrag(
                      personID: $personID
                      authToken: $authToken
                      email: $email
                    )
                  }
                `,
                variables: {
                  authToken: authToken.value,
                  personID: parseInt(route.value.params.id as string),
                  email: mail
                }
              })
              .then(() => {
                createNotification({
                  title: 'Erfolgreich Generiert',
                  body: `Du hast erfolgreich den Antrag generiert. An fz@ec-nordbund.de wurde eine Kopie gesendet!`
                })
                loadData()
              })
              .catch((err) => {
                error({
                  text: err.message,
                  title: 'Speichern fehlgeschlagen!'
                })
              })
          }

          switch (data.value.emails.length) {
            case 0:
              alert('Du musste eine Mail erst eintragen!')
              break
            case 1:
              generate(data.value.emails[0].eMail)
              break
            default:
              fzAntrag
                .value!.show()
                .then((formData: { mail: string }) => generate(formData.mail))
                .catch(empty)
              break
          }
        }
      },
      {
        icon: 'assignment',
        id: 'pers_add_fz',
        label: 'FZ Eintragen',
        click: () => {
          addFZ
            .value!.show()
            .then(
              (formData: {
                gesehenVon: number
                fzVon: string
                gesehenAm: string
                kommentar: string
              }) => {
                client
                  .mutate({
                    mutation: gql`
                      mutation (
                        $personID: Int!
                        $authToken: String!
                        $gesehenAm: String!
                        $gesehenVon: Int!
                        $kommentar: String!
                        $fzVon: String!
                      ) {
                        addFZ(
                          personID: $personID
                          authToken: $authToken
                          gesehenAm: $gesehenAm
                          gesehenVon: $gesehenVon
                          kommentar: $kommentar
                          fzVon: $fzVon
                        )
                      }
                    `,
                    variables: {
                      ...formData,
                      personID: parseInt(route.value.params.id as string),
                      authToken: authToken.value
                    }
                  })
                  .then(() => {
                    createNotification({
                      title: 'Neues FZ eingetragen',
                      body: `Du hast erfolgreich ein neues FZ eingetragen.`
                    })
                    loadData()
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
      },
      {
        icon: 'edit',
        id: 'pers_edit_stamm',
        label: 'Stammdaten editieren',
        click: () => {
          editStamm
            .value!.show({
              vorname: data.value.vorname,
              nachname: data.value.nachname,
              gebDat: data.value.gebDat.input,
              geschlecht: data.value.geschlecht
            })
            .then(
              (formData: {
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
                        $personID: Int!
                      ) {
                        editPersonStamm(
                          vorname: $vorname
                          nachname: $nachname
                          gebDat: $gebDat
                          geschlecht: $geschlecht
                          authToken: $authToken
                          personID: $personID
                        )
                      }
                    `,
                    variables: {
                      ...formData,
                      personID: parseInt(route.value.params.id as string),
                      authToken: authToken.value
                    }
                  })
                  .then((res: any) => {
                    createNotification({
                      title: 'Stammdaten editiert',
                      body: `Du hast erfolgreich die Person editiert.`
                    })
                    loadData()
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
      },
      {
        disabled: true,
        icon: 'local_offer',
        id: 'pers_edit_kategor',
        label: 'Kategorien editieren',
        click: () => {
          alert('Comming later...')
        }
      },
      {
        icon: 'extension',
        id: 'pers_edit_sonstiges',
        label: 'Sonstiges editieren',
        click: () => {
          alert('Comming Soon...')
        }
      },
      {
        disabled: true,
        icon: 'assignment',
        id: 'pers_report',
        label: 'Report erzeugen',
        click: () => {
          alert('Kommt nach Bedarf...')
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
        icon: 'event',
        label: 'Veranstaltungen',
        to: 'veranstaltungen'
      },
      {
        icon: 'extension',
        label: 'Sonstiges',
        to: 'sonstiges'
      }
    ],
    title: `${data.value.vorname} ${data.value.nachname} (${data.value.gebDat.german})`,
    subTitle: 'Person'
  }
})

function loadPersons() {
  client
    .query({
      query: gql`
        query ($authToken: String!) {
          personen(authToken: $authToken) {
            personID
            vorname
            nachname
            gebDat {
              german
              input
            }
          }
        }
      `,
      variables: {
        authToken: authToken.value
      }
    })
    .then((res) => {
      allePersonen.value = res.data.personen
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

function loadData() {
  client
    .query({
      query: gql`
        query ($authToken: String!, $personID: Int!) {
          person(personID: $personID, authToken: $authToken) {
            personID
            vorname
            nachname
            gebDat {
              german
              input
            }
            geschlecht
            alter(wann: null)
            Notizen
            adressen {
              adressID
              strasse
              plz
              ort
              isOld
              lastUsed {
                german
              }
            }
            emails {
              eMailID
              eMail
              isOld
              lastUsed {
                german
              }
            }
            telefone {
              telefonID
              telefon
              isOld
              lastUsed {
                german
              }
            }
            anmeldungen {
              anmeldeID
              position
              veranstaltung {
                bezeichnung
                begin {
                  german
                }
                ende {
                  german
                }
              }
            }
            fzs {
              fzID
              gesehenAm {
                german
              }
              fzVon {
                german
              }
              kommentar
              gesehenVon {
                personID
                vorname
                nachname
                gebDat {
                  german
                }
              }
            }
            fzAntraege {
              fzAntragID
              erzeugt {
                german
              }
              erzeugt_durch
            }
            # datumDesLetztenFZ {
            #   german
            # }
            # hatFZ(wann: null)
            ecKreis {
              ecKreisID
              bezeichnung
              website
            }
            ecMitglied
            juleica {
              juleicanummer
              gueltig_bis {
                german
                input
              }
            }
            tags {
              tag {
                tagID
                bezeichnung
              }
              notiz
            }
            ak {
              ak {
                akID
                bezeichnung
              }
              currentStatus
              # allUpdates {
              #   akPersonID
              #   date {
              #     german
              #   }
              #   neuerStatus
              # }
            }
            erstellt {
              german
            }
            letzteAenderung {
              german
            }
          }
        }
      `,
      variables: {
        authToken: authToken.value,
        personID: parseInt(route.value.params.id as string)
      },
      fetchPolicy: 'no-cache'
    })
    .then((res: any) => {
      data.value = res.data.person
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

loadData()
loadPersons()
</script>
