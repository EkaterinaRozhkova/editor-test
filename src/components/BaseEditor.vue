<template>
  <div class="base-editor" v-if="editor">
    <EditorMenuBar :editor="editor" />
    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Mathematics } from '@tiptap/extension-mathematics';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import LZString from 'lz-string';
import { useDebounceFn } from "@vueuse/core";
import EditorMenuBar from "@/components/EditorMenuBar.vue";
import { HeaderShortcode } from "@/extensions/HeaderShortcode.ts";


const editor = useEditor({
  extensions: [
    StarterKit,
    Mathematics.configure({
      katexOptions: {
        throwOnError: true
      },
    }),
    Underline,
    Subscript,
    Superscript,
    Highlight,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Link.configure({
      openOnClick: false,
    }),
    HeaderShortcode
  ],
  content: '',  // Изначально пустое содержимое
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

      // migrateMathStrings(editor.value);

      isContentInitialized.value = true;
    } catch (error) {
      console.error('Ошибка декомпрессии контента:', error);
    }
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
