<template>
  <component :is="tag || 'div'">
    <component
      :is="'form-' + field.type"
      v-for="(field, i) in schema"
      :key="`${i}-form`"
      :schema="field"
      :value="value[field.name]"
      :save="save"
      :cancel="cancel"
      @input="value[field.name] = $event"
    />
  </component>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component({})
export default class FormRoot extends Vue {
  @Prop()
  public value!: any

  @Prop()
  public schema!: any

  @Prop()
  public tag!: any

  @Prop({
    required: true
  })
  public cancel!: any

  @Prop({
    required: true
  })
  public save!: any
}
</script>
