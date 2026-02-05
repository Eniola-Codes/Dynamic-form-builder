<template>
  <div class="field-wrapper" :data-field="field.key">
    <label :for="field.key" class="field-label">
      {{ field['x-label'] }}
      <span v-if="isRequired" class="required-indicator">*</span>
    </label>
        
    <input
      v-if="['text', 'tel', 'date'].includes(field['x-source']?.type)"
      :id="field.key"
      :type="inputType"
      :value="value"
      :max="field['x-source']?.type === 'date' ? maxDate : undefined"
      :placeholder="field['x-description']"
      :required="isRequired"
      class="field-input"
      :class="{ 'input-error': hasErrors }"
      @input="handleInput"
      @blur="handleBlurEvent"
    />
    
    <input
      v-else-if="field['x-source']?.type === 'number'"
      :id="field.key"
      type="text"
      :value="value"
      :placeholder="field['x-description']"
      :required="isRequired"
      class="field-input"
      :class="{ 'input-error': hasErrors }"
      @input="handleNumberInput"
      @blur="handleBlurEvent"
    />
    
    <div v-else-if="field['x-source']?.type === 'file'" class="file-input-wrapper">
      <p v-if="field['x-description']" class="field-description">
        {{ field['x-description'] }}
      </p>
      <input
        :id="field.key"
        type="file"
        :accept="field['x-source']?.data?.accept"
        :required="isRequired"
        class="field-input file-input"
        :class="{ 'input-error': hasErrors }"
        @change="handleFileChange"
      />
    </div>
    
    <select
      v-else-if="field['x-source']?.type === 'array'"
      :id="field.key"
      :value="stringValue"
      :required="isRequired"
      class="field-input field-select"
      :class="{ 'input-error': hasErrors }"
      @change="handleSelectChange"
      @blur="handleBlurEvent"
    >
      <option value="">{{ field['x-description'] || 'Select an option' }}</option>
      <option
        v-for="option in availableOptions"
        :key="String(option.value)"
        :value="String(option.value)"
      >
        {{ option.label }}
      </option>
    </select>
    
    <div v-if="hasErrors" class="error-messages">
      <div v-for="(error, index) in errors" :key="index" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  field: {
    type: Object,
    required: true
  },
  value: {
    type: [String, Number, Boolean, null],
    default: null
  },
  errors: {
    type: Array,
    default: () => []
  },
  formData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:value', 'blur'])

const hasErrors = computed(() => props.errors?.length > 0)

const inputType = computed(() => {
  const type = props.field['x-source']?.type
  return type === 'date' ? 'date' : type === 'tel' ? 'tel' : 'text'
})

const stringValue = computed(() => 
  props.value == null ? '' : String(props.value)
)

const isRequired = computed(() => {
  if (props.field.isRequired) return true
  const condition = props.field['x-required_if']
  if (condition?.operator === 'eq') {
    return props.formData[condition.field] === condition.value
  }
  return false
})

const availableOptions = computed(() => {
  const source = props.field['x-source']
  if (!source || source.type !== 'array') return []
  
  if (source.data && !Array.isArray(source.data) && source.data.dependsOn) {
    const dependentValue = props.formData[source.data.dependsOn]
    return source.data.options?.[dependentValue] || []
  }
  
  return Array.isArray(source.data) ? source.data : []
})

const maxDate = computed(() => {
  const minAge = props.field['x-source']?.data?.minAge
  if (props.field['x-source']?.type === 'date' && minAge) {
    const date = new Date()
    date.setFullYear(date.getFullYear() - minAge)
    return date.toISOString().split('T')[0]
  }
  return null
})

const handleInput = (event) => {
  emit('update:value', props.field.key, event.target.value)
}

const handleNumberInput = (event) => {
  emit('update:value', props.field.key, event.target.value.replace(/\D/g, ''))
}

const handleSelectChange = (event) => {
  let value = event.target.value
  if (props.field.type === 'boolean') {
    value = value === 'true' ? true : value === 'false' ? false : null
  }
  emit('update:value', props.field.key, value)
}

const handleFileChange = (event) => {
  const fileName = event.target.files[0]?.name || ''
  emit('update:value', props.field.key, fileName)
  emit('blur', props.field.key)
}

const handleBlurEvent = () => emit('blur', props.field.key)

const getFileName = (value) => value?.includes('/') ? value.split('/').pop() : value || ''
</script>

