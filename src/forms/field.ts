import { computed } from 'vue'
import { compileRules } from './rules'

/**
 * Ersatz für die frühere Basisklasse AbstractField (abstract.ts).
 *
 * Gemeinsames Props-Shape aller formElements: `defineProps(fieldProps)`.
 * `value` ist bewusst NICHT required (anders als früher), weil
 * `value[field.name]` beim ersten Rendern bzw. bei Feldern ohne `name`
 * (alert, label) undefined ist — Vue 3 würde dafür (anders als Vue 2)
 * eine required-Warnung loggen.
 */
export const fieldProps = {
  schema: { type: Object, required: true },
  value: {},
  cancel: { required: true },
  save: { required: true }
} as const

/**
 * useField-Helper für die formElements:
 * - changeValue: emittiert 'input' (formular.vue schreibt damit
 *   `value[field.name] = $event` zurück — Mutations-Pattern wie bisher)
 * - rules: Vuetify-:rules aus schema.rule (Ersatz für v-validate /
 *   data-vv-name / data-vv-as / errors.collect)
 * - bind: der bisherige v-bind="schema"-Spread, aber ohne die DSL-Keys
 *   `on` (wird separat über v-on gebunden) und `mask` (die Prop existiert
 *   in Vuetify 4 nicht mehr — dokumentierter Verlust der Eingabemaske)
 */
export function useField(
  props: { schema: any; value?: any },
  emit: (event: 'input', value: any) => void
) {
  const changeValue = (value: any) => emit('input', value)

  const rules = computed(() =>
    compileRules(props.schema.rule, props.schema.label || props.schema.name)
  )

  const bind = computed(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { on, mask, ...rest } = props.schema
    return rest
  })

  return { changeValue, rules, bind }
}
