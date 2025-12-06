<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="title"
    class="ui-blue-button"
    :class="buttonClass"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  title?: string
  buttonClass?: string
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.ui-blue-button {
  padding: 3px 5px;
  border: none;
  background: var(--link-color);
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: white;
  transition: all 0.15s ease;
  min-width: 200px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}


ui-blue-button:hover:not(:disabled) {
  opacity: .9;
}

ui-blue-button:active:not(:disabled) {
  opacity: .9;
}

ui-blue-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
