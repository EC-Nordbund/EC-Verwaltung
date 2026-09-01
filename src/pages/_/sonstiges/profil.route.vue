<template lang="pug">
ec-wrapper(hasSheet, hasDial, v-bind='config')
  | Content
  template(#dialogs)
    formular-selector(name='changePassword', ref='changePassword')
</template>
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useApollo } from '../../../plugins/apollo'
import { useLogin } from '../../../plugins/auth'
import { useDialog } from '../../../plugins/dialog'
import { useNotification } from '../../../plugins/notify'
import { empty } from '../../../helpers'
import FormularSelector from '../../../forms/wrapper/wrap.vue'

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { createNotification } = useNotification()

const changePasswordDialog =
  useTemplateRef<InstanceType<typeof FormularSelector>>('changePassword')

const config = {
  title: 'Profil',
  sheet: [
    {
      id: 'pwd_change',
      icon: 'vpn_key',
      label: 'Password ändern',
      click: () => {
        changePasswordDialog.value!.show().then(changePassword).catch(empty)
      }
    }
  ]
}

function changePassword(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) {
  client
    .mutate({
      mutation: gql`
        mutation (
          $authToken: String!
          $oldPassword: String!
          $newPassword: String!
        ) {
          passwordWechseln(
            authToken: $authToken
            oldPWD: $oldPassword
            newPWD: $newPassword
          )
        }
      `,
      variables: {
        authToken: authToken.value,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      }
    })
    .then((res: any) => {
      if (res.data.passwordWechseln) {
        createNotification({
          title: 'Passwort erfolgreich geändert',
          body: ''
        })
      } else {
        changePasswordDialog
          .value!.show(data, [
            {
              type: 'alert',
              text: 'Dein aktuelles Passwort ist nicht richtig',
              color: 'error'
            }
          ])
          .then(changePassword)
      }
    })
    .catch((err: any) => {
      error({
        text: err.message,
        title: 'Speichern fehlgeschlagen!'
      })
    })
}
</script>
