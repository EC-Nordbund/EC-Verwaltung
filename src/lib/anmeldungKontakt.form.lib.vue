<template lang="pug">
v-dialog(v-model='visible', max-width='400px')
  v-card
    v-card-title
      h1(v-font, v-primary) Person abmelden
    v-card-text
      v-form(ref='formRef')
        formular(
          :value='value',
          :save='abmeldenSave',
          :cancel='close',
          :schema=`[
            {
              name: 'adresse',
              type: 'autocomplete',
              label: 'Adresse',
              rule: "required",
              required: true,
              items: myData.adressen.filter(v=>!v.isOld).map((a) => {
                return {
                  text: a.strasse + " | " + a.plz + " " + a.ort,
                  value: a.adressID
                }
              })
            },
            {
              name: 'email',
              type: 'autocomplete',
              label: 'E-Mail',
              rule: "required",
              required: true,
              items: myData.emails.filter(v=>!v.isOld).map((a) => {
                return {
                  text: a.eMail,
                  value: a.eMailID
                }
              })
            },
            {
              name: 'telefon',
              type: 'autocomplete',
              label: 'Telefon',
              rule: "required",
              required: true,
              items: myData.telefone.filter(v=>!v.isOld).map((a) => {
                return {
                  text: a.telefon,
                  value: a.telefonID
                }
              })
            }
          ]`
        )
    v-card-actions
      v-spacer
      v-btn(variant='text', @click='close') Abbrechen
      v-btn(color='primary', @click='abmeldenSave') Speichern
</template>
<script setup lang="ts">
import { ref, watch, useTemplateRef } from 'vue'
import { useApollo } from '../plugins/apollo'
import { useLogin } from '../plugins/auth'
import { useDialog } from '../plugins/dialog'
import { useNotification } from '../plugins/notify'
import { useRouter } from '../plugins/router'
import Formular from '../forms/formular.vue'

const props = defineProps({
  data: { default: () => ({}) }
})

const emit = defineEmits(['reload'])

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()
const { route } = useRouter()

const myData = ref<any>({
  adressen: [],
  emails: [],
  telefone: []
})

const visible = ref(false)
const value = ref<any>({
  adresse: 0,
  email: 0,
  telefon: 0
})

const formRef = useTemplateRef<any>('formRef')

function show() {
  value.value = {
    adresse: (props.data as any).adresse.adressID,
    email: (props.data as any).email.eMailID,
    telefon: (props.data as any).telefon.telefonID
  }
  visible.value = true
}

defineExpose({ show })

function close() {
  visible.value = false
}

watch(
  () => props.data,
  () => {
    client
      .query({
        query: gql`
          query ($authToken: String!, $personID: Int!) {
            person(personID: $personID, authToken: $authToken) {
              adressen {
                adressID
                strasse
                plz
                ort
                lastUsed {
                  german
                }
                isOld
              }
              emails {
                eMailID
                eMail
                lastUsed {
                  german
                }
                isOld
              }
              telefone {
                telefonID
                telefon
                lastUsed {
                  german
                }
                isOld
              }
            }
          }
        `,
        variables: {
          authToken: authToken.value,
          personID: (props.data as any).person.personID
        }
      })
      .then((res) => {
        myData.value = res.data.person
      })
  }
)

async function abmeldenSave() {
  // Vuetify-4-API: validate() ist async und liefert { valid }.
  // Ersetzt das frühere :disabled='!valid' (vee-validate/v-form v-model) —
  // leere Pflichtformulare sind damit nicht mehr speicherbar
  // (dokumentierter Bugfix Nr. 7).
  const { valid } = await formRef.value.validate()
  if (!valid) return
  visible.value = false

  client
    .mutate({
      mutation: gql`
        mutation (
          $authToken: String!
          $anmeldeID: String!
          $adresse: Int!
          $email: Int!
          $telefon: Int!
        ) {
          anmeldungKontakt(
            anmeldeID: $anmeldeID
            authToken: $authToken
            adressID: $adresse
            emailID: $email
            telefonID: $telefon
          )
        }
      `,
      variables: {
        anmeldeID: route.value.params.id,
        authToken: authToken.value,
        ...value.value
      }
    })
    .then(() => {
      createNotification({
        title: 'Erfolgreich editiert',
        body: `Du hast erfolgreich die Kontaktdaten erfolgreich angepasst.`
      })
      emit('reload')
    })
    .catch((err) => {
      error({
        text: err.message,
        title: 'Speichern fehlgeschlagen!'
      })
    })
}
</script>
