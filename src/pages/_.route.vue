<template lang="pug">
v-app
  v-app-bar(color='primary')
    v-app-bar-nav-icon(v-white, @click='drawer = !drawer')
    //- v-btn(v-white icon @click="router.back()")
    //-   v-icon undo
    //- v-btn(v-white icon @click="router.forward()")
    //-   v-icon redo
    v-spacer
    v-avatar(size='60px', style='margin-right: 10px', color='transparent')
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

  v-navigation-drawer(v-model='drawer')
    v-toolbar(flat, color='transparent')
      v-list
        v-list-item(to='/sonstiges/profil')
          template(#prepend)
            v-avatar
              div(
                style='border-radius: 50%; width: 40px; height: 40px; padding: 8px 0',
                v-primary-bg,
                v-black
              )
                | {{ data.person.vorname[0] }}{{ data.person.nachname[0] }}
              //- img(src="https://randomuser.me/api/portraits/men/85.jpg")
          v-list-item-title {{ data.person.vorname }} {{ data.person.nachname }} ({{ data.ablaufDatum.german }})
    v-list
      v-list-item(to='/home')
        template(#prepend)
          v-icon home
        v-list-item-title Home
      v-divider
      v-list-subheader Personen
      v-list-item(to='/personen')
        template(#prepend)
          v-icon person
        v-list-item-title Personen
      v-list-item(to='/ak')
        template(#prepend)
          v-icon group
        v-list-item-title Arbeitskreise
      v-divider
      v-list-subheader Veranstaltungen
      v-list-item(to='/anmeldungen')
        template(#prepend)
          v-icon assignment_ind
        v-list-item-title Anmeldungen
      v-list-item(to='/veranstaltungen')
        template(#prepend)
          v-icon event
        v-list-item-title Veranstaltungen
      v-list-item(to='/veranstaltungsort')
        template(#prepend)
          v-icon home
        v-list-item-title Veranstaltungsorte
      v-list-item(to='/organisationen')
        template(#prepend)
          v-icon library_books
        v-list-item-title Organisationen
      v-divider
      v-list-subheader Dublikate
      v-list-item(to='/dublikate/personen')
        template(#prepend)
          v-icon person
        v-list-item-title Personen
      v-list-item(to='/dublikate/adressen')
        template(#prepend)
          v-icon home
        v-list-item-title Adressen
      v-divider
      v-list-subheader Sonstiges
      v-list-item(to='/sonstiges/admin')
        template(#prepend)
          v-icon settings
        v-list-item-title Administration
      v-list-item(to='/sonstiges/datenschutz')
        template(#prepend)
          v-icon security
        v-list-item-title Datenschutz
      //- v-list-item(to="/sonstiges/impressum")
      //-   template(#prepend)
      //-     v-icon menu
      //-   v-list-item-title Impressum

  v-main
    router-view(v-slot='{ Component }')
      component(
        :is='Component',
        :key='route.path',
        style='margin: 5px; width: calc(100% - 10px)'
      )

  v-footer(app, style='padding: 0 10px', color='secondary')
    v-breadcrumbs(:items='routeBread')
      template(#divider)
        v-icon(v-white) keyboard_arrow_right
      template(#item='{ item }')
        span.disabled(v-white) {{ item.title }}
    v-spacer
    span(v-white) Version: {{ version }}
    v-spacer
    v-breadcrumbs(:items='breadcrumbs')
      template(#divider)
        v-icon(v-white) keyboard_arrow_right
      template(#item='{ item }')
        span.disabled(v-white) {{ item.title }}
  v-dialog(v-model='loginDialog', width='350px')
    v-card
      v-card-title
        h1(v-font) Anmeldung verlängern
      v-card-text
        v-form(v-model='valid')
          v-tooltip(
            :model-value='isCaps',
            :disabled='!isCaps',
            location='bottom',
            color='info'
          )
            template(#activator='{ props: tooltipProps }')
              v-text-field(
                v-bind='tooltipProps',
                label='Passwort',
                v-model='password',
                required,
                :autofocus='data.username !== ""',
                :color='isCaps && !route.query.error ? "info" : undefined',
                :append-icon='isCaps ? "keyboard_capslock" : undefined',
                :append-inner-icon='showPasword ? "visibility_off" : "visibility"',
                @click:append-inner='() => (showPasword = !showPasword)',
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
  ec-dialog-host
</template>
<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import { version } from '../../package.json'
import { useStorage } from '../storage'
import { useLogin } from '../plugins/auth'
import { useCaps } from '../plugins/caps'
import { useApollo } from '../plugins/apollo'
import { useRouter } from '../plugins/router'
import { useDialog } from '../plugins/dialog'

const { router, route } = useRouter()

function breadMap(arr: string[]) {
  return arr.map((el) => ({ title: el, disabled: true }))
}

const breadcrumbs = breadMap([
  `© 2017 - ${new Date().getFullYear()}`,
  'EC-Nordbund',
  'T. Krause + S. Krüger'
])

const password = ref('')
const drawer = ref<boolean | null>(null)

const { dark } = useStorage()
const loginDialog = ref(false)
const loading = ref(false)
const alive = ref(-1)

let timer: null | ReturnType<typeof setInterval> = null
const valid = ref(false)
const showPasword = ref(false)

const { logout, extendLogin, authToken, logoutIn } = useLogin()

const { client, gql } = useApollo()
const { error } = useDialog()
const { isCaps } = useCaps()

// Dark-Toggle: localStorage-Ref 'dark' steuert das globale Vuetify-Theme
const theme = useTheme()
watch(
  dark,
  (v) => {
    theme.global.name.value = v ? 'dark' : 'light'
  },
  { immediate: true }
)

const routeBread = computed(() =>
  breadMap(
    route.value.path
      .split('/')
      .slice(1)
      // leere Segmente (Pfad '/') abfangen, sonst wirft v[0].toUpperCase()
      .filter((v) => v.length > 0)
      .map((v) => v[0].toUpperCase() + v.slice(1))
  )
)

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
      error({
        text: err.message || err,
        title: 'Anmelden fehlgeschlagen!'
      })
      loginDialog.value = false
    })
}

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

// bewusst lax typisiert: Initial-Dummy vs. getMyUserData-Shape (wie bisher)
const data = ref<any>({
  person: { vorname: {}, nachname: {} },
  ablaufDatum: {}
})

onMounted(() => {
  if (!authToken.value) {
    router.push({
      path: '/login',
      query: { next: route.value.fullPath }
    })
  } else {
    client
      .query({
        query: gql`
          query ($authToken: String!) {
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
      .catch(() => {
        // Token ist ungültig (z. B. Altlast im localStorage) -> zurück zum Login
        logout()
        router.push({
          path: '/login',
          query: { next: route.value.fullPath }
        })
      })
    timer = setInterval(updateAlive, 30 * 1000)
    updateAlive()
  }
})
</script>
