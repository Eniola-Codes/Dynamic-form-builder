import type { FieldDefinition, FormData, FormErrors } from '~/types/form'

export const useFormValidation = () => {
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const validateField = (
    field: FieldDefinition,
    value: any,
    isFieldRequired: (field: FieldDefinition) => boolean
  ): string[] => {
    const fieldErrors: string[] = []
    const fieldLabel = field['x-label'] || field.key
    const isEmpty = !value || value === ''
    
    if (isFieldRequired(field) && isEmpty) {
      fieldErrors.push(`${fieldLabel} is required`)
      return fieldErrors
    }
    
    if (isEmpty) return []
    
    if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
      fieldErrors.push(`${fieldLabel} must be at least ${field.minLength} characters`)
    }
    
    if (field.pattern && typeof value === 'string') {
      if (!new RegExp(field.pattern).test(value)) {
        fieldErrors.push(field.errorMessage?.pattern || `${fieldLabel} format is invalid`)
      }
    }
    
    const sourceData = field['x-source']?.data
    const minAge = sourceData && !Array.isArray(sourceData) ? sourceData.minAge : undefined
    if (field['x-source']?.type === 'date' && minAge) {
      const birthDate = new Date(value as string)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < minAge) {
        fieldErrors.push(`You must be at least ${minAge} years old`)
      }
    }
    
    return fieldErrors
  }

  const validateAll = (
    fields: FieldDefinition[],
    formData: FormData,
    shouldShowField: (field: FieldDefinition) => boolean,
    isFieldRequired: (field: FieldDefinition) => boolean
  ): { isValid: boolean; errors: FormErrors } => {
    const errors: FormErrors = {}
    
    fields
      .filter(shouldShowField)
      .forEach(field => {
        const fieldErrors = validateField(field, formData[field.key], isFieldRequired)
        if (fieldErrors.length > 0) {
          errors[field.key] = fieldErrors
        }
      })
    
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  return {
    validateField,
    validateAll,
    isValidUrl
  }
}

