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
import { Mathematics, migrateMathStrings } from '@tiptap/extension-mathematics';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import LZString from 'lz-string';
import { useDebounceFn } from "@vueuse/core";
import EditorMenuBar from "@/components/EditorMenuBar.vue";

// Загружаем MathJax через CDN
const loadMathJax = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@2.7.7/MathJax.js?config=TeX-MML-AM_CHTML';
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
};

// Редактор Tiptap
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

// Дебаунс для отправки обновлений контента
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

// Конвертация MathML в LaTeX с использованием MathJax
async function convertMathMLToLatex(htmlContent: string): Promise<string> {
  console.log('Input HTML:', htmlContent);

  // Парсим HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const mathmlElements = doc.querySelectorAll('math');

  for (const mathml of Array.from(mathmlElements)) {
    try {
      // Получаем LaTeX через MathJax
      const latex = await new Promise<string>((resolve) => {
        const jax = (window as any).MathJax?.Hub?.getAllJax?.(mathml)?.[0];

        if (jax) {
          // Если элемент уже обработан MathJax
          resolve(jax.originalText);
        } else {
          // Fallback: простая конвертация для базовых случаев
          const latex = convertSimpleMathML(mathml);
          resolve(latex);
        }
      });

      console.log('Converted LaTeX:', latex);

      // Заменяем MathML на LaTeX в формате \(...\) для inline math
      // migrateMathStrings позже преобразует это в Mathematics nodes
      const textNode = doc.createTextNode(`\\(${latex}\\)`);
      mathml.replaceWith(textNode);
    } catch (error) {
      console.error('Error converting MathML:', error, mathml.outerHTML);
    }
  }

  const result = doc.body.innerHTML;
  console.log('Result HTML:', result);
  return result;
}

// Простая конвертация MathML в LaTeX для базовых случаев
function convertSimpleMathML(mathml: Element): string {
  const tagMap: Record<string, (el: Element) => string> = {
    'mi': (el) => el.textContent || '',
    'mn': (el) => el.textContent || '',
    'mo': (el) => el.textContent || '',
    'msup': (el) => {
      if (!el.children[0] || !el.children[1]) return '';
      const base = convertSimpleMathML(el.children[0]);
      const sup = convertSimpleMathML(el.children[1]);
      return `${base}^{${sup}}`;
    },
    'msub': (el) => {
      if (!el.children[0] || !el.children[1]) return '';
      const base = convertSimpleMathML(el.children[0]);
      const sub = convertSimpleMathML(el.children[1]);
      return `${base}_{${sub}}`;
    },
    'mfrac': (el) => {
      if (!el.children[0] || !el.children[1]) return '';
      const num = convertSimpleMathML(el.children[0]);
      const den = convertSimpleMathML(el.children[1]);
      return `\\frac{${num}}{${den}}`;
    },
    'msqrt': (el) => {
      if (!el.children[0]) return '';
      const content = convertSimpleMathML(el.children[0]);
      return `\\sqrt{${content}}`;
    },
    'mroot': (el) => {
      if (!el.children[0] || !el.children[1]) return '';
      const content = convertSimpleMathML(el.children[0]);
      const index = convertSimpleMathML(el.children[1]);
      return `\\sqrt[${index}]{${content}}`;
    },
    'mrow': (el) => {
      return Array.from(el.children).map(child => convertSimpleMathML(child as Element)).join('');
    },
    'mspace': () => '\\;',
  };

  const tagName = mathml.tagName.toLowerCase();
  const converter = tagMap[tagName];

  if (converter) {
    return converter(mathml);
  }

  // Для неизвестных тегов обрабатываем рекурсивно
  if (mathml.children.length > 0) {
    return Array.from(mathml.children).map(child => convertSimpleMathML(child as Element)).join('');
  }

  return mathml.textContent || '';
}

const handleMessage = async (event: MessageEvent) => {
  if (event.data.type === 'init-content' && editor.value) {
    try {
      const html = LZString.decompressFromEncodedURIComponent(event.data.data);

      // Конвертируем MathML в LaTeX
      const updatedHtml = await convertMathMLToLatex(html);

      // Устанавливаем обновленный контент
      editor.value.commands.setContent(updatedHtml ?? '');

      if (editor.value) {
        // Даем время на инициализацию контента
        setTimeout(() => {
          if (editor.value) {
            console.log('Before migration:', editor.value.getHTML());
            migrateMathStrings(editor.value);
            console.log('After migration:', editor.value.getHTML());
            // Включаем отслеживание обновлений только после успешной миграции
            isContentInitialized.value = true;
          }
        }, 100);
      }

      // Преобразуем LaTeX строки в Mathematics nodes
      migrateMathStrings(editor.value);

      isContentInitialized.value = true;
    } catch (error) {
      console.error('Ошибка декомпрессии контента:', error);
    }
  }
};

onMounted(async () => {
  await loadMathJax();
  window.addEventListener('message', handleMessage);
  window.parent.postMessage({ type: 'editor-ready' }, '*');

  // Преобразуем LaTeX строки в Mathematics nodes
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
