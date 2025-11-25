<template>
  <div class="base-editor" v-if="editor">
    <EditorMenuBar :editor="editor" />
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, nextTick } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Highlight from '@tiptap/extension-highlight'
import { all, createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { CustomOrderedList } from '../extensions/CustomOrderedList'
import { InlineMath, MathBlock } from '../extensions/MathExtension'
import EditorMenuBar from './EditorMenuBar.vue'
import LZString from 'lz-string'

const lowlight = createLowlight(all)
const isContentInitialized = ref(false)

const sendContentUpdate = useDebounceFn(() => {
  if (isContentInitialized.value && editor.value) {
    // Отправляем HTML как есть - с MathML внутри
    const html = editor.value.getHTML()
    const compressed = LZString.compressToEncodedURIComponent(html)

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
    InlineMath,
    MathBlock,
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

const handleMessage = (event: MessageEvent) => {
  if (event.data.type === 'init-content' && editor.value) {
    try {
      // Декомпрессия и установка контента КАК ЕСТЬ
      const html = LZString.decompressFromEncodedURIComponent(event.data.data)

      editor.value.commands.setContent(html)

      nextTick(() => {
        setTimeout(() => {
          isContentInitialized.value = true
        }, 100)
      })
    } catch (error) {
      console.error('Ошибка декомпрессии контента:', error)
    }
  }
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
  window.parent.postMessage({ type: 'editor-ready' }, '*')
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
  editor.value?.destroy()
})

defineExpose({
  getHTML: () => editor.value?.getHTML(),
  getCompressed: () => {
    const html = editor.value?.getHTML()
    return html ? LZString.compressToEncodedURIComponent(html) : null
  },
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

/* Стили для MathML формул */
.ProseMirror math {
  font-size: 1.1em;
  line-height: 1.4;
  font-family: 'Latin Modern Math', 'STIX Two Math', 'Cambria Math', serif;
}

.ProseMirror math[display="block"] {
  display: block;
  margin: 1em auto;
  text-align: center;
  font-size: 1.2em;
}

/* Улучшаем отображение операторов */
.ProseMirror mo {
  padding: 0 0.2em;
}

/* Стили для дробей */
.ProseMirror mfrac {
  display: inline-block;
  vertical-align: middle;
  text-align: center;
}

.ProseMirror mfrac > * {
  display: block;
}

.ProseMirror mfrac > *:first-child {
  border-bottom: 1px solid currentColor;
  padding-bottom: 0.2em;
  margin-bottom: 0.2em;
}

/* Стили для индексов */
.ProseMirror msub,
.ProseMirror msup,
.ProseMirror msubsup {
  display: inline-block;
  vertical-align: baseline;
}

.ProseMirror msub > *:last-child,
.ProseMirror msup > *:last-child {
  font-size: 0.7em;
  vertical-align: sub;
}

.ProseMirror msup > *:last-child {
  vertical-align: super;
}

/* Стили для корней */
.ProseMirror msqrt,
.ProseMirror mroot {
  display: inline-block;
  padding: 2px 4px;
}

.ProseMirror msqrt::before {
  content: '√';
  font-size: 1.2em;
}

/* Стили для скобок */
.ProseMirror mfenced,
.ProseMirror mrow {
  display: inline;
}

/* Матрицы и таблицы */
.ProseMirror mtable {
  display: inline-table;
  vertical-align: middle;
  margin: 0 0.5em;
}

.ProseMirror mtr {
  display: table-row;
}

.ProseMirror mtd {
  display: table-cell;
  padding: 0.3em 0.5em;
  text-align: center;
}
</style>
