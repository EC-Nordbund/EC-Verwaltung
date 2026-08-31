import type { App } from 'vue'
import formular from './formular.vue'
import dialog from './wrapper/wrapperDialog.vue'
import anmeldung from './wrapper/anmeldung.vue'
import selector from './wrapper/wrap.vue'

/**
 * Registriert die Formular-Komponenten global (Nutzung in den Seiten als
 * formular / formular-dialog / formular-selector). Die einzelnen
 * formElements werden nicht mehr global registriert — formular.vue löst
 * sie über eine explizite Komponenten-Map auf. Die globale
 * Formular-Registrierung wird weiterhin gebraucht, weil stepper.vue und
 * die Wrapper `formular` rekursiv referenzieren.
 *
 * useValidation (vee-validate 2) ist ersatzlos entfallen — die Regeln
 * kommen jetzt aus src/forms/rules.ts (compileRules → Vuetify-:rules).
 */
export function useForm(app: App) {
  app.component('Formular', formular)
  app.component('FormularDialog', dialog)
  app.component('EcFormAnmeldung', anmeldung)
  app.component('FormularSelector', selector)
}
