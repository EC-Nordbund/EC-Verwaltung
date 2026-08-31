<template lang="pug">
ec-wrapper(
  hasXBtn,
  hasSheet,
  hasHeader,
  hasDial,
  v-bind='config',
  hasReload,
  @reload='loadData'
)
  template(#header)
    .head(style='padding: 2px 10px')
      v-switch(label='Alle Statusupdates anzeigen?', v-model='showAll')
      h2(v-font, v-primary, v-if='showAll') Alle Statusupdates
      h2(v-font, v-primary, v-else) Aktuelle Mitglieder
  v-list(lines='two')
    //- v-if und v-for standen früher am selben Element — in Vue 3 in
    //- verschachtelte templates getrennt (v-if hätte sonst Vorrang).
    template(v-if='data.personen')
      template(
        v-for='(person, index) in data.personen',
        :key='person.person.personID + "_c"'
      )
        v-list-item(
          v-if='!showAll && person.currentStatus !== 0',
          @click='navigate(`/personen/${person.person.personID}/home`)'
        )
          template(#prepend)
            v-icon person
          v-list-item-title {{ person.person.vorname }} {{ person.person.nachname }} ({{ person.person.gebDat.german }})
          v-list-item-subtitle {{ stadien[person.currentStatus] }}
        v-divider(v-if='showAll && index !== 0')
        template(v-if='showAll')
          v-list-item(
            v-for='state in person.allUpdates',
            :key='state.akPersonID + "_s"',
            @click='navigate(`/personen/${person.person.personID}/home`)'
          )
            template(#prepend)
              v-icon person
            v-list-item-title {{ person.person.vorname }} {{ person.person.nachname }} ({{ person.person.gebDat.german }})
            v-list-item-subtitle {{ stadien[state.neuerStatus] }} (geändert am {{ state.date.german }})
  template(#dialogs)
    ec-form-edit-ak(ref='formEditAk', :data='data', @reload='loadData')
</template>
<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue'
import type { Ref } from 'vue'
import { useApollo } from '../../../../plugins/apollo'
import { useLogin } from '../../../../plugins/auth'
import { useRouter } from '../../../../plugins/router'
import { useDialog } from '../../../../plugins/dialog'
import EcFormEditAk from '../../../../lib/editAK.form.lib.vue'

const { client, gql } = useApollo()
const { authToken } = useLogin()
const { error } = useDialog()
const { booleanQueryRef, route, navigate } = useRouter()

const showAll = booleanQueryRef('all')
const formEditAk =
  useTemplateRef<InstanceType<typeof EcFormEditAk>>('formEditAk')

const data: Ref<any> = ref({
  personen: []
})

const config = computed(() => ({
  sheet: [
    {
      id: 'ak_m_add',
      icon: 'person_add',
      label: 'AK Mitglied hinzufügen',
      click: () => {
        formEditAk.value.edit('add')
      }
    },
    {
      id: 'ak_m_update',
      icon: 'edit',
      label: 'AK Mitglied updaten',
      click: () => {
        formEditAk.value.edit('edit')
      }
    },
    {
      id: 'ak_m_del',
      icon: 'delete',
      label: 'AK Mitglied entfernen',
      click: () => {
        formEditAk.value.edit('delete')
      }
    }
  ],
  title: data.value.bezeichnung,
  subTitle: 'Arbeitskreis'
}))

const stadien = ['Ausgetreten', 'Mitglied', 'Vertreter', 'Leiter']

async function loadData() {
  try {
    const res = await client.query({
      query: gql`
        query ($authToken: String!, $akID: Int!) {
          ak(akID: $akID, authToken: $authToken) {
            akID
            bezeichnung
            personen {
              currentStatus
              allUpdates {
                akPersonID
                neuerStatus
                date {
                  german
                }
              }
              person {
                personID
                vorname
                nachname
                gebDat {
                  german
                }
              }
            }
          }
        }
      `,
      variables: {
        authToken: authToken.value,
        akID: parseInt(route.value.params.id as string)
      },
      fetchPolicy: 'no-cache'
    })
    data.value = res.data.ak
  } catch (err: any) {
    error({
      text: err.message || err,
      title: 'Laden fehlgeschlagen!'
    })
  }
}

loadData()
</script>
