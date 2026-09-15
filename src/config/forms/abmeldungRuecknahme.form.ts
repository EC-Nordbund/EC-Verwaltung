/**
 * Abmeldung zurücknehmen.
 *
 * Factory statt statischer Config: Warnhinweis und Auswahl hängen von der
 * konkreten Anmeldung ab (Rolle, Abmeldegebühr, Rückzahlung). Die Seite baut
 * die Config als computed und bindet sie direkt an formular-dialog.
 */
export default ({
  istTeilnehmer,
  abmeldeGebuehr,
  rueckbezahlt
}: {
  istTeilnehmer: boolean
  abmeldeGebuehr: number
  rueckbezahlt: number
}) => {
  const hinweise: string[] = []
  if (abmeldeGebuehr > 0) {
    hinweise.push(
      `Die Abmeldegebühr von ${abmeldeGebuehr} € wird auf 0 € zurückgesetzt.`
    )
  }
  if (rueckbezahlt > 0) {
    hinweise.push(
      `Es wurden bereits ${rueckbezahlt.toFixed(2).replace('.', ',')} € zurückbezahlt – dieser Betrag bleibt so stehen und muss ggf. neu eingezogen werden.`
    )
  }

  return {
    title: 'Abmeldung zurücknehmen',
    initval: {
      ziel: 'angemeldet',
      begruendung: ''
    },
    schema: [
      ...(hinweise.length > 0
        ? [{ type: 'alert', color: 'warning', text: hinweise.join(' ') }]
        : []),
      {
        name: 'ziel',
        type: 'radio',
        label: 'Neuer Status',
        rule: 'required',
        radios: [
          { label: 'Angemeldet', value: 'angemeldet' },
          // Nur Teilnehmer haben Wartelistenplätze; für Mitarbeitende lehnt
          // die API die Warteliste ab, also gar nicht erst anbieten.
          ...(istTeilnehmer
            ? [{ label: 'Ans Ende der Warteliste', value: 'warteliste' }]
            : [])
        ]
      },
      {
        name: 'begruendung',
        type: 'text',
        label: 'Begründung (wird protokolliert)',
        rule: 'required|max:500',
        required: true,
        counter: 500,
        rows: 3
      }
    ],
    saveName: 'Zurücknehmen'
  }
}
