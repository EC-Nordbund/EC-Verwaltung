import { useLocalStorage } from '@vueuse/core'
import type { Ref } from 'vue'

export interface Lesezeichen {
  [path: string]: { title: string; subTitle: string; fullPath: string }
}

// @vueuse/core useLocalStorage serialisiert wie vue-composable früher:
// Strings roh, boolean/number/Objekte als JSON — bestehende Werte unter
// denselben Keys bleiben lesbar. Cross-Tab-Sync (früher drittes Argument
// `true`) ist bei @vueuse Default.
let data: {
  authToken: Ref<string>
  dark: Ref<boolean>
  username: Ref<string>
  logoutTime: Ref<number>
  lesezeichen: Ref<Lesezeichen>
} = null

export function useStorage() {
  if (data === null) {
    data = {
      authToken: useLocalStorage('authToken', ''),
      dark: useLocalStorage('dark', false),
      username: useLocalStorage('username', ''),
      logoutTime: useLocalStorage('logoutTime', -1),
      lesezeichen: useLocalStorage('lesezeichenV2', {} as Lesezeichen)
    }
  }

  return data
}
