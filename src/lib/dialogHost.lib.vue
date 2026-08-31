<template lang="pug">
div
  v-dialog(v-model="errorOpen", max-width="500")
    v-card(v-if="dialogState.error")
      v-card-title {{ dialogState.error.title }}
      v-card-text {{ dialogState.error.text }}
      v-card-actions
        v-spacer
        v-btn(color="primary", variant="text", @click="errorOpen = false") OK
  v-snackbar(v-model="snackbarOpen") {{ dialogState.snackbar }}
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { dialogState } from '../plugins/dialog'

const errorOpen = computed({
  get: () => !!dialogState.error,
  set: (val: boolean) => {
    if (!val) {
      dialogState.error = null
    }
  }
})

const snackbarOpen = computed({
  get: () => !!dialogState.snackbar,
  set: (val: boolean) => {
    if (!val) {
      dialogState.snackbar = ''
    }
  }
})
</script>
