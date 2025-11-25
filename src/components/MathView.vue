<template>
  <NodeViewWrapper :class="isBlock ? 'math-block-wrapper' : 'inline-math-wrapper'">
    <span
      v-html="renderedContent"
      :class="isBlock ? 'math-block-content' : 'inline-math-content'"
      @click="selectNode"
    />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'
import { computed, ref, watchEffect } from 'vue'
import type { NodeViewProps } from '@tiptap/core'
import { renderLatex } from '../utils/mathjaxRenderer'

const props = defineProps<NodeViewProps>()

const isBlock = computed(() => props.node.type.name === 'mathBlock')
const renderedContent = ref('')

// Рендерим LaTeX через MathJax при изменении
watchEffect(async () => {
  const latex = props.node.attrs.latex

  console.log('[MathView] Rendering math:', {
    latex: latex ? latex.substring(0, 50) : 'empty',
    isBlock: isBlock.value,
    nodeType: props.node.type.name
  })

  if (!latex) {
    renderedContent.value = ''
    return
  }

  try {
    // Используем MathJax для красивого рендеринга
    const rendered = await renderLatex(latex, isBlock.value)
    console.log('[MathView] Rendered:', rendered.substring(0, 100))
    renderedContent.value = rendered
  } catch (error) {
    console.error('[MathView] Error rendering LaTeX:', error)
    // Fallback: показываем оригинальный LaTeX в code блоке
    renderedContent.value = `<code>${latex}</code>`
  }
})

const selectNode = () => {
  // Можно добавить логику выбора ноды для редактирования
}
</script>

<style scoped>
.inline-math-wrapper {
  display: inline-block;
  vertical-align: middle;
  margin: 0 2px;
  max-width: 100%;
}

.math-block-wrapper {
  display: block;
  margin: 1rem 0;
  text-align: center;
  overflow-x: auto;
}

.inline-math-content,
.math-block-content {
  display: inline-block;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
  max-width: 100%;
}

.inline-math-content:hover,
.math-block-content:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.math-block-content {
  padding: 8px 12px;
}

/* Стили для SVG, генерируемых MathJax */
:deep(svg) {
  display: inline-block;
  vertical-align: middle;
  max-width: 100%;
  height: auto;
  /* Ограничиваем максимальную высоту */
  max-height: 3em;
}

:deep(.math-block-content svg) {
  display: block;
  margin: 0 auto;
  /* Для блочных формул разрешаем большую высоту */
  max-height: 8em;
}

/* Улучшаем отображение MathML (fallback если MathJax не сработал) */
:deep(math) {
  font-size: 1em;
  line-height: 1.4;
}

:deep(math[display="block"]) {
  display: block;
  margin: 0.5em auto;
  font-size: 1em;
}

/* Исправляем позиционирование MathJax элементов */
:deep(.MathJax) {
  display: inline-block !important;
  vertical-align: middle;
}

:deep(mjx-container) {
  display: inline-block !important;
  margin: 0 !important;
}

:deep(mjx-container[display="block"]) {
  display: block !important;
  margin: 0.5em 0 !important;
  text-align: center;
}
</style>