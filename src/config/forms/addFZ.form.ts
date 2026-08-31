export default ({
  allePersonen,
  routeParamsId
}: {
  allePersonen: any[]
  routeParamsId: string
}) => ({
  title: 'FZ Eintragen',
  initval: {
    gesehenVon: null,
    fzVon: '',
    gesehenAm: '',
    kommentar: 'Es spricht nichts gegen ein Engagement bei uns.'
  },
  schema: [
    {
      name: 'gesehenVon',
      type: 'autocomplete',
      rule: 'required',
      'prepend-icon': 'person',
      items: allePersonen
        .filter((pers: any) => pers.personID !== parseInt(routeParamsId))
        .map((pers: any) => ({
          value: pers.personID,
          text:
            pers.vorname + ' ' + pers.nachname + ' (' + pers.gebDat.german + ')'
        })),
      label: 'Gesehen von',
      required: true
    },
    {
      name: 'fzVon',
      rule: 'required',
      type: 'date',
      label: 'FZ vom',
      required: true
    },
    {
      name: 'gesehenAm',
      rule: 'required',
      type: 'date',
      label: 'Gesehen am',
      required: true
    },
    {
      name: 'kommentar',
      type: 'text',
      label: 'Kommentar',
      rule: 'required',
      required: true
    }
  ]
})
