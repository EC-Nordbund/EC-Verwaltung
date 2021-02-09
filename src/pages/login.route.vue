<template lang="pug">
v-app(app, :dark='dark')
  v-content
    .ec-alignCenter
      v-card(min-width='300px')
        v-card-title
          h1(v-font, v-primary) Login
          v-spacer
          img(width='80px', src='../icons/ec-logo-512.png')
        v-card-text
          v-form(v-model='valid')
            v-text-field(
              label='Username',
              v-model='data.username',
              required,
              :autofocus='data.username === ""',
              :rules='[(v) => (!!v ? true : "Ein Benutzername muss angegeben werden!")]'
            )
            //- v-tooltip(
            //-   :value='isCapsOn',
            //-   :disabled='!isCapsOn',
            //-   bottom,
            //-   color='info'
            //- )
            v-text-field(
              #activator,
              label='Passwort',
              v-model='data.password',
              required,
              :autofocus='data.username !== ""',
              :color='isCaps && !$route.query.error ? "info" : undefined',
              :append-outer-icon='isCaps ? "keyboard_capslock" : undefined',
              :append-icon='showPasword ? "visibility_off" : "visibility"',
              @click:append='() => (showPasword = !showPasword)',
              :type='showPasword ? "text" : "password"',
              @keyup.enter='logIn',
              :rules='[(v) => (!!v ? true : "Ein Password muss angegeben werden!")]'
            )
              //- span Die Feststelltaste ist aktiviert
        v-card-actions
          v-spacer
          v-btn(
            v-accent-bg,
            v-white,
            :disabled='!valid || loading',
            @click='logIn'
          ) LogIn
</template>
<script lang="ts">
import { defineComponent, computed, ref, onMounted } from '@vue/composition-api'
import { useStorage } from '../storage'
import { useLogin } from '../plugins/auth'
import { useCaps } from '../plugins/caps'
import { useRouter } from '../plugins/router'
import { useDialog } from '../plugins/dialog'

export default defineComponent({
  name: 'Login',
  setup() {
    const password = ref('')
    const { dark, username } = useStorage()
    const { route, router } = useRouter()
    const loading = ref(false)
    const valid = ref(false)
    const showPasword = ref(false)
    const { login, authToken } = useLogin()
    const { error } = useDialog()
    const { isCaps } = useCaps()

    function logIn() {
      loading.value = true
      login(data.value)
        .then(() => {
          loading.value = false
          let path = route.value.query.next || '/home'
          if (route.value.query.next === '/404?prev=%2F') {
            path = 'home'
          }
          router.push(path as string)
          username.value = data.value.username
        })
        .catch((err) => {
          error({
            text: err.message || err,
            title: 'Anmelden fehlgeschlagen!'
          })
          loading.value = false
        })
    }

    function toggleDark() {
      dark.value = !dark.value
    }

    const data = ref({
      username: username.value,
      password: ''
    })

    onMounted(() => {
      if (authToken.value) {
        let path = route.value.query.next || '/home'
        if (route.value.query.next === '/404?prev=%2F') {
          path = 'home'
        }
        router.push(path as string)
      }
    })

    return {
      logIn,
      data,
      toggleDark,
      dark,
      isCaps,
      showPasword,
      valid,
      password,
      loading
    }
  }
})
</script>
