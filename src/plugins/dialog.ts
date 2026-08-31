import { reactive } from 'vue'

/**
 * Ersatz für vuetify-dialog (Vue-2-only). Es wurde nur
 * $dialog.error({text,title}) und $dialog.notify.info(text) genutzt.
 * Der Modul-Singleton-State wird von EcDialogHost
 * (src/lib/dialogHost.lib.vue) gerendert — eingebunden in den Layouts
 * (pages/_.route.vue und pages/login.route.vue) innerhalb von v-app.
 */
export const dialogState = reactive({
  error: null as null | { text: string; title: string },
  snackbar: '',
  // Zähler, damit wiederholte notifyInfo-Aufrufe (auch mit gleichem Text)
  // die Snackbar samt Timeout neu starten (Alt-Verhalten: ein Toast pro Aufruf)
  snackbarKey: 0
})

export function useDialog() {
  return {
    error({ text, title }: { text: string; title: string }) {
      dialogState.error = { text, title }
    },
    notifyInfo(text: string) {
      dialogState.snackbar = text
      dialogState.snackbarKey++
    }
  }
}
