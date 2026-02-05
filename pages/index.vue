<template>
  <div class="page-container">
    <div class="container">
      <header class="page-header">
        <h1>Dynamic Form Builder</h1>
        <p class="subtitle">Fill out the form below with your information</p>
      </header>
      
      <div class="form-container">
        <FormBuilder :schema="formSchema" @submit="handleSubmit" />
      </div>
      
      <div v-if="submittedData" class="submitted-data">
        <h2>Submitted Data</h2>
        <pre>{{ JSON.stringify(submittedData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import formSchema from '~/data/schema.json'

const submittedData = ref(null)

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