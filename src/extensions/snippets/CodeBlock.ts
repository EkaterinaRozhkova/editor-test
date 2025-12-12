import { Node, mergeAttributes } from '@tiptap/core'
import hljs from 'highlight.js'

export const CodeBlock = Node.create({
  name: 'codeBlock',

  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element) => {
          // element это HTMLElement, не ProseMirror Node
          const codeEl = element.querySelector('code')
          if (!codeEl) return null

          const dataLang = codeEl.getAttribute('data-language')
          if (dataLang) return dataLang

          const classes = codeEl.className || ''
          const match = classes.match(/language-(\w+)/)
          return match ? match[1] : null
        },
        renderHTML: (attributes) => {
          if (!attributes.language) return {}
          return {
            'data-language': attributes.language,
          }
        },
      },
      mode: {
        default: 'code',
        parseHTML: (element) => {
          const codeEl = element.querySelector('code')
          return codeEl?.getAttribute('data-mode') || 'code'
        },
        renderHTML: (attributes) => {
          return {
            'data-mode': attributes.mode || 'code',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.raw-html-embed',
        preserveWhitespace: 'full',
      },
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node }) {
    const code = node.textContent || ''
    const language = node.attrs.language
    const mode = node.attrs.mode || 'code'

    // Определяем язык если не указан
    let detectedLanguage = language
    if (!language || language === 'auto') {
      try {
        const result = hljs.highlightAuto(code)
        detectedLanguage = result.language || ''
      } catch (e) {
        detectedLanguage = ''
      }
    }

    // Формируем классы
    const codeClasses = ['hljs']
    if (mode === 'html') {
      codeClasses.push('xmp')
    }
    if (detectedLanguage) {
      codeClasses.push(`language-${detectedLanguage}`)
    }

    return [
      'div',
      { class: 'raw-html-embed' },
      [
        'pre',
        { class: 'ck-content-pre' },
        [
          'code',
          {
            class: codeClasses.join(' '),
            'data-language': detectedLanguage || undefined,
            'data-mode': mode,
          },
          0, // текстовое содержимое
        ],
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlock: (attributes?: { language?: string; mode?: 'code' | 'html' }) => ({ commands }: any) => {
        return commands.setNode(this.name, attributes)
      },
      toggleCodeBlock: (attributes?: { language?: string; mode?: 'code' | 'html' }) => ({ commands }: any) => {
        return commands.toggleNode(this.name, 'paragraph', attributes)
      },
      setCodeBlockLanguage: (language: string | null) => ({ commands }: any) => {
        return commands.updateAttributes(this.name, { language })
      },
      setCodeBlockMode: (mode: 'code' | 'html') => ({ commands }: any) => {
        return commands.updateAttributes(this.name, { mode })
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-c': () => this.editor.commands.toggleCodeBlock(),
      'Escape': ({ editor }) => {
        if (editor.isActive('codeBlock')) {
          return editor.commands.setNode('paragraph')
        }
        return false
      },
    }
  },
})

// Вариант с TypeScript типами (если используете TypeScript)
export const CodeBlockSimpleTS = Node.create({
  name: 'codeBlock',

  group: 'block',
  content: 'text*',
  marks: '',
  code: true,
  defining: true,

  addAttributes() {
    return {
      language: {
        default: null as string | null,
        parseHTML: (element: HTMLElement) => {
          const codeEl = element.querySelector('code')
          if (!codeEl) return null

          const dataLang = codeEl.getAttribute('data-language')
          if (dataLang) return dataLang

          const classes = codeEl.className || ''
          const match = classes.match(/language-(\w+)/)
          return match ? match[1] : null
        },
        renderHTML: (attributes: { language?: string | null }) => {
          if (!attributes.language) return {}
          return {
            'data-language': attributes.language,
          }
        },
      },
      mode: {
        default: 'code' as 'code' | 'html',
        parseHTML: (element: HTMLElement) => {
          const codeEl = element.querySelector('code')
          const mode = codeEl?.getAttribute('data-mode')
          return (mode === 'html' ? 'html' : 'code') as 'code' | 'html'
        },
        renderHTML: (attributes: { mode?: 'code' | 'html' }) => {
          return {
            'data-mode': attributes.mode || 'code',
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.raw-html-embed',
        preserveWhitespace: 'full',
      },
      {
        tag: 'pre',
        preserveWhitespace: 'full',
      },
    ]
  },

  renderHTML({ node }) {
    const code = node.textContent || ''
    const language = node.attrs.language as string | null
    const mode = (node.attrs.mode || 'code') as 'code' | 'html'

    // Определяем язык если не указан
    let detectedLanguage = language
    if (!language || language === 'auto') {
      try {
        const result = hljs.highlightAuto(code)
        detectedLanguage = result.language || ''
      } catch (e) {
        detectedLanguage = ''
      }
    }

    // Формируем классы
    const codeClasses = ['hljs']
    if (mode === 'html') {
      codeClasses.push('xmp')
    }
    if (detectedLanguage) {
      codeClasses.push(`language-${detectedLanguage}`)
    }

    return [
      'div',
      { class: 'raw-html-embed' },
      [
        'pre',
        { class: 'ck-content-pre' },
        [
          'code',
          {
            class: codeClasses.join(' '),
            'data-language': detectedLanguage || undefined,
            'data-mode': mode,
          },
          0,
        ],
      ],
    ]
  },

  addCommands() {
    return {
      setCodeBlock: (attributes?: { language?: string; mode?: 'code' | 'html' }) => ({ commands }) => {
        return commands.setNode(this.name, attributes)
      },
      toggleCodeBlock: (attributes?: { language?: string; mode?: 'code' | 'html' }) => ({ commands }) => {
        return commands.toggleNode(this.name, 'paragraph', attributes)
      },
      setCodeBlockLanguage: (language: string | null) => ({ commands }: any) => {
        return commands.updateAttributes(this.name, { language })
      },
      setCodeBlockMode: (mode: 'code' | 'html') => ({ commands }: any) => {
        return commands.updateAttributes(this.name, { mode })
      },
    }
  },
})
