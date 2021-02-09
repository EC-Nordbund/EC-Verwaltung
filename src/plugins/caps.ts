import { ref } from '@vue/composition-api'
import { defineUseFunction } from './base'

export const useCaps = defineUseFunction(() => {
  const isCaps = ref(false)

  window.addEventListener('keydown', (ev: KeyboardEvent) => {
    const key = ev.key
    if (key.length === 1) {
      isCaps.value =
        key.toUpperCase() === key && key.toLowerCase() !== key && !ev.shiftKey
    } else {
      if (key === 'CapsLock') {
        isCaps.value = !isCaps.value
      }
    }
  })

  return {
    isCaps
  }
})
