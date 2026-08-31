export default ({
  allePersonen,
  routeParamsId
}: {
  allePersonen: any[]
  routeParamsId: string
}) => {
  return {
    title: 'Person mergen',
    initval: {
      falsch: null
    },
    schema: [
      {
        name: 'falsch',
        type: 'autocomplete',
        rule: 'required',
        'prepend-icon': 'person',
        items: allePersonen
          .filter((pers: any) => pers.personID !== parseInt(routeParamsId))
          .map((pers: any) => ({
            value: pers.personID,
            text:
              pers.vorname +
              ' ' +
              pers.nachname +
              ' (' +
              pers.gebDat.german +
              ')'
          })),
        label: 'Falsche Person'
      }
    ]
  }
}
