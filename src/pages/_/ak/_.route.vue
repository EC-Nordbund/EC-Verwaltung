<template lang="pug">
ec-wrapper(
  hasSheet,
  hasHeader,
  hasDial,
  v-bind='config',
  hasReload,
  @reload='loadData'
)
  template(#header)
    div(style='padding: 2px 10px')
      ec-search(label='AK suchen', @suche='suche = $event')
  v-list(two-line)
    v-list-tile(
      v-for='item in data.filter($util.filter(suche))',
      :key='item.akID',
      @click='navigate(`/ak/${item.akID}`)'
    )
      v-list-tile-action
        v-icon group
      v-list-tile-content
        v-list-tile-title {{ item.bezeichnung }}
        v-list-tile-sub-title ID: {{ item.akID }}
  template(#dialogs)
    formular-selector(name='addAK', ref='addAK')
</template>
<script lang="ts">
import { ref, defineComponent } from '@vue/composition-api'
import { useApollo } from '../../../plugins/apollo'
import { useLogin } from '../../../plugins/auth'
import { useNotification } from '../../../plugins/notify'
import { useRouter } from '../../../plugins/router'
import { useDialog } from '../../../plugins/dialog'

export default defineComponent({
  name: 'RootIndexAkIndex',
  setup() {
    const suche = ref('')
    const data = ref([])

    const { client, gql } = useApollo()
    const { authToken } = useLogin()
    const { createNotification } = useNotification()
    const { navigate } = useRouter()
    const { error } = useDialog()

    const addAK = ref(null)

    const config = {
      sheet: [
        {
          icon: 'group_add',
          label: 'AK-Hinzufügen',
          async click() {
            const { bezeichnung } = await addAK.value.show()
            try {
              const res = await client.mutate({
                mutation: gql`
                  mutation($authToken: String!, $bezeichnung: String!) {
                    addAK(bezeichnung: $bezeichnung, authToken: $authToken)
                  }
                `,
                variables: {
                  bezeichnung,
                  authToken: authToken.value
                }
              })

              createNotification({
                title: 'Neuer AK',
                body: `Du hast erfolgreich einen AK mit dem Namen "${bezeichnung}" angelegt`
              })
              navigate(`/ak/${res.data.addAK}`)
            } catch (err) {
              error({
                text: err.message || err,
                title: 'Speichern fehlgeschlagen!'
              })
            }
          }
        }
      ],
      title: 'Arbeitskreise'
    }

    async function loadData() {
      try {
        const res = await client.query({
          query: gql`
            query($authToken: String!) {
              aks(authToken: $authToken) {
                akID
                bezeichnung
              }
            }
          `,
          variables: {
            authToken: authToken.value
          },
          fetchPolicy: 'no-cache'
        })

        data.value = res.data.aks
      } catch (err) {
        error({
          text: err.message || err,
          title: 'Laden fehlgeschlagen!'
        })
      }
    }

    loadData()

    return {
      config,
      suche,
      data,
      navigate,
      loadData,
      addAK
    }
  }
})
</script>
