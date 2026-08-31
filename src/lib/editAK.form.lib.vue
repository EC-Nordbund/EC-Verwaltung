<template lang="pug">
//- Das frühere Attribut `persistend` (Tippfehler) war wirkungslos und
//- wurde entfernt — der Dialog war nie persistent (Verhalten 1:1).
v-dialog(v-model='visible', max-width='400px')
  v-card
    v-card-title
      h1(v-font, v-primary) {{ type === "add" ? "Neues Mitglied hinzufügen" : "Mitglied bearbeiten" }}
    v-card-text
      v-form(v-model='valid', @submit.prevent='empty')
        formular(
          :value='value',
          :schema=`[
          {
            name: 'personID',
            type: 'autocomplete',
            rule: 'required',
            'prepend-icon': 'person',
            items: (type==='add'?allPersonen:((data.personen||[]).filter(v=>(v.currentStatus>0)).map(v=>v.person))).map(pers=>({value: pers.personID, text: pers.vorname + ' ' + pers.nachname + ' (' + pers.gebDat.german + ')'})),
            label: 'Person'
          },
          {
            name: 'status',
            rule: 'required',
            type: 'select',
            items: stadien.map((besch, id)=>({value: id, text: besch})),
            label: 'Neuer Status'
          },
          {
            name: 'date',
            type: 'date',
            label: 'Datum des Updates',
            rule: 'required',
            required: true
          }
        ]`,
          :save='empty',
          :cancel='empty'
        )
    v-card-actions
      v-spacer
      v-btn(variant='text', @click='visible = false') Abbrechen
      v-btn(color='primary', :disabled='!valid', @click='addPersonSave') Speichern
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useApollo } from '../plugins/apollo'
import { useLogin } from '../plugins/auth'
import { useNotification } from '../plugins/notify'
import { useRouter } from '../plugins/router'
import { useDialog } from '../plugins/dialog'
import { empty } from '../helpers'

defineProps({
  // Array-Default als Factory (Vue-3-Pflicht); effektiv wird immer ein
  // Objekt ({ personen: [...] }) von der AK-Detailseite hereingereicht.
  data: { default: () => [] as any }
})

const emit = defineEmits(['reload'])

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { createNotification } = useNotification()
const { error } = useDialog()
const { route } = useRouter()

const visible = ref(false)
const valid = ref(false)
const value = ref<any>({})
const type = ref<'add' | 'edit' | 'delete' | ''>('')

const allPersonen = ref<any>([])

const stadien = ['Ausgetreten', 'Mitglied', 'Vertreter', 'Leiter']

function edit(editType: 'add' | 'edit' | 'delete') {
  type.value = editType
  value.value = {}

  if (editType === 'delete') {
    value.value = {
      status: 0
    }
  }

  if (editType === 'add' && allPersonen.value) {
    getPersonen()
  }

  visible.value = true
}

function addPersonSave() {
  visible.value = false

  client
    .mutate({
      mutation: gql`
        mutation (
          $personID: Int!
          $akID: Int!
          $date: String!
          $status: Int!
          $authToken: String!
        ) {
          updateAKStatus(
            personID: $personID
            akID: $akID
            date: $date
            status: $status
            authToken: $authToken
          )
        }
      `,
      variables: {
        ...value.value,
        akID: parseInt(route.value.params.id as string),
        authToken: authToken.value
      }
    })
    .then(() => {
      createNotification({
        title: 'Neuer Eintrag im AK',
        body: `Du hast erfolgreich einen neuen Eintrag im AK angelegt`
      })
      emit('reload')
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Speichern fehlgeschlagen!'
      })
    })
}

function getPersonen() {
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
      allPersonen.value = res.data.personen
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Laden fehlgeschlagen!'
      })
    })
}

defineExpose({ edit })
</script>
