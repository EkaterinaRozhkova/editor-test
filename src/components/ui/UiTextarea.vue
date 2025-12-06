<template>
  <textarea
    :placeholder="placeholder"
    :disabled="disabled"
    class="ui-textarea"
    :value="modelValue"
    @input="onInput"
  />

</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.ui-textarea {
  padding: 6px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  font-size: 14px;
  color: var(--button-text);
  font-family: inherit;
  width: 100%;
  flex-grow: 1;
  min-height: 80%;

  &:focus {
    outline: none;
    border-color: var(--button-hover-border);
  }
}

</style>
