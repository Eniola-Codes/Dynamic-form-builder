<template>
  <div class="page-container">
    <div class="container">
      <header class="page-header">
        <h1>Dynamic Form Builder</h1>
        <p class="subtitle">Upload or paste your JSON schema to generate a dynamic form</p>
      </header>
      
      <div v-if="!formSchema" class="schema-section">
        <SchemaInput @schema-loaded="handleSchemaLoaded" />
      </div>
      
      <div v-if="formSchema" class="form-section">
        <div class="form-header-actions">
          <button @click="resetForm" class="reset-schema-btn">
            Change Schema
          </button>
        </div>
        
        <div class="form-container">
          <FormBuilder :schema="formSchema" @submit="handleSubmit" />
        </div>
        
        <div v-if="submittedData" class="submitted-data">
          <h2>Submitted Data</h2>
          <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const formSchema = ref(null)
const submittedData = ref(null)

const handleSchemaLoaded = (schema) => {
  formSchema.value = schema
  submittedData.value = null
}

const resetForm = () => {
  formSchema.value = null
  submittedData.value = null
}

const handleSubmit = (formData) => {
  console.log('Form submitted:', formData)
  submittedData.value = formData
  
  setTimeout(() => {
    const element = document.querySelector('.submitted-data')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}
</script>