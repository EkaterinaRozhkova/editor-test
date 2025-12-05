<template>
  <NodeViewWrapper
    class="header-shortcode-node"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Сам текст шорткода, как обычный текст -->
    <span class="header-shortcode-node__text">
      [header]{{ node.attrs.text }}[/header]
    </span>

    <!-- Кнопка редактирования появляется только при наведении -->
    <button
      v-if="isHovered"
      type="button"
      class="header-shortcode-node__edit-btn"
      @click.stop="openEditor"
    >
      ✏️
    </button>

    <!-- Попап с инпутом -->
    <div
      v-if="isEditing"
      class="header-shortcode-node__popover"
      @click.stop
    >
      <input
        v-model="localText"
        type="text"
        class="header-shortcode-node__input"
        @keydown.enter.prevent="save"
      />
      <div class="header-shortcode-node__actions">
        <button type="button" @click="save">OK</button>
        <button type="button" @click="cancel">Отмена</button>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const isHovered = ref(false)
const isEditing = ref(false)
const localText = ref<string>(props.node.attrs.text || '')

watch(
  () => props.node.attrs.text,
  newVal => {
    if (!isEditing.value) {
      localText.value = newVal || ''
    }
  },
)

const openEditor = () => {
  isEditing.value = true
  localText.value = props.node.attrs.text || ''
}

const save = () => {
  props.updateAttributes({
    text: localText.value,
  })
  isEditing.value = false
}

const cancel = () => {
  isEditing.value = false
}
</script>

<style scoped>
.header-shortcode-node {
  display: inline-flex;
  align-items: center;
  position: relative;
}

/* Шорткод выглядит как обычный текст, без цвета/рамок */
.header-shortcode-node__text {
  /* без фона, без border */
  font: inherit;
}

/* Кнопка редактирования */
.header-shortcode-node__edit-btn {
  margin-left: 4px;
  font-size: 12px;
  cursor: pointer;
  background: transparent;
  border: none;
  padding: 0 2px;
}

/* Попап */
.header-shortcode-node__popover {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 50;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.header-shortcode-node__input {
  width: 220px;
  font-size: 14px;
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.header-shortcode-node__actions {
  margin-top: 4px;
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.header-shortcode-node__actions button {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  cursor: pointer;
}
</style>
