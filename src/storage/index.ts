import { useLocalStorage } from 'vue-composable'
import { Ref } from '@vue/composition-api'

export interface Lesezeichen {
  [path: string]: { title: string; subTitle: string; fullPath: string }
}

let data: {
  authToken: Ref<string>
  dark: Ref<boolean>
  username: Ref<string>
  logoutTime: Ref<number>
  lesezeichen: Ref<Lesezeichen>
} = null

export function useStorage() {
  if (data === null) {
    const { storage: authToken } = useLocalStorage('authToken', '', true)
    const { storage: dark } = useLocalStorage('dark', false, true)
    const { storage: username } = useLocalStorage('username', '', true)
    const { storage: logoutTime } = useLocalStorage('logoutTime', -1, true)
    const { storage: lesezeichen } = useLocalStorage(
      'lesezeichenV2',
      {} as Lesezeichen,
      true
    )

    data = {
      authToken,
      dark,
      username,
      logoutTime,
      lesezeichen
    }
  }

  return data
}
