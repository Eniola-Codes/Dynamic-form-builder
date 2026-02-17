<template>
  <div class="schema-input-container">
    <div class="schema-input-header">
      <h2>Provide Your Schema</h2>
      <p class="schema-description">
        Upload a JSON file or paste your schema below.
      </p>
    </div>

    <div class="input-methods">
      <div class="input-method">
        <label class="method-label">
          <input
            type="file"
            accept=".json,application/json"
            @change="handleFileUpload"
            class="file-input-hidden"
            ref="fileInput"
          />
          <div class="file-upload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Upload JSON File
          </div>
        </label>
        <p v-if="uploadedFileName" class="file-name-display">
          {{ uploadedFileName }}
        </p>
      </div>

      <div class="divider">
        <span>OR</span>
      </div>

      <div class="input-method">
        <label class="method-label">Paste JSON Schema</label>
        <textarea
          v-model="jsonText"
          placeholder='Paste your JSON schema here'
          class="json-textarea"
          rows="10"
        ></textarea>
      </div>

    </div>

    <div v-if="error" class="error-container">
      <div class="error-message">
        <strong>Error:</strong> {{ error }}
      </div>
    </div>

    <div class="action-buttons">
      <button
        @click="handleGenerateForm"
        :disabled="!hasSchema || isLoading"
        class="generate-btn"
      >
        {{ isLoading ? 'Generating...' : 'Generate Form' }}
      </button>
      <button
        v-if="hasSchema"
        @click="clearSchema"
        class="clear-btn"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['schema-loaded'])

const fileInput = ref(null)
const jsonText = ref('')
const uploadedFileName = ref('')
const error = ref('')
const isLoading = ref(false)

const hasSchema = computed(() => {
  return jsonText.value.trim().length > 0
})

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploadedFileName.value = file.name
  error.value = ''

  try {
    const text = await file.text()
    jsonText.value = text
  } catch (err) {
    error.value = 'Failed to read file: ' + err.message
    uploadedFileName.value = ''
    jsonText.value = ''
  }
}

const validateAndEmitSchema = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString)
    
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Schema must be a JSON object')
    }

    if (!parsed.properties || typeof parsed.properties !== 'object') {
      throw new Error('Schema must have a "properties" object')
    }

    error.value = ''
    emit('schema-loaded', parsed)
  } catch (err) {
    if (err instanceof SyntaxError) {
      error.value = 'Invalid JSON format: ' + err.message
    } else {
      error.value = err.message
    }
  }
}

const handleGenerateForm = () => {
  if (!hasSchema.value) return
  
  isLoading.value = true
  validateAndEmitSchema(jsonText.value)
  isLoading.value = false
}

const clearSchema = () => {
  jsonText.value = ''
  uploadedFileName.value = ''
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>
