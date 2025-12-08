<template>
  <button
    :type="type"
    :disabled="disabled"
    :title="title"
    class="button"
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

<style>
button {
  padding: 3px 5px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  border-radius: 4px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 500;
  color: var(--button-text);
  transition: all 0.15s ease;
  min-width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

button :deep(svg) {
  display: block;
}

button:hover:not(:disabled) {
  opacity: .9;
}

button:active:not(:disabled) {
  opacity: .9;
}

button.is-active {
  background-color: var(--link-color);
  color: white;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
