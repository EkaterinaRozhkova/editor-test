<template>
  <node-view-wrapper class="flex-shortcode-container">
    <div class="flex-columns">
      <div v-for="(col, index) in columns" :key="index" class="flex-column">
        <input
          type="text"
          class="column-title-input"
          :value="col.title"
          @input="(e) => updateTitle(index, (e.target as HTMLInputElement).value)"
          contenteditable="false"
        />
        <div
          :ref="(el) => setContentRef(el as HTMLElement, index)"
          class="column-content"
          contenteditable="true"
          @blur="(e) => updateText(index, (e.target as HTMLElement).innerText)"
          @keydown="handleKeydown"
        ></div>
      </div>
    </div>
    <button
      class="delete-button"
      contenteditable="false"
      @click="deleteNode"
      title="Удалить"
    >✕</button>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import type { NodeViewProps } from '@tiptap/vue-3'

const props = defineProps<NodeViewProps>()

interface Column {
  title: string
  text: string
}

const columns = ref<Column[]>([])
const contentRefs = ref<Map<number, HTMLElement>>(new Map())

onMounted(() => {
  columns.value = props.node.attrs.columns || []
})

const setContentRef = (el: HTMLElement | null, index: number) => {
  if (el && !contentRefs.value.has(index)) {
    contentRefs.value.set(index, el)
    // Устанавливаем начальное содержимое
    const col = columns.value[index]
    if (col && el.innerText !== col.text) {
      el.innerText = col.text
    }
  }
}

const handleKeydown = (e: Event) => {
  // Предотвращаем обработку Enter редактором TipTap
  const event = e as KeyboardEvent
  if (event.key === 'Enter') {
    event.stopPropagation()
  }
}

const updateTitle = (index: number, title: string) => {
  const newColumns = [...columns.value]
  const currentCol = newColumns[index]
  if (!currentCol) return

  newColumns[index] = { title, text: currentCol.text }
  columns.value = newColumns

  props.updateAttributes({
    columns: newColumns
  })
}

const updateText = (index: number, text: string) => {
  const newColumns = [...columns.value]
  const currentCol = newColumns[index]
  if (!currentCol) return

  newColumns[index] = { title: currentCol.title, text }
  columns.value = newColumns

  props.updateAttributes({
    columns: newColumns
  })
}

const deleteNode = () => {
  props.deleteNode()
}
</script>

<style scoped>
.flex-shortcode-container {
  position: relative;
  border: 2px solid var(--menu-border);
  border-radius: 8px;
  padding: 5px;
  margin: 5px 0;
  background: var(--editor-content);
}

.flex-columns {
  display: flex;
  width: 100%;
  gap: 10px;
}

.flex-column {
  flex: 1;
  min-width: 0;
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
  word-wrap: break-word;
  overflow-wrap: break-word;
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
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  cursor: text;
}

.column-content:focus {
  outline: 2px solid #8850CE;
  outline-offset: -1px;
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
