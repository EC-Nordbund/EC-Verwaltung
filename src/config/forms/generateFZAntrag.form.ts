export default ({ data }: { data: { emails: any[] } }) => ({
  title: 'FZ Antrag',
  initval: {
    mail: null
  },
  schema: [
    {
      name: 'mail',
      type: 'autocomplete',
      label: 'E-Mail',
      rule: 'required',
      required: true,
      items: data.emails.map((v: any) => v.eMail)
    }
  ]
})
