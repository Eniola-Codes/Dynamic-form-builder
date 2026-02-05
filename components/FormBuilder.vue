<template>
  <form @submit.prevent="handleSubmit" class="form-builder">
    <div
      v-for="field in orderedFields"
      :key="field.key"
      class="form-field"
      :class="{ 'field-hidden': !shouldShowField(field) }"
    >
      <FormField
        :field="field"
        :value="formData[field.key]"
        :errors="shouldShowErrors(field.key, isSubmitting) ? errors[field.key] : []"
        :form-data="formData"
        @update:value="handleFieldUpdate"
        @blur="handleFieldBlur"
      />
    </div>

    <div class="form-actions">
      <button type="submit" :disabled="isSubmitting" class="submit-btn">
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import FormField from './FormField.vue'
import { useFormState } from '~/composables/useFormState'
import { useFormValidation } from '~/composables/useFormValidation'
import { useConditionalLogic } from '~/composables/useConditionalLogic'

const props = defineProps({
  schema: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['submit'])

const {
  formData,
  errors,
  touchedFields,
  updateField,
  markFieldTouched,
  setFieldErrors,
  clearFieldErrors,
  resetDependentFields,
  clearAllErrors,
  markAllFieldsTouched,
  shouldShowErrors
} = useFormState()

const { validateField, validateAll } = useFormValidation()

const { shouldShowField: checkShouldShowField, isFieldRequired: checkIsFieldRequired } = useConditionalLogic()

const isSubmitting = ref(false)

const fields = computed(() => {
  const fieldDefs = []
  const properties = props.schema.properties || {}
  
  for (const [key, fieldSchema] of Object.entries(properties)) {
    fieldDefs.push({
      key,
      ...fieldSchema,
      isRequired: props.schema.required?.includes(key) || false
    })
  }
  
  return fieldDefs
})

const orderedFields = computed(() => {
  return [...fields.value].sort((a, b) => {
    const orderA = a['x-order'] ?? 999
    const orderB = b['x-order'] ?? 999
    return orderA - orderB
  })
})

const shouldShowField = (field) => checkShouldShowField(field, props.schema, formData.value)
const isFieldRequired = (field) => checkIsFieldRequired(field, props.schema, formData.value)

const handleFieldUpdate = (key, value) => {
  updateField(key, value)
  const field = fields.value.find(f => f.key === key)
  if (!field) return
  
  if (errors.value[key]) {
    clearFieldErrors(key)
  }
  
  const sourceData = field?.['x-source']?.data
  if (sourceData && !Array.isArray(sourceData) && sourceData.dependsOn) {
    resetDependentFields(key, fields.value)
  }
  
  fields.value
    .filter(f => f['x-required_if']?.field === key && !shouldShowField(f))
    .forEach(f => {
      formData.value[f.key] = ''
      touchedFields.value.delete(f.key)
      clearFieldErrors(f.key)
    })
}

const handleFieldBlur = (key) => {
  markFieldTouched(key)
  const field = fields.value.find(f => f.key === key)
  if (field && shouldShowField(field)) {
    const fieldErrors = validateField(field, formData.value[key], isFieldRequired)
    setFieldErrors(key, fieldErrors)
  }
}

const validate = () => {
  clearAllErrors()
  markAllFieldsTouched(orderedFields.value, shouldShowField)
  
  const { isValid, errors: validationErrors } = validateAll(
    orderedFields.value,
    formData.value,
    shouldShowField,
    isFieldRequired
  )
  
  errors.value = validationErrors
  return isValid
}

const handleSubmit = async () => {
  if (!validate()) {
    const firstErrorField = Object.keys(errors.value)[0]
    if (firstErrorField) {
      const element = document.querySelector(`[data-field="${firstErrorField}"]`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    return
  }
  
  isSubmitting.value = true
  
  try {
    emit('submit', { ...formData.value })
  } finally {
    isSubmitting.value = false
  }
}
</script>
