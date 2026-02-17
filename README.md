# Dynamic Form Builder

A dynamic form builder built with Nuxt.js that accepts a JSON schema and renders a fully functional form with validations, conditional logic, and dependent fields.

## Features

- ✅ **Schema Input**: Upload a JSON file or paste your schema directly into the application
- ✅ **Dynamic Field Rendering**: Parses JSON schema and renders form fields automatically
- ✅ **Field Ordering**: Respects `x-order` property to display fields in the correct sequence
- ✅ **Multiple Field Types**: Supports text, tel, number, date, file upload, and dropdown/select fields
- ✅ **Comprehensive Validation**: 
  - Required field validation
  - Pattern matching (regex)
  - Minimum length validation
  - Date constraints (minimum age)
  - Custom error messages
- ✅ **Conditional Logic**:
  - `x-required_if`: Fields become required based on other field values
  - `if-then-else`: Complex conditional field requirements
- ✅ **Dependent Dropdowns**: Dropdown options that change based on another field's value
- ✅ **Real-time Validation**: Fields are validated as users interact with them
- ✅ **Modern UI/UX**: Clean, responsive design with smooth animations

## Setup Instructions

### Prerequisites

- **Node.js 18.x or higher** (required for Nuxt 3.13.0)
- npm or yarn package manager

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:3000`

4. **Provide your schema**:
   - Upload a JSON file containing your schema, OR
   - Paste your JSON schema into the text area

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
dynamic-form-builder/
├── components/
│   ├── FormBuilder.vue      # Main form builder component
│   ├── FormField.vue         # Individual field renderer
│   └── SchemaInput.vue       # Schema input component (file upload & paste)
├── composables/
│   ├── useFormState.ts       # Form state management
│   ├── useFormValidation.ts  # Validation logic
│   └── useConditionalLogic.ts # Conditional field logic
├── types/
│   └── form.ts               # TypeScript type definitions
├── pages/
│   └── index.vue            # Main page displaying the form
├── assets/
│   └── css/
│       └── main.css         # Global styles
├── app.vue                  # Root component
├── nuxt.config.ts           # Nuxt configuration
└── package.json             # Project dependencies
```

## How It Works

### Getting Started

1. **Provide Your Schema**: When you first open the application, you'll see a schema input interface where you can:
   - **Upload a JSON file**: Click "Upload JSON File" and select your schema file
   - **Paste JSON**: Type or paste your JSON schema directly into the text area

2. **Generate Form**: Once you've provided a valid schema, click "Generate Form" to create the dynamic form

3. **Fill and Submit**: Fill out the generated form and submit to see the results

### Schema Structure

The form builder accepts a JSON schema with the following structure:

- **Standard JSON Schema properties**: `type`, `required`, `properties`, `pattern`, `minLength`, etc.
- **Custom `x-*` properties**:
  - `x-label`: Field label to display
  - `x-description`: Placeholder/description text
  - `x-order`: Display order (0 = first)
  - `x-source`: Defines input type and data source
  - `x-required_if`: Conditional requirement based on another field

### Field Types

1. **Text Input** (`x-source.type: "text"`)
   - Standard text input field

2. **Phone Input** (`x-source.type: "tel"`)
   - Telephone number input

3. **Number Input** (`x-source.type: "number"`)
   - Numeric input (only digits allowed)

4. **Date Picker** (`x-source.type: "date"`)
   - Date input with optional `minAge` constraint in `x-source.data.minAge`

5. **File Upload** (`x-source.type: "file"`)
   - File input with `accept` and `fileType` in `x-source.data`

6. **Dropdown/Select** (`x-source.type: "array"`)
   - Select dropdown with options in `x-source.data`
   - Supports dependent options via `x-source.data.dependsOn`

### Conditional Logic

#### x-required_if

Fields can become conditionally required based on another field's value:

```json
{
  "x-required_if": {
    "field": "has_nin",
    "value": true,
    "operator": "eq"
  }
}
```

#### if-then-else

Complex conditional requirements using JSON Schema's if-then-else:

```json
{
  "if": {
    "properties": {
      "purchase_type": { "const": "lease" }
    }
  },
  "then": {
    "required": ["lease_agreement_url"]
  },
  "else": {
    "required": ["proof_of_ownership_url"]
  }
}
```

### Dependent Dropdowns

Dropdowns can have options that depend on another field:

```json
{
  "x-source": {
    "type": "array",
    "data": {
      "dependsOn": "vehicle_make",
      "options": {
        "toyota": [...],
        "honda": [...]
      }
    }
  }
}
```

## Approach & Architecture

### Component Architecture

The solution uses a composable-based architecture with three main components:

1. **SchemaInput.vue**: 
   - Handles user schema input (file upload or JSON paste)
   - Validates JSON schema structure
   - Emits validated schema to parent component

