<template>
  <node-view-wrapper class="flex-column">
    <input
      type="text"
      class="column-title-input"
      :value="node.attrs.title"
      @input="updateTitle"
      contenteditable="false"
    />
    <node-view-content class="column-content" />
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

const updateTitle = (e: Event) => {
  const target = e.target as HTMLInputElement
  props.updateAttributes({
    title: target.value,
  })
}
</script>

<style scoped>
.flex-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.column-title-input {
  width: 100%;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 600;
  padding: 8px;
  border: 1px solid var(--menu-border);
  border-radius: 4px;
  background: var(--menu-bg);
  color: var(--button-text);
}

.column-title-input:focus {
  outline: 2px solid #8850CE;
  outline-offset: -1px;
}

.column-content {
  padding: 12px;
  min-height: 80px;
  border: 1px solid var(--menu-border);
  border-radius: 4px;
  background: var(--button-bg);
  overflow-wrap: break-word;
}

.column-content:focus {
  outline: 2px solid #8850CE;
  outline-offset: -1px;
}
</style>