import { useStorage, Lesezeichen } from '../storage'

import { defineUseFunction } from './base'

export const useLesezeichen = defineUseFunction(() => {
  const { lesezeichen } = useStorage()

  function remove(path: string) {
    // Vue 3: native delete statt del() aus @vue/composition-api
    delete lesezeichen.value[path]
  }

  function add(
    path: string,
    item: {
      title: string
      subTitle: string
      fullPath: string
    }
  ) {
    // Vue 3: native Zuweisung statt set() aus @vue/composition-api
    lesezeichen.value[path] = item
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
