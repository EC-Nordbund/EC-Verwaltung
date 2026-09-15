/**
 * Auswahl einer/eines Verantwortlichen für einen EC-Kreis.
 *
 * Ein Kreis hat zwei getrennte Aufgaben, jede mit eigener Person:
 *
 *   fz  — Führungszeugnisse einsehen und eintragen
 *   ort — Mitgliederliste des Kreises pflegen (Status, neue Personen)
 *
 * Die Trennung ist gewollt; wer beides macht, wird in beiden Feldern
 * eingetragen. Die Auswahl allein gibt noch keinen Zugang — dafür braucht die
 * Person zusätzlich einen Portal-Zugang (Sonstiges → Portal-Zugänge).
 */
export default ({
  allePersonen,
  bezeichnung,
  rolle,
  initval
}: {
  allePersonen: any[]
  bezeichnung: string
  rolle: 'fz' | 'ort'
  initval: { personID: number | null }
}) => ({
  title:
    rolle === 'fz'
      ? `Führungszeugnisse – ${bezeichnung}`
      : `Mitgliederliste – ${bezeichnung}`,
  initval,
  schema: [
    {
      name: 'personID',
      type: 'autocomplete',
      'prepend-icon': 'person',
      label: rolle === 'fz' ? 'FZ-Verantwortliche/r' : 'Ortsverantwortliche/r',
      clearable: true,
      items: allePersonen.map((p: any) => ({
        value: p.personID,
        text: `${p.vorname} ${p.nachname} (${p.gebDat})`
      }))
    },
    {
      type: 'alert',
      text:
        rolle === 'fz'
          ? 'Diese Person sieht im Portal die Mitarbeiter- und Führungszeugnis-Liste dieses EC-Kreises, pflegt, wer dort mitarbeitet, und kann Zeugnisse eintragen. Die Mitgliederliste sieht sie dabei nicht. Der Name wird auch als Anrede der monatlichen Übersichts-Mail übernommen. Zusätzlich braucht sie einen Portal-Zugang.'
          : 'Diese Person pflegt im Portal die Mitgliederliste dieses EC-Kreises: Mitgliedsstatus ändern und neue Personen hinzufügen. Führungszeugnisse und die Mitarbeiterliste sieht sie dabei nicht. Zusätzlich braucht sie einen Portal-Zugang.'
    }
  ]
})
