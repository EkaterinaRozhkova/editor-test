<template>
  <div class="base-editor" v-if="editor">
    <EditorMenuBar :editor="editor" />
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import Mathematics from '@tiptap/extension-mathematics'
import { all, createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { CustomOrderedList } from '../extensions/CustomOrderedList'
import EditorMenuBar from './EditorMenuBar.vue'
import LZString from 'lz-string'
import 'katex/dist/katex.min.css'
import { convertMathMLToLatex, convertLatexToMathML } from "@/utils/mathConverter.ts"

const lowlight = createLowlight(all)

const isContentInitialized = ref(false)

const sendContentUpdate = useDebounceFn(() => {
  if (isContentInitialized.value && editor.value) {
    const html = editor.value.getHTML()

    // Конвертируем LaTeX в MathML перед отправкой родителю
    const htmlWithMathML = convertLatexToMathML(html)

    const compressed = LZString.compressToEncodedURIComponent(htmlWithMathML)

    window.parent.postMessage({
      type: 'content-update',
      data: compressed
    }, '*')
  }
}, 500)

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      orderedList: false,
    }),
    CustomOrderedList,
    CodeBlockLowlight.configure({
      lowlight,
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
    Mathematics.configure({
      katexOptions: {
        throwOnError: false,
        displayMode: false,
        output: 'html',
        trust: false,
        strict: false,
      },
    }),
  ],
  content: '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: () => {
    sendContentUpdate()
  }
})

// Обработчик сообщений от родителя
const handleMessage = (event: MessageEvent) => {
  if (event.data.type === 'init-content' && editor.value) {

    try {
      // Декомпрессия данных
      const html = LZString.decompressFromEncodedURIComponent(event.data.data)
      const contentWithLatex = convertMathMLToLatex(html)

      // Устанавливаем контент с LaTeX текстом (без конвертации в math nodes)
      editor.value.commands.setContent(contentWithLatex)

      setTimeout(() => {
        isContentInitialized.value = true
      }, 100)
    } catch (error) {
      console.error('Ошибка декомпрессии контента:', error)
    }
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
  if (!editor.value) return undefined

  const html = editor.value.getHTML()
  // Конвертируем LaTeX в MathML перед возвратом
  return convertLatexToMathML(html)
}


const getCompressed = () => {
  if (!editor.value) return null

  const html = editor.value.getHTML()
  // Конвертируем LaTeX в MathML перед сжатием
  const htmlWithMathML = convertLatexToMathML(html)
  return LZString.compressToEncodedURIComponent(htmlWithMathML)
}


defineExpose({
  getHTML,
  getCompressed,
  editor
})
</script>

<style>
.base-editor {
  width: 641px;

  :focus {
    outline: none;
  }
}

.editor-content {
  padding: 10px 24px 5px 24px;
  overflow: auto;
  font-size: 17px;
  line-height: 22px;
  height: 320px;
  background-color: var(--editor-content);
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-bg) var(--scrollbar-color);
}

.editor-content::-webkit-scrollbar {
  width: 4px;
}

.ProseMirror code {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--menu-bg);
  border: 1px solid var(--menu-border);
}


/* Стили для списков */
.ProseMirror ol {
  padding-left: 24px;
  margin: 12px 0;
}

.ProseMirror blockquote {
  border-left: 3px solid var(--menu-border);
  margin: 1.5rem 0;
  padding-left: 1rem;
}

.ProseMirror h1 {
  font-size: 28px;
  line-height: 28px;
  font-weight: 600;
  margin-bottom: 16px;
}

.ProseMirror h2 {
  font-size: 21px;
  line-height: 25px;
  font-weight: 600;
  margin-bottom: 16px;
}
.ProseMirror h3 {
  font-size: 18px;
  line-height: 22px;
  font-weight: 600;
  margin-bottom: 16px;
}

.ProseMirror ol li {
  margin: 4px 0;
}

.ProseMirror ul {
  list-style-type: disc;
  padding-left: 24px;
  margin: 12px 0;
}

.ProseMirror ul li {
  margin: 4px 0;
}
</style>
