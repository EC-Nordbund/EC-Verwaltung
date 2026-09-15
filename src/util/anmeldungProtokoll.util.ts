/**
 * Gemeinsame Anzeige-Logik des Anmeldungs-Protokolls.
 *
 * Genutzt von der Protokoll-Ansicht einer einzelnen Anmeldung
 * (pages/_/anmeldungen/_id/_/protokoll) und der einer ganzen Freizeit
 * (pages/_/veranstaltungen/_id/_/protokoll) — die zweite ist die einzige
 * Stelle, an der eine gelöschte Anmeldung noch auftaucht.
 *
 * Hier stehen nur Typen und Darstellungsfragen; die fetch-Aufrufe liegen wie
 * überall im Repo direkt in den Seiten.
 */

/** Die Felder, die das Protokoll festhält (siehe API src/anmeldung/protokoll.ts). */
export interface Zustand {
  wartelistenPlatz?: number
  position?: number
  abmeldeZeitpunkt?: string | null
  abmeldeGebuehr?: number
  wegDerAbmeldung?: string
  kommentarAbmeldung?: string
  bisherBezahlt?: number
  rueckbezahlt?: number
}

export interface ProtokollEintrag {
  protokollID: number
  /** ISO-Zeitstempel */
  ts: string
  anmeldeID: string
  personID: number
  veranstaltungsID: number
  aktion: string
  begruendung: string
  vorher: Zustand
  nachher: Zustand
  benutzer: string
  person: string
}

interface AktionInfo {
  label: string
  icon: string
  color: string
}

const AKTIONEN: Record<string, AktionInfo> = {
  abmelden: {
    label: 'Abgemeldet',
    icon: 'person_add_disabled',
    color: 'warning'
  },
  ruecknahme: {
    label: 'Abmeldung zurückgenommen',
    icon: 'undo',
    color: 'success'
  },
  loeschen: {
    label: 'Anmeldung gelöscht',
    icon: 'delete_forever',
    color: 'error'
  }
}

export function aktionInfo(aktion: string): AktionInfo {
  return (
    AKTIONEN[aktion] ?? { label: aktion, icon: 'help_outline', color: 'grey' }
  )
}

export const rollen = [
  'Teilnehmer',
  'Mitarbeiter',
  'Küchenmitarbeiter',
  'Küchenleitung',
  'Leitung',
  'Hauptleitung'
]

/** Aus dem Wartelistenplatz wird im Protokoll der lesbare Status. */
export function statusText(platz: number | undefined): string {
  if (platz === undefined) return '—'
  if (platz < 0) return 'abgemeldet'
  if (platz === 0) return 'angemeldet'
  return `Warteliste, Platz ${platz}`
}

function euro(betrag: number | undefined): string {
  if (betrag === undefined) return '—'
  return `${betrag.toFixed(2).replace('.', ',')} €`
}

function zeitpunkt(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return String(iso)
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Zeitstempel eines Protokolleintrags, wie er in der Liste steht. */
export const eintragZeit = zeitpunkt

type Feld = {
  key: keyof Zustand
  label: string
  format: (wert: any) => string
}

const FELDER: Feld[] = [
  { key: 'wartelistenPlatz', label: 'Status', format: statusText },
  {
    key: 'position',
    label: 'Rolle',
    format: (v: number) => rollen[v - 1] ?? String(v ?? '—')
  },
  { key: 'abmeldeZeitpunkt', label: 'Abmeldezeitpunkt', format: zeitpunkt },
  { key: 'abmeldeGebuehr', label: 'Abmeldegebühr', format: euro },
  {
    key: 'wegDerAbmeldung',
    label: 'Weg der Abmeldung',
    format: (v: string) => v || '—'
  },
  {
    key: 'kommentarAbmeldung',
    label: 'Kommentar zur Abmeldung',
    format: (v: string) => v || '—'
  },
  { key: 'bisherBezahlt', label: 'Bisher bezahlt', format: euro },
  { key: 'rueckbezahlt', label: 'Zurückbezahlt', format: euro }
]

export interface Aenderung {
  label: string
  von: string
  nach: string
}

/**
 * Was sich geändert hat — nur die Felder, die wirklich anders sind.
 *
 * Bei `loeschen` ist `nachher` leer; dann gibt es keine Änderungen, sondern
 * einen Endstand (siehe `endstand`).
 */
export function aenderungen(e: ProtokollEintrag): Aenderung[] {
  if (!e.nachher || Object.keys(e.nachher).length === 0) return []

  return FELDER.filter(
    (f) => JSON.stringify(e.vorher[f.key]) !== JSON.stringify(e.nachher[f.key])
  ).map((f) => ({
    label: f.label,
    von: f.format(e.vorher[f.key]),
    nach: f.format(e.nachher[f.key])
  }))
}

/**
 * Der Stand, den die Anmeldung beim Löschen hatte. Für gelöschte Anmeldungen
 * ist das alles, was von ihnen übrig ist — deshalb vollständig und nicht nur
 * die Abweichungen.
 */
export function endstand(e: ProtokollEintrag): Aenderung[] {
  return FELDER.filter((f) => e.vorher[f.key] !== undefined).map((f) => ({
    label: f.label,
    von: '',
    nach: f.format(e.vorher[f.key])
  }))
}
