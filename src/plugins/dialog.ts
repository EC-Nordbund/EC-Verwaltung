import VuetifyDialog from 'vuetify-dialog'

import { createApp, getCurrentInstance } from '@vue/composition-api'

export function installDialog(app: ReturnType<typeof createApp>) {
  app.use(VuetifyDialog)
}

export function useDialog() {
  const vm = getCurrentInstance()

  return vm.proxy.$dialog
}
