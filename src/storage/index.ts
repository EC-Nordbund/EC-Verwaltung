import { useLocalStorage } from 'vue-composable'

let data = null

export function useStorage() {
  if (data === null) {
    const { storage: authToken } = useLocalStorage('authToken', '', true)
    const { storage: dark } = useLocalStorage('dark', false, true)
    const { storage: username } = useLocalStorage('username', '', true)
    const { storage: logoutTime } = useLocalStorage('logoutTime', -1, true)

    data = {
      authToken,
      dark,
      username,
      logoutTime
    }
  }

  return data
}
