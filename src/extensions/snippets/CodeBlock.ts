import { Node } from '@tiptap/core'

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
        parseHTML: element => {
          const codeEl = element.querySelector('code')
          return codeEl?.getAttribute('data-language') ?? null
        },
        renderHTML: attrs => {
          if (!attrs.language) return {}
          return { 'data-language': attrs.language }
        },
      },
      mode: {
        default: 'code',
        parseHTML: element => {
          const codeEl = element.querySelector('code')
          return codeEl?.getAttribute('data-mode') ?? 'code'
        },
        renderHTML: attrs => ({
          'data-mode': attrs.mode ?? 'code',
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'pre', preserveWhitespace: 'full' }]
  },

  renderHTML({ node }) {
    return [
      'pre',
      {},
      [
        'code',
        {
          'data-language': node.attrs.language ?? undefined,
          'data-mode': node.attrs.mode ?? 'code',
        },
        0, // ⬅️ ТОЛЬКО ТЕКСТ
      ],
    ]
  },
})

