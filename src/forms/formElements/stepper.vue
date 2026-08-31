<template lang="pug">
//- Toter Code: form-stepper wird aktuell von keinem Formular genutzt.
//- Minimal auf die Vuetify-4-Stepper-Struktur migriert
//- (v-stepper-item/v-stepper-window statt v-stepper-step/v-stepper-content).
v-stepper(v-bind='bind', v-model='currStep')
  v-stepper-header
    v-stepper-item(
      v-for='(step, stepID) in schema.steps',
      :key='stepID + "step"',
      :value='stepID + 1',
      :complete='stepID + 1 < currStep',
      :rules='[() => !error[stepID + 1]]',
      :title='step.label',
      :subtitle='error[stepID + 1] ? "Es wurden nicht alle Felder korrekt ausgefüllt!" : step.summerize'
    )
  v-stepper-window
    v-stepper-window-item(
      v-for='(step, stepID) in schema.steps',
      :key='stepID + "content"',
      :value='stepID + 1'
    )
      v-form(v-model='valid[stepID + 1]')
        formular(
          :value='value[step.name]',
          @input='changeValue({ ...value, [step.name]: $event })',
          :schema='step.schema',
          :cancel='cancel',
          :save='save'
        )
        div(style='display:flex;')
          v-spacer
          v-btn(
            v-for='(btn, btnID) in step.btns',
            :key='stepID + "_" + btnID',
            v-html='btn.content',
            @click='clickBtn(btn.click)',
            color='primary'
          )
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { fieldProps, useField } from '../field'

const props = defineProps(fieldProps)
const emit = defineEmits(['input'])

const { changeValue, bind } = useField(props, emit)

const currStep = ref(0)
const valid = reactive<any>({})

const error = reactive<any>({
  0: false,
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false,
  7: false,
  8: false,
  9: false,
  10: false
})

function clickBtn(
  cb:
    | undefined
    | ((
        currStep: number,
        valid: boolean,
        cancel: () => void,
        save: () => void,
        self: any,
        set: any
      ) => void | number)
) {
  if (cb) {
    const val = cb(
      currStep.value,
      valid[currStep.value],
      props.cancel as () => void,
      props.save as () => void,
      // Früher: die Komponenten-Instanz (`this`) + Vue.set — beides gibt es
      // in Vue 3 / script setup nicht mehr (toter Code, nie fertig gebaut).
      null,
      (obj: any, key: string | number, value: any) => {
        obj[key] = value
      }
    )
    if (val) {
      currStep.value = val
    }
  }
}
</script>
