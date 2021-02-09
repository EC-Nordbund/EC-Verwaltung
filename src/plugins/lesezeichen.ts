import { useStorage, Lesezeichen } from '../storage'
import { set, del, Ref } from '@vue/composition-api'

let data: {
  lesezeichen: Ref<Lesezeichen>
  remove: (path: string) => void
  check: (path: string) => boolean
  add: (
    path: string,
    item: { title: string; subTitle: string; fullPath: string }
  ) => void
} = null

export function useLesezeichen() {
  if (!data) {
    const { lesezeichen } = useStorage()

    function remove(path: string) {
      del(lesezeichen.value, path)
    }

    function add(
      path: string,
      item: {
        title: string
        subTitle: string
        fullPath: string
      }
    ) {
      set(lesezeichen.value, path, item)
    }

    function check(path: string): boolean {
      return !!lesezeichen.value[path]
    }

    data = {
      lesezeichen,
      remove,
      add,
      check
    }
  }

  return data
}
