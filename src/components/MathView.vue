<template>
  <NodeViewWrapper :class="isBlock ? 'math-block-wrapper' : 'inline-math-wrapper'">
    <div
      v-html="mathmlContent"
      :class="isBlock ? 'math-block-content' : 'inline-math-content'"
      @click="selectNode"
    />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'
import { computed } from 'vue'
import type { NodeViewProps } from '@tiptap/core'

const props = defineProps<NodeViewProps>()

const isBlock = computed(() => props.node.type.name === 'mathBlock')

const mathmlContent = computed(() => {
  const mathml = props.node.attrs.mathml

  // Если это уже MathML элемент, возвращаем как есть
  if (mathml && mathml.trim().startsWith('<math')) {
    return mathml
  }

  // Если это просто текст, оборачиваем в math
  return `<math xmlns="http://www.w3.org/1998/Math/MathML"${isBlock.value ? ' display="block"' : ''}>${mathml || ''}</math>`
})

const selectNode = () => {
  // Можно добавить логику выбора ноды для редактирования
}
</script>

<style scoped>
.inline-math-wrapper {
  display: inline;
  cursor: pointer;
}

.math-block-wrapper {
  display: block;
  margin: 1rem 0;
  text-align: center;
  cursor: pointer;
}

.inline-math-content,
.math-block-content {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.inline-math-content:hover,
.math-block-content:hover {
  background-color: var(--math-hover-bg, rgba(0, 0, 0, 0.05));
}

.math-block-content {
  padding: 8px 12px;
}

/* Улучшаем отображение MathML */
:deep(math) {
  font-size: 1.1em;
  line-height: 1.4;
}

:deep(math[display="block"]) {
  display: block;
  margin: 0.5em auto;
  font-size: 1.2em;
}

/* Стили для дробей */
:deep(mfrac) {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
}

:deep(mfrac > *) {
  display: block;
}

/* Стили для индексов */
:deep(msub),
:deep(msup),
:deep(msubsup) {
  display: inline-block;
  vertical-align: baseline;
}

:deep(msub > *:last-child),
:deep(msup > *:last-child),
:deep(msubsup > *:not(:first-child)) {
  font-size: 0.7em;
}

/* Стили для корней */
:deep(msqrt),
:deep(mroot) {
  display: inline-block;
  padding: 2px;
}
</style>