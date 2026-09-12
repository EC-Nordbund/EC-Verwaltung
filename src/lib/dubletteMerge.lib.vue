<template lang="pug">
v-dialog(v-model='visible', max-width='560px', persistent)
  v-card(v-if='daten')
    v-card-title.d-flex.align-center(style='white-space: normal')
      h1(v-font, v-primary) Personen zusammenführen

    v-card-text
      //- Die Richtung ist die eine Sache, die hier nicht missverstanden werden
      //- darf: der eine Satz wird endgültig gelöscht. Deshalb zwei farblich
      //- eindeutige Blöcke mit Klartext statt einer Zeile „A mit B mergen".
      v-alert.mb-3(
        type='success',
        variant='tonal',
        density='compact',
        icon='check_circle'
      )
        .text-caption.text-uppercase.font-weight-bold Bleibt bestehen
        .font-weight-bold {{ daten.behalten.vorname }} {{ daten.behalten.nachname }}
        .text-caption
          | {{ formatGebDat(daten.behalten.gebDat) }} · personID {{ daten.behalten.personID }}

      v-alert.mb-3(
        type='error',
        variant='tonal',
        density='compact',
        icon='delete_forever'
      )
        .text-caption.text-uppercase.font-weight-bold Wird gelöscht
        .font-weight-bold {{ daten.entfernen.vorname }} {{ daten.entfernen.nachname }}
        .text-caption
          | {{ formatGebDat(daten.entfernen.gebDat) }} · personID {{ daten.entfernen.personID }}

      p.mb-2
        | Anmeldungen, Adressen, E-Mail-Adressen, Telefonnummern,
        | Führungszeugnisse, Arbeitskreise und Zugänge werden auf personID
        | {{ daten.behalten.personID }} übertragen. Doppelte Kontaktdaten werden
        | zusammengefasst.

      v-alert(type='warning', variant='tonal', density='compact')
        | Das lässt sich nicht rückgängig machen.

    v-card-actions
      v-spacer
      v-btn(variant='text', @click='abbrechen') Abbrechen
      v-btn(
        color='error',
        variant='flat',
        prepend-icon='merge_type',
        @click='bestaetigen'
      ) Endgültig zusammenführen
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { formatGebDat } from '../util/dubletten.util'

/**
 * Bestätigung für das Zusammenführen zweier Personen.
 *
 * Bewusst nur Bestätigung, keine Ausführung (anders als adresseMerge.form.lib.vue,
 * das die Mutation selbst abschickt): die Liste muss danach das Paar lokal
 * entfernen, die Vergleichsansicht dagegen zurücknavigieren. Die Komponente
 * kennt diesen Unterschied nicht und soll ihn nicht kennen.
 *
 * `window.confirm` — sonst im Repo der üblicheWeg — reicht hier nicht: bei einem
 * Vorgang, der einen Datensatz löscht, muss sichtbar sein, WELCHER der beiden es
 * ist, und das leistet eine einzeilige Textabfrage nicht.
 */

interface Kurz {
  personID: number
  vorname: string
  nachname: string
  gebDat: string
}

const visible = ref(false)
const daten = ref<{ behalten: Kurz; entfernen: Kurz } | null>(null)

let aufloesen: () => void = () => {}
let verwerfen: () => void = () => {}

function show(behalten: Kurz, entfernen: Kurz) {
  daten.value = { behalten, entfernen }
  visible.value = true
  return new Promise<void>((resolve, reject) => {
    aufloesen = resolve
    verwerfen = reject
  })
}

defineExpose({ show })

function bestaetigen() {
  visible.value = false
  aufloesen()
}

function abbrechen() {
  visible.value = false
  verwerfen()
}
</script>
