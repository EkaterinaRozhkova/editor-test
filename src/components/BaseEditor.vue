<template>
  <div class="base-editor" v-if="editor">
    <EditorMenuBar :editor="editor" @addAudio="addAudio" v-model:currentFile="currentFile"/>
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Mathematics } from '@tiptap/extension-mathematics';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style'
import { TableKit } from '@tiptap/extension-table'
import LZString from 'lz-string';
import { useDebounceFn } from "@vueuse/core";
import EditorMenuBar from "@/components/EditorMenuBar.vue";
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { FlexSnippet } from "../extensions/snippets/FlexSnippet.ts";
import { HeaderSnippet } from "../extensions/snippets/HeaderSnippet.ts";
import { CustomOrderedList } from "@/extensions/CustomOrderedList.ts";
import { CenterSnippet } from "../extensions/snippets/CenterSnippet.ts";
import { BlockSnippet } from "../extensions/snippets/BlockSnippet.ts";
import { SectionSnippet } from "@/extensions/snippets/SectionSnippet.ts";
import { AudioBlock } from "@/extensions/AudioBlock.ts";
import Image from '@tiptap/extension-image'



const editor = useEditor({
  extensions: [
    StarterKit.configure({
      orderedList: false,
    }),
    CustomOrderedList,
    Mathematics.configure({
      katexOptions: {
        throwOnError: true
      },
    }),
    HorizontalRule.configure({
      HTMLAttributes: {
        style: 'display: block; width: 100%; margin: 16px 0; height: 2px; background-image: linear-gradient(90deg, #8850CE, #8850CE 65%, transparent 65%, transparent 100%); background-size: 15px 6px;border: none;',
      }
    }),
    Subscript,
    Superscript,
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TableKit.configure({
      table: {
        resizable: true,
        lastColumnResizable: false,
        HTMLAttributes: {
          style: 'max-width: 100%; margin: 0 auto; font-size: 12px; border: 1px solid #D1D5DB;border-collapse: collapse;',
        },
      },
      tableCell: {
        HTMLAttributes: {
          style: 'border: 1px solid #EAECF0;padding: 8px;position: relative;',
        },
      },
      tableHeader: {
        HTMLAttributes: {
          style: 'border: 1px solid #EAECF0;padding: 8px;position: relative;font-weight: 400;text-align: left',
        },
      }
    }),
    FlexSnippet,
    HeaderSnippet,
    CenterSnippet,
    BlockSnippet,
    SectionSnippet,
    AudioBlock,
    TextStyle,
    Image.configure({
      resize: {
        enabled: true,
        directions: ['top', 'bottom', 'left', 'right'], // can be any direction or diagonal combination
        minWidth: 50,
        minHeight: 50,
        alwaysPreserveAspectRatio: true,
      }
    }),
    Color
  ],
  content: '',
  editable: true,
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none',
    },
  },
  onUpdate: () => {
    sendContentUpdate()
  },
});


const isContentInitialized = ref(false);
const currentFile = ref(null)

const sendContentUpdate = useDebounceFn(() => {
  if (isContentInitialized.value && editor.value) {
    const html = editor.value.getHTML();
    const compressed = LZString.compressToEncodedURIComponent(html);

    window.parent.postMessage({
      type: 'content-update',
      data: compressed,
    }, '*');
  }
}, 500);

const addAudio = async () => {
  window.parent.postMessage({
    type: 'add-audio'
  });
}

const handleMessage = async (event: MessageEvent) => {
  if (event.data.type === 'init-content' && editor.value) {
    try {
      const html = LZString.decompressFromEncodedURIComponent(event.data.data);
      editor.value.commands.setContent(html ?? '');


      if (editor.value) {
        // Даем время на инициализацию контента
        setTimeout(() => {
          if (editor.value) {
            isContentInitialized.value = true;
          }
        }, 100);
      }

      isContentInitialized.value = true;
    } catch (error) {
      console.error('Ошибка декомпрессии контента:', error);
    }
  }

  if(event.data.type === 'file-uploaded' && editor.value) {
    currentFile.value = event?.data?.data || null
  }
};

onMounted(async () => {
  window.addEventListener('message', handleMessage);
  window.parent.postMessage({ type: 'editor-ready' }, '*');
});

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage);
  editor.value?.destroy();
});

defineExpose({
  getHTML: () => editor.value?.getHTML(),
  getCompressed: () => {
    const html = editor.value?.getHTML();
    return html ? LZString.compressToEncodedURIComponent(html) : null;
  },
  editor
});
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
