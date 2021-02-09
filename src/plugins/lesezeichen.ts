import { useStorage, Lesezeichen } from '../storage'
import { set, del, Ref } from '@vue/composition-api'

import { defineUseFunction } from './base'

export const useLesezeichen = defineUseFunction(() => {
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

  return {
    lesezeichen,
    remove,
    add,
    check
  }
})
