<template lang="pug">
v-card-text(style='overflow: auto')
  //- Bugfix (dokumentiert): war auskommentiert, der Merge-Button warf
  //- deshalb einen Laufzeitfehler — jetzt wieder eingehängt.
  ec-adresse-merge(
    ref='mergeAdresseDialog',
    :data='data',
    @reload='emit("reload")'
  )
  v-list(lines='two')
    v-list-item(@click='() => {}')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.personID }}
      v-list-item-subtitle PersonID
    v-list-item(@click='() => {}')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.vorname }} {{ data.nachname }}
      v-list-item-subtitle {{ data.gebDat.german }}
    v-list-item(@click='() => {}')
      template(#prepend)
        v-icon person
      v-list-item-title {{ data.alter }}
      v-list-item-subtitle Aktuelles Alter
    v-divider
    v-list-item(
      v-for='adresse in data.adressen',
      :key='adresse.adressID',
      :class='adresse.isOld ? "isOld" : ""',
      @click='showAdresse(adresse)'
    )
      template(#prepend)
        v-icon home
      v-list-item-title {{ adresse.strasse }}
      v-list-item-subtitle {{ adresse.plz }} {{ adresse.ort }} | Letzte Nutzung: {{ adresse.lastUsed.german }}
      template(#append)
        v-btn(
          icon,
          @click='$event.stopPropagation(); mergeAdresse(adresse.adressID)'
        )
          v-icon merge_type
        v-btn(
          icon,
          @click='$event.stopPropagation(); deleteAdresse(adresse.adressID)'
        )
          v-icon delete
        v-btn(
          icon,
          @click='$event.stopPropagation(); useAdresse(adresse.adressID)'
        )
          v-icon mouse
        v-btn(
          icon,
          @click='$event.stopPropagation(); copy(`${adresse.strasse}\n${adresse.plz} ${adresse.ort}`)'
        )
          v-icon file_copy
    v-divider
    v-list-item(
      v-for='email in data.emails',
      :key='email.eMailID',
      :class='email.isOld ? "isOld" : ""',
      @click='location.href = "mailto:" + email.eMail'
    )
      template(#prepend)
        v-icon mail
      v-list-item-title {{ email.eMail }}
      v-list-item-subtitle E-Mail  | Letzte Nutzung: {{ email.lastUsed.german }}
      template(#append)
        v-btn(
          icon,
          @click='$event.stopPropagation(); deleteEmail(email.eMailID)'
        )
          v-icon delete
        v-btn(icon, @click='$event.stopPropagation(); useEmail(email.eMailID)')
          v-icon mouse
        v-btn(icon, @click='$event.stopPropagation(); copy(email.eMail)')
          v-icon file_copy
    v-divider
    v-list-item(
      v-for='telefon in data.telefone',
      :key='telefon.telefonID',
      :class='telefon.isOld ? "isOld" : ""',
      @click='location.href = "tel:" + telefon.telefon'
    )
      template(#prepend)
        v-icon phone
      v-list-item-title {{ telefonFormater(telefon.telefon) }}
      v-list-item-subtitle Telefon | Letzte Nutzung: {{ telefon.lastUsed.german }}
      template(#append)
        v-btn(
          icon,
          @click='$event.stopPropagation(); deleteTelefon(telefon.telefonID)'
        )
          v-icon delete
        v-btn(
          icon,
          @click='$event.stopPropagation(); useTelefon(telefon.telefonID)'
        )
          v-icon mouse
        v-btn(icon, @click='$event.stopPropagation(); copy(telefon.telefon)')
          v-icon file_copy
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useApollo } from '../../../../../plugins/apollo'
import { useLogin } from '../../../../../plugins/auth'
import { useDialog } from '../../../../../plugins/dialog'
import { useNotification } from '../../../../../plugins/notify'
import { telefonFormater } from '../../../../../plugins/telefonFilter'

defineProps<{ data?: any }>()

const emit = defineEmits(['reload'])

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()

const location = window.location

const copy = (text: string) => navigator.clipboard.writeText(text)

// ec-adresse-merge ist global registriert (lib/import.ts) und stellt
// show(falsch) per defineExpose bereit.
const mergeAdresseDialog = useTemplateRef<any>('mergeAdresseDialog')

function showAdresse(adresse: any) {
  alert('Hier kommt noch eine Karte hin.')
}

function mergeAdresse(adressID: number) {
  mergeAdresseDialog.value.show(adressID)
}

function deleteAdresse(adressID: number) {
  client
    .mutate({
      mutation: gql`
        mutation ($adressID: Int!, $authToken: String!) {
          markAdressAsOld(adressID: $adressID, authToken: $authToken)
        }
      `,
      variables: {
        authToken: authToken.value,
        adressID
      }
    })
    .then(() => {
      createNotification({
        title: 'Als Alt makiert',
        body: `Erfolgreich als veraltet makiert`
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

function deleteEmail(emailID: number) {
  client
    .mutate({
      mutation: gql`
        mutation ($emailID: Int!, $authToken: String!) {
          markEmailAsOld(emailID: $emailID, authToken: $authToken)
        }
      `,
      variables: {
        authToken: authToken.value,
        emailID
      }
    })
    .then(() => {
      createNotification({
        title: 'Als Alt makiert',
        body: `Erfolgreich als veraltet makiert`
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

function deleteTelefon(telefonID: number) {
  client
    .mutate({
      mutation: gql`
        mutation ($telefonID: Int!, $authToken: String!) {
          markTelefonAsOld(telefonID: $telefonID, authToken: $authToken)
        }
      `,
      variables: {
        authToken: authToken.value,
        telefonID
      }
    })
    .then(() => {
      createNotification({
        title: 'Als Alt makiert',
        body: `Erfolgreich als veraltet makiert`
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

function useAdresse(adressID: number) {
  client
    .mutate({
      mutation: gql`
        mutation ($adressID: Int!, $authToken: String!) {
          useAdresse(adressID: $adressID, authToken: $authToken)
        }
      `,
      variables: {
        authToken: authToken.value,
        adressID
      }
    })
    .then(() => {
      createNotification({
        title: 'Als Aktuell Makiert',
        body: `Erfolgreich als aktuell makiert`
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

function useEmail(emailID: number) {
  client
    .mutate({
      mutation: gql`
        mutation ($emailID: Int!, $authToken: String!) {
          useEmail(emailID: $emailID, authToken: $authToken)
        }
      `,
      variables: {
        authToken: authToken.value,
        emailID
      }
    })
    .then(() => {
      createNotification({
        title: 'Als Aktuell Makiert',
        body: `Erfolgreich als aktuell makiert`
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

function useTelefon(telefonID: number) {
  client
    .mutate({
      mutation: gql`
        mutation ($telefonID: Int!, $authToken: String!) {
          useTelefon(telefonID: $telefonID, authToken: $authToken)
        }
      `,
      variables: {
        authToken: authToken.value,
        telefonID
      }
    })
    .then(() => {
      createNotification({
        title: 'Als Aktuell Makiert',
        body: `Erfolgreich als aktuell makiert`
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
</script>
