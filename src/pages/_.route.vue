<template lang="pug">
v-app(app, :dark='dark')
  v-toolbar(fixed, app, clipped-left, color='primary')
    v-toolbar-side-icon(v-white, @click='drawer = !drawer')
    //- v-btn(v-white icon @click="$router.back()")
    //-   v-icon undo
    //- v-btn(v-white icon @click="$router.forward()")
    //-   v-icon redo
    v-spacer
    v-avatar(size='60px', style='margin-right: 10px')
      img(src='../assets/ec-logo-without-bg-64.png')
    span(
      v-white,
      v-font,
      style='font-size: 26px; padding-top: 5px; margin-right: 8px'
    ) Nordbund – Verwaltung
    v-spacer
    ec-lesezeichen-show
    div(style='padding-right: 20px') 
    //- v-btn(icon, v-white, @click='subscribe')
    //-   v-icon add_alert
    v-btn(icon, v-white, @click='toggleDark')
      v-icon invert_colors
    v-btn(icon, v-white, @click='loginDialog = true')
      span {{ alive }} min
    //- v-btn(icon v-white @click="logout")
    //-   v-icon exit_to_app

  v-navigation-drawer(clipped, app, v-model='drawer')
    v-toolbar.transparent(flat)
      v-list
        v-list-tile(avatar, to='/sonstiges/profil')
          v-list-tile-avatar
            div(
              style='border-radius: 50%; width: 40px; height: 40px; padding: 8px 0',
              v-primary-bg,
              v-black
            )
              | {{ data.person.vorname[0] }}{{ data.person.nachname[0] }}
            //- img(src="https://randomuser.me/api/portraits/men/85.jpg")
          v-list-tile-content
            v-list-tile-title {{ data.person.vorname }} {{ data.person.nachname }} ({{ data.ablaufDatum.german }})
    v-list
      v-list-tile(to='/home')
        v-list-tile-action
          v-icon home
        v-list-tile-title Home
      v-divider
      v-subheader Personen
      v-list-tile(to='/personen')
        v-list-tile-action
          v-icon person
        v-list-tile-title Personen
      v-list-tile(to='/ak')
        v-list-tile-action
          v-icon group
        v-list-tile-title Arbeitskreise
      v-divider
      v-subheader Veranstaltungen
      v-list-tile(to='/anmeldungen')
        v-list-tile-action
          v-icon assignment_ind
        v-list-tile-title Anmeldungen
      v-list-tile(to='/veranstaltungen')
        v-list-tile-action
          v-icon event
        v-list-tile-title Veranstaltungen
      v-list-tile(to='/veranstaltungsort')
        v-list-tile-action
          v-icon home
        v-list-tile-title Veranstaltungsorte
      v-list-tile(to='/organisationen')
        v-list-tile-action
          v-icon library_books
        v-list-tile-title Organisationen
      v-divider
      v-subheader Dublikate
      v-list-tile(to='/dublikate/personen')
        v-list-tile-action
          v-icon person
        v-list-tile-title Personen
      v-list-tile(to='/dublikate/adressen')
        v-list-tile-action
          v-icon home
        v-list-tile-title Adressen
      v-divider
      v-subheader Sonstiges
      v-list-tile(to='/sonstiges/admin')
        v-list-tile-action
          v-icon settings
        v-list-tile-title Administration
      v-list-tile(to='/sonstiges/datenschutz')
        v-list-tile-action
          v-icon security
        v-list-tile-title Datenschutz
      //- v-list-tile(to="/sonstiges/impressum")
      //-   v-list-tile-action
      //-     v-icon menu
      //-   v-list-tile-title Impressum

  v-content
    router-view(
      :key='$route.path',
      style='margin: 5px; width: calc(100% - 10px)'
    )

  v-footer(app, style='padding: 0 10px', fixed, color='secondary')
    v-breadcrumbs(:items='route')
      v-icon(slot='divider', v-white) keyboard_arrow_right
      template(slot='item', slot-scope='props')
        span.disabled(v-white) {{ props.item.text }}
    v-spacer
    span(v-white) Version: {{ version }}
    v-spacer
    v-breadcrumbs(:items='breadcrumbs')
      v-icon(slot='divider', v-white) keyboard_arrow_right
      template(slot='item', slot-scope='props')
        span.disabled(v-white) {{ props.item.text }}
  v-dialog(v-model='loginDialog', width='350px')
    v-card
      v-card-title
        h1(v-font) Anmeldung verlängern
      v-card-text
        v-form(v-model='valid')
          v-tooltip(:value='isCaps', :disabled='!isCaps', bottom, color='info')
            v-text-field(
              slot='activator',
              label='Passwort',
              v-model='password',
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
            span Die Feststelltaste ist aktiviert
      v-card-actions
        v-spacer
        v-btn(
          v-accent-bg,
          v-white,
          :disabled='!valid || loading',
          @click='logIn'
        ) Verlängern
        v-btn(v-accent-bg, v-white, @click='logout') Abmelden
</template>
<script lang="ts">
import pack from '../plugins/package'

import {
  defineComponent,
  computed,
  ref,
  onMounted,
  onUnmounted
} from '@vue/composition-api'
import { useStorage } from '../storage'
import { useLogin } from '../plugins/auth'
import { useCaps } from '../plugins/caps'
import { useApollo } from '../plugins/apollo'

export default defineComponent({
  name: 'Root',
  setup(_, ctx) {
    function breadMap(arr: string[]) {
      return arr.map((el) => ({ text: el, disabled: true }))
    }

    const route = computed(() =>
      breadMap(
        ctx.root.$route.path
          .split('/')
          .slice(1)
          .map((v) => v[0].toUpperCase() + v.slice(1))
      )
    )

    const breadcrumbs = breadMap([
      `© 2017 - ${new Date().getFullYear()}`,
      'EC-Nordbund',
      'T. Krause + S. Krüger'
    ])

    const version = pack.version || 'Fehler'
    const password = ref('')
    const drawer = ref(null)

    const { dark } = useStorage()
    const loginDialog = ref(false)
    const loading = ref(false)
    const alive = ref(-1)

    let timer: null | number = null
    const valid = ref(false)
    const showPasword = ref(false)

    const { logout, extendLogin, authToken, logoutIn } = useLogin()

    const { client, gql } = useApollo()

    function logIn() {
      loading.value = true
      extendLogin(password.value)
        .then(() => {
          loading.value = false
          password.value = ''
          updateAlive()
          loginDialog.value = false
        })
        .catch((err) => {
          ctx.root.$dialog.error({
            text: err.message || err,
            title: 'Anmelden fehlgeschlagen!'
          })
          loginDialog.value = false
        })
    }

    const { isCaps } = useCaps()

    function toggleDark() {
      dark.value = !dark.value
    }

    function updateAlive() {
      const num = logoutIn.value

      const mins = Math.trunc(num / 1000 / 60)

      alive.value = mins

      if (alive.value < 15) {
        loginDialog.value = true
      }
    }

    onUnmounted(() => {
      if (!timer) {
        return
      }
      clearInterval(timer)
    })

    const data = ref({
      person: { vorname: {}, nachname: {} },
      ablaufDatum: {}
    })

    onMounted(() => {
      if (!authToken.value) {
        ctx.root.$router.push({
          path: '/login',
          query: { next: ctx.root.$route.fullPath }
        })
      } else {
        client
          .query({
            query: gql`
              query($authToken: String!) {
                getMyUserData(authToken: $authToken) {
                  userName
                  person {
                    vorname
                    nachname
                  }
                  ablaufDatum {
                    german
                  }
                }
              }
            `,
            variables: {
              authToken: authToken.value
            }
          })
          .then((res) => {
            data.value = res.data.getMyUserData
          })
        timer = setInterval(updateAlive, 30 * 1000)
        updateAlive()
      }
    })

    return {
      logIn,
      data,
      toggleDark,
      dark,
      isCaps,
      logout,
      alive,
      showPasword,
      valid,
      loginDialog,
      drawer,
      password,
      version,
      breadcrumbs,
      route,
      loading
    }
  }
})
</script>
