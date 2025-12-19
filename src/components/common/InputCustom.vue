<script setup lang="ts">
import type { FormContext } from 'vee-validate';
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  name: string;
  form: FormContext;
  label?: string;
  autocomplete?: string;
  placeholder?: string;
  disable?: boolean;
  type?: string;
}>();

const [name, attrs] = props.form.defineField(props.name, { validateOnModelUpdate: true })
</script>

<template>
  <Field>
    <FieldLabel :for="props.name">{{ props.label }}</FieldLabel>
    <div class="flex items-center relative">
      <Input 
        v-model="name" 
        v-bind="attrs" 
        :disabled="props.disable"
        :id="props.name"
        :placeholder="props.placeholder"
        :autocomplete="props.autocomplete" 
        :type="props.type"
      />
    </div>
    <FieldError v-if="props.form.errors.value[props.name] && props.form.submitCount.value > 0">
      {{ props.form.errors.value[props.name] }}
    </FieldError>
  </Field>
</template>