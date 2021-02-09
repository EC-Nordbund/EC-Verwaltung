import Vue from 'vue'
import VueRouter from 'vue-router'
import { useApollo } from '../plugins/apollo'

import { useStorage } from '../storage/index'
import { errorHandler } from '../helpers'

import { useNow } from 'vue-composable'
import { createApp, computed, Ref, ComputedRef } from '@vue/composition-api'

const time = 12 * 60 * 60 * 1e3

let data = null

export function useLogin(): {
  login: (data: { username: string; password: string }) => Promise<void>
  authToken: Ref<string>
  logout: () => void
  extendLogin: (pwd: string) => Promise<void>
  logoutIn: ComputedRef<number>
} {
  console.log('useLogin')
  if (data === null) {
    console.log('useLogin - init')
    const { authToken, logoutTime, username } = useStorage()
    const { now } = useNow()
    const { client, gql } = useApollo()

    Vue.prototype.$authToken = () => {
      return authToken.value
    }

    const logoutIn = computed(() => logoutTime.value - now.value)

    async function login({
      username,
      password
    }: {
      username: string
      password: string
    }) {
      const data = await fetch('https://api.ec-nordbund.de/v6/login', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          version: '3.2.0',
          username,
          password
        })
      })
        .then(errorHandler)
        .then((res) => res.json())

      authToken.value = data.authToken
      logoutTime.value = now.value + time
    }

    function logout() {
      authToken.value = ''
      logoutTime.value = -1
    }

    async function extendLogin(password: string) {
      await login({
        username: username.value,
        password
      })
    }

    if (!authToken.value) {
      logoutTime.value = -1
    }

    if (logoutTime.value > now.value + 15 * 60000) {
      client
        .query({
          query: gql`
            query($authToken: String!) {
              person(personID: 0, authToken: $authToken) {
                personID
              }
            }
          `,
          variables: {
            authToken: authToken.value
          }
        })
        .catch(() => {
          authToken.value = ''
          logoutTime.value = -1
        })
    }

    data = {
      login,
      authToken,
      logout,
      extendLogin,
      logoutIn
    }
  }

  return data
}
