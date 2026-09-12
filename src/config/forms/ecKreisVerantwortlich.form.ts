/**
 * Auswahl der/des Ortsverantwortlichen eines EC-Kreises.
 *
 * Die gewählte Person kann sich anschließend im Portal anmelden und die
 * FZ-Liste dieses Kreises einsehen — vorausgesetzt, sie hat auch einen
 * Portal-Zugang (Sonstiges → Portal-Zugänge). Darauf weist der Hinweistext
 * hin, weil die Zuordnung allein noch keinen Zugriff gibt.
 */
export default ({
  allePersonen,
  bezeichnung,
  initval
}: {
  allePersonen: any[]
  bezeichnung: string
  initval: { personID: number | null }
}) => ({
  title: `Ortsverantwortliche/r – ${bezeichnung}`,
  initval,
  schema: [
    {
      name: 'personID',
      type: 'autocomplete',
      'prepend-icon': 'person',
      label: 'Ortsverantwortliche/r',
      clearable: true,
      items: allePersonen.map((p: any) => ({
        value: p.personID,
        text: `${p.vorname} ${p.nachname} (${p.gebDat})`
      }))
    },
    {
      type: 'alert',
      // 'text', nicht 'label': formElements/alert.vue rendert schema.text.
      text: 'Diese Person sieht im Portal die Führungszeugnis-Liste dieses EC-Kreises und kann dort Zeugnisse eintragen. Dafür braucht sie zusätzlich einen Portal-Zugang. Der Name wird auch als Anrede der monatlichen Übersichts-Mail übernommen.'
    }
  ]
})
