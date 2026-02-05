import type { FieldDefinition, FormSchema, FormData } from '~/types/form'

export const useConditionalLogic = () => {
  const isValueEmpty = (value: any): boolean => 
    value === undefined || value === null || value === ''

  const shouldShowField = (
    field: FieldDefinition,
    schema: FormSchema,
    formData: FormData
  ): boolean => {
    if (field['x-required_if']) {
      const { field: depField, value: depValue, operator } = field['x-required_if']
      const dependentValue = formData[depField]
      if (isValueEmpty(dependentValue) || (operator === 'eq' && dependentValue !== depValue)) {
        return false
      }
    }
    
    if (schema.if && schema.then && schema.else) {
      const conditionField = Object.keys(schema.if.properties || {})[0]
      const conditionValue = schema.if.properties[conditionField]?.const
      const conditionFieldValue = formData[conditionField]
      
      const thenRequired = schema.then.required || []
      const thenProperties = schema.then.properties || {}
      const elseRequired = schema.else.required || []
      const elseProperties = schema.else.properties || {}
      
      const isInThen = thenRequired.includes(field.key) || !!thenProperties[field.key]
      const isInElse = elseRequired.includes(field.key) || !!elseProperties[field.key]
      
      if (!isInThen && !isInElse) return true
      if (isValueEmpty(conditionFieldValue)) return false
      
      return conditionFieldValue === conditionValue ? isInThen : isInElse
    }
    
    return true
  }

  const isFieldRequired = (
    field: FieldDefinition,
    schema: FormSchema,
    formData: FormData
  ): boolean => {
    if (field.isRequired) return true
    
    if (field['x-required_if']?.operator === 'eq') {
      const { field: depField, value: depValue } = field['x-required_if']
      if (formData[depField] === depValue) return true
    }
    
    if (schema.if && schema.then && schema.else) {
      const conditionField = Object.keys(schema.if.properties || {})[0]
      const conditionValue = schema.if.properties[conditionField]?.const
      const conditionFieldValue = formData[conditionField]
      
      if (!isValueEmpty(conditionFieldValue)) {
        const required = conditionFieldValue === conditionValue
          ? schema.then.required || []
          : schema.else.required || []
        return required.includes(field.key)
      }
    }
    
    return false
  }

  return {
    shouldShowField,
    isFieldRequired
  }
}

