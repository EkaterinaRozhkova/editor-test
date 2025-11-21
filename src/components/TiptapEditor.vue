
<template>
  <div class="tiptap-editor">
    <div class="menu-bar" v-if="editor">
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        type="button"
      >
        Bold
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        type="button"
      >
        Italic
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        type="button"
      >
        Strike
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        type="button"
      >
        H1
      </button>
      <button
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        type="button"
      >
        H2
      </button>
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        type="button"
      >
        Bullet List
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        type="button"
      >
        Ordered List
      </button>
      <button
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        type="button"
      >
        Blockquote
      </button>
      <button
        @click="editor.chain().focus().setHorizontalRule().run()"
        type="button"
      >
        Horizontal Rule
      </button>
      <button
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        type="button"
      >
        Undo
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        type="button"
      >
        Redo
      </button>
    </div>
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { onMounted, onBeforeUnmount } from 'vue'

const editor = useEditor({
  content: '<h1>Добро пожаловать в Tiptap редактор!</h1><p>Это <strong>мощный</strong> и <em>гибкий</em> редактор для Vue 3.</p><p>Попробуйте использовать кнопки выше для форматирования текста или просто начните печатать!</p>',
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    // Отправляем JSON контент в родительское окно при каждом изменении
    const json = editor.getJSON()

    window.parent.postMessage({
      type: 'tiptap-content-change',
      content: json
    }, '*')
  },
})

// Обработчик сообщений от родительского окна
const handleParentMessage = (event: MessageEvent) => {
  if (!editor.value) return

  // Устанавливаем контент из родительского окна
  if (event.data.type === 'set-tiptap-content') {
    editor.value.commands.setContent(event.data.content)
  }
}

onMounted(() => {
  // Добавляем слушатель сообщений от родительского окна
  window.addEventListener('message', handleParentMessage)

  // Отправляем сообщение о готовности редактора
  window.parent.postMessage({
    type: 'tiptap-ready'
  }, '*')
})

onBeforeUnmount(() => {
  // Удаляем слушатель при размонтировании компонента
  window.removeEventListener('message', handleParentMessage)
})
</script>

<style scoped>
.tiptap-editor {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.menu-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.menu-bar button {
  padding: 6px 12px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  transition: all 0.2s;
}

.menu-bar button:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.menu-bar button.is-active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.menu-bar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-content {
  padding: 16px;
  min-height: 400px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
}

.editor-content :deep(.ProseMirror > * + *) {
  margin-top: 0.75em;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: bold;
  line-height: 1.2;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: bold;
  line-height: 1.3;
}

.editor-content :deep(.ProseMirror p) {
  line-height: 1.6;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 1.5em;
}

.editor-content :deep(.ProseMirror blockquote) {
  padding-left: 1em;
  border-left: 3px solid #cbd5e1;
  font-style: italic;
  color: #64748b;
}

.editor-content :deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e2e8f0;
  margin: 2em 0;
}

.editor-content :deep(.ProseMirror code) {
  background: #f1f5f9;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.editor-content :deep(.ProseMirror pre) {
  background: #1e293b;
  color: #e2e8f0;
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}

.editor-content :deep(.ProseMirror pre code) {
  background: none;
  padding: 0;
  color: inherit;
}
</style>
