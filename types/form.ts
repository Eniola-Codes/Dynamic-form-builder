/**
 * Type definitions for form schema and field structures
 */

export interface FieldSource {
  type: 'text' | 'tel' | 'number' | 'date' | 'file' | 'array'
  data?: {
    accept?: string
    fileType?: string[]
    minAge?: number
    dependsOn?: string
    options?: Record<string, Array<{ label: string; value: string | number | boolean }>>
  } | Array<{ label: string; value: string | number | boolean }>
}

export interface RequiredIfCondition {
  field: string
  value: any
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte'
}

export interface FieldDefinition {
  key: string
  type: 'string' | 'number' | 'boolean'
  'x-label'?: string
  'x-description'?: string
  'x-order'?: number
  'x-source'?: FieldSource
  'x-required_if'?: RequiredIfCondition
  isRequired?: boolean
  minLength?: number
  pattern?: string
  format?: string
  enum?: string[]
  errorMessage?: {
    pattern?: string
  }
}

export interface FormSchema {
  type: 'object'
  required?: string[]
  properties: Record<string, Omit<FieldDefinition, 'key' | 'isRequired'>>
  if?: {
    required?: string[]
    properties: Record<string, { const: any }>
  }
  then?: {
    required?: string[]
    properties?: Record<string, any>
  }
  else?: {
    required?: string[]
    properties?: Record<string, any>
  }
}

export type FormData = Record<string, any>
export type FormErrors = Record<string, string[]>

