<template>
  <node-view-wrapper class="row-shortcode-container">
    <node-view-content class="row-blocks" />
    <button
      class="delete-button"
      contenteditable="false"
      @click="deleteNode"
      title="Удалить"
    >✕</button>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const deleteNode = () => {
  props.deleteNode()
}
</script>

<style scoped>
.row-shortcode-container {
  position: relative;
  border: 2px solid var(--menu-border);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background: var(--editor-content);
}

.row-blocks {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.delete-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  color: var(--button-text);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.15s ease;
}

.delete-button:hover {
  background: var(--button-hover-bg);
  border-color: var(--button-hover-border);
}
</style>