2. **FormBuilder.vue**: 
   - Parses the JSON schema
   - Orchestrates form state, validation, and conditional logic
   - Coordinates field updates
   - Uses composables for business logic

3. **FormField.vue**:
   - Renders individual field types
   - Handles field-specific logic (e.g., dependent dropdowns)
   - Displays validation errors

4. **Composables** (business logic layer):
   - `useFormState.ts`: Manages form data, errors, and touched fields
   - `useFormValidation.ts`: Handles all validation rules
   - `useConditionalLogic.ts`: Manages conditional field visibility and requirements

### State Management

- Uses Vue 3's Composition API with `ref` and `computed`
- Form data stored in a reactive `formData` object
- Validation errors stored in a reactive `errors` object
- Tracks touched fields to control when errors are displayed
- Validation occurs on field blur and form submit (not while typing)
- State management extracted to `useFormState` composable for reusability

### Validation Strategy

1. **Required Field Validation**: Checks both base `required` array and conditional requirements
2. **Pattern Validation**: Uses RegExp to validate field patterns
3. **Length Validation**: Checks `minLength` constraints
4. **Date Validation**: Calculates age from date of birth for `minAge` constraints
5. **Validation Timing**: 
   - Fields are validated on blur (when user leaves the field)
   - All fields are validated on form submit
   - Touched fields are re-validated as user types (to clear errors immediately)

### Conditional Logic Implementation

1. **Field Visibility**: Fields are hidden/shown based on if-then-else conditions
2. **Dynamic Requirements**: Required status recalculated based on `x-required_if` conditions
3. **Dependent Field Reset**: When a parent field changes, dependent fields are cleared

## Trade-offs & Design Decisions

### 1. File Upload Handling

**Decision**: File uploads currently store the filename rather than uploading to a server.

**Rationale**: Without a backend API, we can't perform actual file uploads. In production, you would:
- Upload files to a storage service (S3, Cloudinary, etc.)
- Store the returned URL in the form data
- Validate file types and sizes on the server

**Trade-off**: The form accepts file selections but doesn't handle actual uploads.

### 2. Validation Timing

**Decision**: Real-time validation on blur and value change.

**Rationale**: Provides immediate feedback without being too aggressive. Users see errors after interacting with a field, not while typing.

**Trade-off**: Some users might prefer validation only on submit, but real-time provides better UX.

### 3. Conditional Logic Complexity

**Decision**: Implemented both `x-required_if` and `if-then-else` logic.

**Rationale**: The schema uses both patterns, so both are needed. The if-then-else logic is more complex but handles the purchase_type scenario elegantly.

**Trade-off**: More complex code, but handles all schema requirements.

### 4. Component Structure

**Decision**: Separate FormBuilder and FormField components.

**Rationale**: 
- Separation of concerns: FormBuilder handles orchestration, FormField handles rendering
- Reusability: FormField can be used independently
- Maintainability: Easier to test and modify individual components

**Trade-off**: Slightly more files, but better organization.

### 5. Styling Approach

**Decision**: Centralized CSS in `assets/css/main.css` with all styles in a single file.

**Rationale**: 
- All styles consolidated in one location (`assets/css/main.css`) for easier maintenance
- No scoped styles or component-level stylesheets
- Global styles ensure consistent base styling across all components
- No external CSS framework dependency keeps bundle size small
- Cleaner component files (no `<style>` blocks in components)

**Trade-off**: More manual styling, but full control, smaller bundle, better organization, and easier global style management.

### 6. Schema Input Approach

**Decision**: Users must provide their own schema via file upload or JSON paste (no sample/predefined schemas).

**Rationale**:
- Makes the form builder truly dynamic and flexible
- Users can use any schema format that follows the expected structure
- No hardcoded dependencies on specific schema files
- Cleaner codebase without sample data files

**Trade-off**: Users need to provide their own schema, but this makes the tool more versatile and reusable.

### 7. TypeScript Integration

**Decision**: Use TypeScript for composables and type definitions.

**Rationale**:
- Type safety for form schema and data structures
- Better IDE support and autocomplete
- Catch errors at compile time
- Self-documenting code through types

**Trade-off**: Slightly more verbose, but significantly better developer experience and code quality.

## Manual testing

To test the form:

1. **Schema Input**:
   - Upload a valid JSON schema file
   - Paste a JSON schema into the text area
   - Test with invalid JSON to see error handling
   - Test with schema missing `properties` to see validation

2. **Form Generation**:
   - Generate form from valid schema
   - Test "Change Schema" button to reset and load new schema

3. **Form Functionality**:
   - Fill out required fields
   - Test conditional logic (if your schema includes it)
   - Test dependent dropdowns (if your schema includes them)
   - Test validations:
     - Try submitting with empty required fields
     - Enter invalid patterns or formats
     - Test date constraints if applicable

## License

This project is created for assessment purposes.