export type Rule = (value: any) => true | string

/**
 * Ersatz für vee-validate 2: übersetzt die Regel-Strings aus den
 * Formular-Definitionen (schema.rule, z. B. 'required|max:50') in
 * Vuetify-:rules-Arrays. Es kommen nur die Regeln required, max:N,
 * min:N, has_upper, has_lower, has_digit und has_special vor
 * (siehe Inventur); unbekannte Regeln validieren zu true.
 * Meldungstexte sinngemäß wie vee-validate/dist/locale/de bzw. wie die
 * früheren Custom-Regeln in forms/main.ts (useValidation).
 */
export function compileRules(rule?: string, label = 'Feld'): Rule[] {
  if (!rule) return []
  return rule.split('|').map((r): Rule => {
    const [name, arg] = r.split(':')
    switch (name) {
      case 'required':
        return (v) =>
          (v !== undefined && v !== null && v !== '') ||
          `${label} ist ein Pflichtfeld.`
      case 'max':
        return (v) =>
          !v ||
          String(v).length <= +arg ||
          `${label} darf nicht länger als ${arg} Zeichen sein.`
      case 'min':
        return (v) =>
          !v ||
          String(v).length >= +arg ||
          `${label} muss mindestens ${arg} Zeichen lang sein.`
      case 'has_upper':
        return (v) => /[A-Z]/.test(v || '') || 'Enthält keine Großbuchstaben'
      case 'has_lower':
        return (v) => /[a-z]/.test(v || '') || 'Enthält keine Kleinbuchstaben'
      case 'has_digit':
        return (v) => /[0-9]/.test(v || '') || 'Enthält keine Ziffer'
      case 'has_special':
        return (v) =>
          /[!@#$%^&*+=._\-?]/.test(v || '') ||
          'Enthält kein Sonderzeichen (!@#$^&*+=._-?)'
      default:
        return () => true
    }
  })
}
