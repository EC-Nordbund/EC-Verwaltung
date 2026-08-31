<template lang="pug">
v-dialog(v-model='visible', max-width='400px')
  v-card
    v-card-title
      h1(v-font, v-primary) Adresse Mergen
    v-card-text
      v-form(ref='formRef')
        formular(
          :value='value',
          :save='abmeldenSave',
          :cancel='close',
          :schema=`[
            {
              name: 'richtig',
              type: 'autocomplete',
              label: 'Richtige Adresse',
              rule: "required",
              required: true,
              items: data.adressen.filter(v=>!v.isOld).filter(v=>v.adressID!==falsch).map((a) => {
                return {
                  text: a.strasse + " | " + a.plz + " " + a.ort,
                  value: a.adressID
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
import { ref, useTemplateRef } from 'vue'
import { useApollo } from '../plugins/apollo'
import { useLogin } from '../plugins/auth'
import { useDialog } from '../plugins/dialog'
import { useNotification } from '../plugins/notify'
import Formular from '../forms/formular.vue'

defineProps({
  data: { default: () => ({}) }
})

const emit = defineEmits(['reload'])

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()

const falsch = ref(0)
const visible = ref(false)
const value = ref<any>({})

const formRef = useTemplateRef<any>('formRef')

function show(falschID: number) {
  value.value = {}
  visible.value = true
  falsch.value = falschID
}

defineExpose({ show })

function close() {
  visible.value = false
}

async function abmeldenSave() {
  // Vuetify-4-API: validate() ist async und liefert { valid }.
  // Ersetzt das frühere :disabled='!valid' — verhindert auch den Alt-Bug,
  // dass bei leerem `value` die Variable $richtig fehlte und die Mutation
  // mit GraphQL-Fehler scheiterte (dokumentierter Bugfix Nr. 7).
  const { valid } = await formRef.value.validate()
  if (!valid) return
  visible.value = false

  client
    .mutate({
      mutation: gql`
        mutation ($authToken: String!, $richtig: Int!, $falsch: Int!) {
          mergeAdresse(
            authToken: $authToken
            adressID_richtig: $richtig
            adressID_falsch: $falsch
          )
        }
      `,
      variables: {
        authToken: authToken.value,
        ...value.value,
        falsch: falsch.value
      }
    })
    .then(() => {
      createNotification({
        title: 'Erfolgreich Gemergt',
        body: `Du hast erfolgreich die Kontaktdaten erfolgreich zusammengeführt.`
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
