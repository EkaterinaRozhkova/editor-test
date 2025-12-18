<template>
  <div class="base-editor" v-if="editor">
    <EditorMenuBar
      :editor="editor"
      @add-audio="addAudio"
      @add-image="addImage"
      @add-formula="addFormula"
    />
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { TableKit } from '@tiptap/extension-table'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Image from '@tiptap/extension-image'
import Code from '@tiptap/extension-code'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { all, createLowlight } from 'lowlight'
import LZString from 'lz-string'
import { useDebounceFn } from '@vueuse/core'
import EditorMenuBar from '@/components/EditorMenuBar.vue'
import Highlight from '@tiptap/extension-highlight'
import { CustomOrderedList } from '@/extensions/CustomOrderedList'
import { FlexExtension } from '@/extensions/FlexExtension.ts'
import { HeaderExtension } from '@/extensions/HeaderExtension.ts'
import { CenterExtension } from '@/extensions/CenterExtension.ts'
import { BlockExtension } from '@/extensions/BlockExtension.ts'
import { SectionExtension } from '@/extensions/SectionExtension.ts'
import { ImageExtension } from '@/extensions/ImageExtension.ts'
import { AudioExtension } from '@/extensions/AudioExtension.ts'
import { CodeBlockExtension } from '@/extensions/CodeBlockExtension.ts'
import { exportHtmlWithHighlight } from '@/utils/exportHtmlWithHighlight'
import 'highlight.js/styles/atom-one-light.css'

const lowlight = createLowlight(all)

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      orderedList: false,
      codeBlock: false,
    }),
    Highlight,

    CustomOrderedList,

    CodeBlockLowlight.configure({
      lowlight,
    }),

    CodeBlockExtension,

    HorizontalRule.configure({
      HTMLAttributes: {
        style:
          'display:block;width:100%;margin:16px 0;height:2px;' +
          'background-image:linear-gradient(90deg,#8850CE,#8850CE 65%,transparent 65%,transparent 100%);' +
          'background-size:15px 6px;border:none;',
      },
    }),

    Code.configure({
      HTMLAttributes: {
        class: 'inline-code',
      },
    }),

    Subscript,
    Superscript,

    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),

    TableKit.configure({
      table: {
        resizable: true,
        lastColumnResizable: false,
        HTMLAttributes: {
          style:
            'max-width:100%;margin:0 auto;font-size:12px;' +
            'border:1px solid #D1D5DB;border-collapse:collapse;',
        },
      },
      tableCell: {
        HTMLAttributes: {
          style: 'border:1px solid #EAECF0;padding:8px;position:relative;',
        },
      },
      tableHeader: {
        HTMLAttributes: {
          style:
            'border:1px solid #EAECF0;padding:8px;position:relative;' +
            'font-weight:400;text-align:left;',
        },
      },
    }),

    FlexExtension,
    HeaderExtension,
    CenterExtension,
    BlockExtension,
    SectionExtension,
    AudioExtension,
    ImageExtension,

    TextStyle,
    Color,

    Image.configure({
      resize: {
        enabled: true,
        directions: ['top', 'bottom', 'left', 'right'],
        minWidth: 50,
        minHeight: 50,
        alwaysPreserveAspectRatio: true,
      },
    }),
  ],

  content: '',
  editable: true,

  editorProps: {
    attributes: {
      class:
        'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },

  onUpdate: () => {
    sendContentUpdate()
  },
})

const isContentInitialized = ref(false)


const sendContentUpdate = useDebounceFn(() => {
  if (!isContentInitialized.value || !editor.value) return

  const rawHtml = editor.value.getHTML()
  const highlightedHtml = exportHtmlWithHighlight(rawHtml)
  const compressed =
    LZString.compressToEncodedURIComponent(highlightedHtml)

  window.parent.postMessage(
    {
      type: 'content-update',
      data: compressed,
    },
    '*',
  )
}, 500)

const addAudio = () => {
  window.parent.postMessage({ type: 'add-audio', data: '' }, '*')
}

const addImage = () => {
  window.parent.postMessage({ type: 'add-image', data: '' }, '*')
}

const addFormula = () => {
  window.parent.postMessage({ type: 'add-formula', data: '' }, '*')
}


const handleMessage = (event: MessageEvent) => {
  if (event.data.type === 'init-content' && editor.value) {
    try {
      const html = LZString.decompressFromEncodedURIComponent(
        event.data.data,
      )

      editor.value.commands.setContent(html ?? '')

      setTimeout(() => {
        isContentInitialized.value = true
      }, 100)
    } catch (e) {
      console.error('Ошибка декомпрессии контента:', e)
    }
  }

  if (event.data.type === 'audio-uploaded' && editor.value) {
    editor.value
      .chain()
      .focus()
      .insertAudioBlock(event.data.data)
      .run()
  }

  if (event.data.type === 'image-uploaded' && editor.value) {
    editor.value
      .chain()
      .focus()
      .insertImageExtension(event.data.data)
      .run()
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
  getHTML: () => {
    const raw = editor.value?.getHTML()
    return raw ? exportHtmlWithHighlight(raw) : null
  },

  getCompressed: () => {
    const raw = editor.value?.getHTML()
    if (!raw) return null

    const highlighted = exportHtmlWithHighlight(raw)
    return LZString.compressToEncodedURIComponent(highlighted)
  },

  editor,
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
  height: 386px;
  background-color: var(--editor-content);
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-bg) var(--scrollbar-color);
}

.editor-content::-webkit-scrollbar {
  width: 4px;
}

.ProseMirror {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.ProseMirror audio {
  flex-shrink: 0;
  max-height: 32px;
  margin: 0 7px;
}

.ProseMirror pre code {
  display: block;
  background: var(--code-block-bg);
  border: 1px solid var(--code-block-border);
  overflow-x: auto;
  border-radius: 5px;
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 15px;
  color: var(--code-block-color);
  direction: ltr;
  font-style: normal;
  min-width: 100%;
  padding: 1em;
  tab-size: 4;
  text-align: left;
  white-space: pre-wrap;
}

.ProseMirror table {
  max-width: 100%;
  margin: 0px auto;
  font-size: 12px;
  border: 1px solid rgb(234, 236, 240);
  border-collapse: collapse;
  width: 100%;
  td,
  th {

    > * {
      margin: 0;
    }
  }

  .column-resize-handle {
    background-color: var(--button-is-active-bg);
    bottom: -2px;
    pointer-events: none;
    position: absolute;
    right: -2px;
    top: 0;
    width: 4px;
  }

  &.resize-cursor {
    cursor: ew-resize;
    cursor: col-resize;
  }

}

.ProseMirror .inline-code {
  background: var(--code-block-bg);
  border: 1px solid var(--code-block-border);
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 14px;
  font-weight: 500;
  color: var(--code-block-color);
  direction: ltr;
  font-style: normal;
  padding: .2em .4em;
  border-radius: 3px;
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
