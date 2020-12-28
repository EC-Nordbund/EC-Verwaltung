import { ApolloClient } from '@apollo/client/core'
import filterUtil from '@/util/filter.util'
import iconUtil from '@/util/icon.util'
import lesezeichenUtil from '@/util/lesezeichen.util'
declare module 'vue/types/vue' {
  interface Vue {
    $authToken: () => string
    $apolloClient: ApolloClient<any>
    $login: (username: string, password: string) => Promise<never>
    $util: {
      filter: typeof filterUtil
      icon: typeof iconUtil
      lesezeichen: typeof lesezeichenUtil
    }
    $setAuthToken: (authToken: string) => void
    $notifikation: (title: string, body: string) => Notification
    $setInactiveHandler: (cb: () => void) => void
    $empty: () => void
    $ecForm: any
    $logoutIn: () => Promise<number>
    $logout: () => void
  }
}
