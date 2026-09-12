/**
 * Gemeinsame Anzeige-Logik der Dubletten-Seiten.
 *
 * Hier stehen nur Typen und Darstellungsfragen — die fetch-Aufrufe liegen
 * bewusst direkt in den Seiten (`${API_BASE}/v6/dubletten/...` mit
 * `errorHandler` aus helpers.ts), wie überall sonst im Repo.
 */

export const name = 'dubletten'

export interface DublettenGrund {
  code: string
  text: string
  punkte: number
  feld?: string
}

export interface DublettenPerson {
  personID: number
  vorname: string
  nachname: string
  /** ISO, 'YYYY-MM-DD' */
  gebDat: string
  geschlecht: 'm' | 'w'
  ecKreis: number | null
  emails: string[]
  telefone: string[]
  adresse: string | null
  erstellt: string | null
}

export interface DublettenPaar {
  personID_1: number
  personID_2: number
  score: number
  stufe: 'hoch' | 'mittel' | 'niedrig'
  gruende: DublettenGrund[]
  vorschlagBehalten: number
  begruendungBehalten: string
  person_1: DublettenPerson
  person_2: DublettenPerson
}

interface RegelInfo {
  label: string
  icon: string
  color: string
}

/**
 * Kurzlabel je Regel-Code. Der ausführliche Text kommt vom Server (er kennt die
 * konkreten Werte); hier steht nur, wie der Chip heißt und aussieht.
 */
const REGELN: Record<string, RegelInfo> = {
  'name.exact': { label: 'Name gleich', icon: 'person', color: 'primary' },
  'name.identisch': {
    label: 'zeichengleich',
    icon: 'content_copy',
    color: 'primary'
  },
  'name.swap': {
    label: 'Name vertauscht',
    icon: 'swap_horiz',
    color: 'accent'
  },
  'name.swapFuzzy': {
    label: 'Name vertauscht (ungenau)',
    icon: 'swap_horiz',
    color: 'accent'
  },
  'name.tippfehler': {
    label: 'Tippfehler',
    icon: 'spellcheck',
    color: 'accent'
  },
  'vorname.zweitname': {
    label: 'Zweitname',
    icon: 'person_add',
    color: 'info'
  },
  'vorname.tokenTausch': {
    label: 'Vornamen getauscht',
    icon: 'swap_vert',
    color: 'info'
  },
  'vorname.kurzform': { label: 'Kurzform', icon: 'short_text', color: 'info' },
  'vorname.gleich': { label: 'nur Vorname', icon: 'person', color: 'grey' },
  'nachname.gleich': { label: 'nur Nachname', icon: 'person', color: 'grey' },
  'gebDat.exact': { label: 'GebDat gleich', icon: 'event', color: 'primary' },
  'gebDat.tagMonatTausch': {
    label: 'Tag/Monat getauscht',
    icon: 'event_repeat',
    color: 'accent'
  },
  'gebDat.jahrTippfehler': {
    label: 'Jahr vertippt',
    icon: 'event_repeat',
    color: 'accent'
  },
  'gebDat.jahrZifferndreher': {
    label: 'Zahlendreher Jahr',
    icon: 'event_repeat',
    color: 'accent'
  },
  'gebDat.tagZifferndreher': {
    label: 'Zahlendreher Tag',
    icon: 'event_repeat',
    color: 'accent'
  },
  'gebDat.tagNah': { label: 'Tag ähnlich', icon: 'event', color: 'grey' },
  'gebDat.unklar': {
    label: 'GebDat abweichend',
    icon: 'warning',
    color: 'error'
  },
  'email.gleich': { label: 'gleiche E-Mail', icon: 'mail', color: 'success' },
  'telefon.gleich': {
    label: 'gleiches Telefon',
    icon: 'phone',
    color: 'success'
  },
  'adresse.gleich': { label: 'gleiche Adresse', icon: 'home', color: 'grey' },
  'geschlecht.ungleich': {
    label: 'Geschlecht abweichend',
    icon: 'warning',
    color: 'error'
  }
}

/**
 * Ein unbekannter Code darf die Seite nicht umbringen: kommt serverseitig eine
 * neue Regel dazu, wird sie neutral angezeigt, statt die Liste leer zu lassen.
 */
export function regelInfo(code: string): RegelInfo {
  return REGELN[code] ?? { label: code, icon: 'help_outline', color: 'grey' }
}

/** Farbe der Score-Plakette. Rot heißt „sehr sicher", nicht „Fehler". */
export function scoreColor(stufe: string): string {
  if (stufe === 'hoch') return 'error'
  if (stufe === 'mittel') return 'warning'
  return 'info'
}

export function formatGebDat(iso: string | null | undefined): string {
  if (!iso) return '—'
  return iso.split('-').reverse().join('.')
}

export function formatZeit(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/** Stabiler Schlüssel eines Paares, unabhängig von der Reihenfolge. */
export function paarKey(a: number, b: number): string {
  return `${Math.min(a, b)}:${Math.max(a, b)}`
}

export function personName(p: DublettenPerson): string {
  return `${p.vorname} ${p.nachname}`
}
