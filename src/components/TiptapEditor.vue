
<template>
  <div class="tiptap-editor" v-if="editor">
    <EditorMenuBar :editor="editor" />
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import EditorMenuBar from './EditorMenuBar.vue'

const editor = useEditor({
  extensions: [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        target: '_blank',
        rel: 'noopener noreferrer',
      },
    }),
    Image.configure({
      inline: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
    }),
    Subscript,
    Superscript,
    Highlight.configure({
      multicolor: false,
    }),
  ],
  content: `
    <h1>Добро пожаловать в TipTap редактор!</h1>
  `,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    // Отправляем обновленный HTML контент в родительское окно
    window.parent.postMessage({
      type: 'editor-update',
      content: editor.getHTML()
    }, '*')
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const getHTML = () => {
  return editor.value?.getHTML()
}

defineExpose({
  getHTML,
  editor
})
</script>

<style scoped>
.tiptap-editor {
  background: white;
  overflow: hidden;
  width: 910px;
}

.editor-content {
  padding: 20px;
  min-height: 300px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0.75em 0;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
}

.editor-content :deep(.ProseMirror h3) {
  font-size: 1.17em;
  font-weight: bold;
  margin: 0.83em 0;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.75em 0;
}

.editor-content :deep(.ProseMirror li) {
  margin: 0.25em 0;
}

.editor-content :deep(.ProseMirror code) {
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.editor-content :deep(.ProseMirror pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
}

.editor-content :deep(.ProseMirror pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.editor-content :deep(.ProseMirror blockquote) {
  border-left: 3px solid #3b82f6;
  padding-left: 1em;
  margin: 1em 0;
  color: #64748b;
  font-style: italic;
}

.editor-content :deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 2em 0;
}

.editor-content :deep(.ProseMirror strong) {
  font-weight: bold;
}

.editor-content :deep(.ProseMirror em) {
  font-style: italic;
}

.editor-content :deep(.ProseMirror s) {
  text-decoration: line-through;
}

/* Стили для ссылок */
.editor-content :deep(.ProseMirror a) {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.ProseMirror a:hover) {
  color: #2563eb;
}

/* Стили для изображений */
.editor-content :deep(.ProseMirror img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

/* Стили для выравнивания текста */
.editor-content :deep(.ProseMirror [style*="text-align: left"]) {
  text-align: left;
}

.editor-content :deep(.ProseMirror [style*="text-align: center"]) {
  text-align: center;
}

.editor-content :deep(.ProseMirror [style*="text-align: right"]) {
  text-align: right;
}

.editor-content :deep(.ProseMirror [style*="text-align: justify"]) {
  text-align: justify;
}

/* Стили для highlight */
.editor-content :deep(.ProseMirror mark) {
  background-color: #fef08a;
  padding: 2px 0;
  border-radius: 2px;
}

/* Стили для подстрочного и надстрочного текста */
.editor-content :deep(.ProseMirror sub) {
  vertical-align: sub;
  font-size: 0.75em;
}

.editor-content :deep(.ProseMirror sup) {
  vertical-align: super;
  font-size: 0.75em;
}
</style>
