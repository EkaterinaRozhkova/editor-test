<template>
  <div class="tiptap-editor" v-if="editor">
    <EditorMenuBar :editor="editor" />
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import EditorMenuBar from './EditorMenuBar.vue'

const isContentInitialized = ref(false)

const sendContentUpdate = useDebounceFn((content: string) => {
  if (isContentInitialized.value) {
    window.parent.postMessage({
      type: 'content-update',
      content
    }, '*')
  }
}, 500)

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
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    const currentContent = editor.getHTML()
    sendContentUpdate(currentContent)
  }
})

// Обработчик сообщений от родителя
const handleMessage = (event: MessageEvent) => {

  if (event.data.type === 'init-content' && editor.value) {
    editor.value.commands.setContent(event.data.content || '')

    setTimeout(() => {
      isContentInitialized.value = true
    }, 100)
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  window.parent.postMessage({
    type: 'editor-ready'
  }, '*')
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
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
  background: var(--editor-bg);
  @import url('https://fonts.googleapis.com/css2?family=Wix+Madefor+Text:ital,wght@0,400..800;1,400..800&display=swap');
  font-family: "Wix Madefor Text", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  width: 641px;
}

.editor-content {
  padding: 24px 24px 0 24px;
  overflow: auto;
  font-size: 17px;
  line-height: 22px;
  height: 320px;
  background-color: #fcfcfd;
}
</style>
