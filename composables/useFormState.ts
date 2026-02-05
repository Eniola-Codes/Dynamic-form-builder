import { ref } from 'vue'
import type { FieldDefinition, FormData, FormErrors } from '~/types/form'

export const useFormState = () => {
  const formData = ref<FormData>({})
  const errors = ref<FormErrors>({})
  const touchedFields = ref<Set<string>>(new Set())

  const updateField = (key: string, value: any): void => {
    formData.value[key] = value
  }

  const markFieldTouched = (key: string): void => {
    touchedFields.value.add(key)
  }

  const setFieldErrors = (key: string, fieldErrors: string[]): void => {
    fieldErrors.length > 0 
      ? errors.value[key] = fieldErrors 
      : delete errors.value[key]
  }

  const clearFieldErrors = (key: string): void => {
    delete errors.value[key]
  }

  const resetDependentFields = (parentKey: string, allFields: FieldDefinition[]): void => {
    allFields
      .filter(field => {
        const sourceData = field['x-source']?.data
        return sourceData && !Array.isArray(sourceData) && sourceData.dependsOn === parentKey
      })
      .forEach(field => {
        formData.value[field.key] = ''
        touchedFields.value.delete(field.key)
        clearFieldErrors(field.key)
      })
  }

  const clearAllErrors = (): void => {
    errors.value = {}
  }

  const markAllFieldsTouched = (
    fields: FieldDefinition[],
    shouldShowField: (field: FieldDefinition) => boolean
  ): void => {
    fields
      .filter(shouldShowField)
      .forEach(field => touchedFields.value.add(field.key))
  }

  const shouldShowErrors = (key: string, isSubmitting: boolean = false): boolean => {
    return touchedFields.value.has(key) || isSubmitting
  }

  return {
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
  }
}

