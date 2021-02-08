import { ref, Ref } from '@vue/composition-api'

let data: Ref<boolean> | null = null

export function useCaps() {
  if (!data) {
    data = ref(false)

    window.addEventListener('keydown', (ev: KeyboardEvent) => {
      const key = ev.key
      if (key.length === 1) {
        data.value =
          key.toUpperCase() === key && key.toLowerCase() !== key && !ev.shiftKey
      } else {
        if (key === 'CapsLock') {
          data.value = !data.value
        }
      }
    })
  }

  return { isCaps: data! }
}
