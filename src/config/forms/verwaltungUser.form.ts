/**
 * Formulare der Administration (Sonstiges -> Administration): Benutzer der
 * Verwaltung anlegen, Ablaufdatum setzen, Passwort neu setzen.
 *
 * Anders als beim Portal gibt es hier keine Einladung per Mail: das
 * Startpasswort wird beim Anlegen vergeben und der Person persönlich
 * mitgeteilt. Sie ändert es danach unter Profil -> Passwort ändern. Das Feld
 * ist deshalb ein normales Textfeld -- wer es vergibt, muss es ablesen können.
 */
const PASSWORT_REGEL = 'required|min:8|has_lower|has_upper|has_digit'

export const userAnlegen = ({
  allePersonen,
  ablaufDatum
}: {
  allePersonen: any[]
  ablaufDatum: string
}) => ({
  title: 'Benutzer hinzufügen',
  initval: { personID: null, username: '', passwort: '', ablaufDatum },
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
      name: 'username',
      type: 'input',
      rule: 'required|min:3',
      required: true,
      'prepend-icon': 'account_circle',
      label: 'Benutzername (Login)'
    },
    {
      name: 'passwort',
      type: 'input',
      rule: PASSWORT_REGEL,
      required: true,
      'prepend-icon': 'vpn_key',
      label: 'Startpasswort'
    },
    {
      name: 'ablaufDatum',
      type: 'date',
      rule: 'required',
      required: true,
      label: 'Zugang gültig bis'
    },
    {
      type: 'alert',
      // 'text', nicht 'label': formElements/alert.vue rendert schema.text.
      text: 'Das Startpasswort bitte persönlich weitergeben. Die Person ändert es danach unter Profil. Der Benutzer darf alles in der Verwaltung, auch Benutzer anlegen und sperren.'
    }
  ]
})

export const userAblauf = ({
  name,
  ablaufDatum,
  gesperrt
}: {
  name: string
  ablaufDatum: string
  gesperrt: boolean
}) => ({
  title: gesperrt ? `${name} entsperren` : `Ablaufdatum von ${name}`,
  initval: { ablaufDatum },
  schema: [
    {
      name: 'ablaufDatum',
      type: 'date',
      rule: 'required',
      required: true,
      label: 'Zugang gültig bis'
    },
    {
      type: 'alert',
      text: 'Ab diesem Tag ist keine Anmeldung mehr möglich.'
    }
  ]
})

export const userPasswort = ({ name }: { name: string }) => ({
  title: `Passwort von ${name} neu setzen`,
  initval: { passwort: '' },
  schema: [
    {
      name: 'passwort',
      type: 'input',
      rule: PASSWORT_REGEL,
      required: true,
      'prepend-icon': 'vpn_key',
      label: 'Neues Passwort'
    },
    {
      type: 'alert',
      text: 'Das Passwort bitte persönlich weitergeben. Die Person ändert es danach unter Profil.'
    }
  ]
})
