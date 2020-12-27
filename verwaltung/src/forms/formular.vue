<template>
  <component :is="tag || 'div'">
    <component
      v-for="(field, i) in schema"
      :is="'form_' + field.type"
      :schema="field"
      :value="value[field.name]"
      @input="value[field.name] = $event"
      :save="save"
      :cancel="cancel"
      :key="`${i}-form`"
    ></component>
  </component>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component({})
export default class FormRoot extends Vue {
  @Prop()
  public value!: any;

  @Prop()
  public schema!: any;

  @Prop()
  public tag!: any;

  @Prop({
    required: true
  })
  public cancel!: any;

  @Prop({
    required: true
  })
  public save!: any;
}
</script>
