<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ isBlockFormula ? 'Блочная формула' : 'Строчная формула' }}</h3>
        <button class="close-button" @click="close" title="Закрыть">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">
        <div class="content-container">
          <div class="mathfield-container">
            <math-field ref="mathfieldRef" :value="latex" @input="handleInput">
              {{ latex }}
            </math-field>
          </div>

          <div class="preview-container" v-if="latex">
            <div class="preview-label">Предварительный просмотр:</div>
            <div class="preview-content" v-html="renderedLatex"></div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="button button-secondary" @click="close">Отмена</button>
        <button class="button button-primary" @click="confirm">Вставить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted } from 'vue'
import 'mathlive/static.css'
import katex from 'katex'

// Declare the custom element
declare global {
  interface Window {
    MathfieldElement: any
  }
}

const props = defineProps<{
  isOpen: boolean
  initialLatex?: string
  isBlockFormula?: boolean
}>()

const emit = defineEmits<{
  confirm: [latex: string]
  close: []
}>()

const mathfieldRef = ref<any>(null)
const latex = ref(props.initialLatex || '')

// Computed property for rendered LaTeX using KaTeX
const renderedLatex = computed(() => {
  if (!latex.value) return ''

  try {
    return katex.renderToString(latex.value, {
      throwOnError: false,
      displayMode: props.isBlockFormula
    })
  } catch (e) {
    console.error('KaTeX rendering error:', e)
    return latex.value
  }
})

const handleInput = (event: Event) => {
  const target = event.target as any
  latex.value = target.value
}

const confirm = () => {
  // Hide virtual keyboard before confirming
  if (mathfieldRef.value) {
    mathfieldRef.value.executeCommand('hideVirtualKeyboard')
  }
  emit('confirm', latex.value)
}

const close = () => {
  // Hide virtual keyboard before closing
  if (mathfieldRef.value) {
    mathfieldRef.value.executeCommand('hideVirtualKeyboard')
  }
  emit('close')
}

// Watch for modal opening/closing to manage mathfield and keyboard
watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    latex.value = props.initialLatex || ''
    await nextTick()

    // Import MathLive dynamically when modal opens
    if (!customElements.get('math-field')) {
      await import('mathlive')
    }

    await nextTick()

    if (mathfieldRef.value) {
      mathfieldRef.value.value = latex.value
      // Configure virtual keyboard
      mathfieldRef.value.mathVirtualKeyboardPolicy = 'manual'
      mathfieldRef.value.executeCommand('showVirtualKeyboard')
      mathfieldRef.value.focus()
    }
  } else {
    // Hide virtual keyboard when modal closes
    if (mathfieldRef.value) {
      mathfieldRef.value.executeCommand('hideVirtualKeyboard')
    }
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.modal-content {
  background: #ffffff;
  border-radius: 0;
  box-shadow: none;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.close-button {
  padding: 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: auto;
  height: auto;
}

.close-button:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.content-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.mathfield-container {
  margin-bottom: 20px;
}

.mathfield-container math-field {
  display: block;
  width: 100%;
  padding: 12px;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 24px;
  min-height: 80px;
  background: #ffffff;
  transition: border-color 0.15s ease;
}

.mathfield-container math-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.preview-container {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.preview-content {
  font-size: 20px;
  color: #1f2937;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button-secondary {
  background: #ffffff;
  color: #374151;
  border: 1px solid #d1d5db;
}

.button-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.button-primary {
  background: #3b82f6;
  color: #ffffff;
}

.button-primary:hover {
  background: #2563eb;
}
</style>

<style>
/* Global styles for MathLive virtual keyboard */
.ML__keyboard {
  z-index: 10001 !important;
  position: fixed !important;
  bottom: 0 !important;
}
</style>