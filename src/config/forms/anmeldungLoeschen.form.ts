/**
 * Abgemeldete Anmeldung endgültig löschen.
 *
 * Factory, weil der Hinweis auf eine offene Zahlung von der Anmeldung abhängt.
 * Das Häkchen „trotz offener Zahlung" erscheint nur, wenn es etwas zu
 * bestätigen gibt; die API verlangt es in genau diesem Fall.
 */
export default ({
  anmeldeID,
  offenerBetrag
}: {
  anmeldeID: string
  offenerBetrag: number
}) => {
  const euro = (b: number) => `${b.toFixed(2).replace('.', ',')} €`

  return {
    title: 'Anmeldung endgültig löschen',
    initval: {
      begruendung: '',
      trotzOffenerZahlung: false
    },
    schema: [
      {
        type: 'alert',
        color: 'error',
        text:
          `Die Anmeldung ${anmeldeID} wird vollständig gelöscht – inklusive ` +
          'Gesundheits- und Allergieangaben. Das lässt sich nicht rückgängig ' +
          'machen; im Protokoll bleiben nur Status und Zahlungsstand.'
      },
      ...(offenerBetrag > 0
        ? [
            {
              type: 'alert',
              color: 'warning',
              text: `Auf dieser Anmeldung stehen noch ${euro(
                offenerBetrag
              )} offen (gezahlt abzüglich Rückzahlung und Abmeldegebühr).`
            },
            {
              name: 'trotzOffenerZahlung',
              type: 'checkbox',
              label: 'Trotz offener Zahlung löschen',
              rule: 'accepted'
            }
          ]
        : []),
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
    saveName: 'Endgültig löschen'
  }
}
