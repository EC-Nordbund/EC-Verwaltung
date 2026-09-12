/**
 * Anlegen eines Portal-Zugangs.
 *
 * Kein Passwortfeld: die Person bekommt einen Einmal-Link per Mail und legt es
 * selbst fest. Damit gibt es keine Startpasswörter, die per Telefon
 * weitergegeben und nie geändert werden.
 *
 * Die Mailadresse ist zugleich die Login-Kennung und wird als eigene Spalte
 * geführt statt aus `eMails` gejoint — sonst ändert sich die Anmeldung, sobald
 * jemand die Kontaktdaten der Person pflegt.
 */
export default ({ allePersonen }: { allePersonen: any[] }) => ({
  title: 'Portal-Zugang anlegen',
  initval: { personID: null, email: '', superuser: false },
  schema: [
    {
      name: 'personID',
      type: 'autocomplete',
      rule: 'required',
      required: true,
      'prepend-icon': 'person',
      label: 'Person',
      items: allePersonen.map((p: any) => ({
        value: p.personID,
        text: `${p.vorname} ${p.nachname} (${p.gebDat})`
      }))
    },
    {
      name: 'email',
      type: 'input',
      rule: 'required',
      required: true,
      'prepend-icon': 'mail',
      label: 'E-Mail-Adresse (Login und Einladung)'
    },
    {
      name: 'superuser',
      type: 'checkbox',
      label: 'Vollzugriff (sieht alle EC-Kreise und alle Freizeiten)'
    },
    {
      type: 'alert',
      label:
        'Die Person erhält eine Einladung an diese Adresse und setzt ihr Passwort selbst. Der Zugang gilt nur für das Portal, nicht für die Verwaltung.'
    }
  ]
})
