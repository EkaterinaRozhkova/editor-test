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
    const classes = ['hljs']

    if (node.attrs.language) {
      classes.push(`language-${node.attrs.language}`)
    }

    if (node.attrs.mode === 'html') {
      classes.push('xmp')
    }

    return [
      'pre',
      {},
      [
        'code',
        {
          class: classes.join(' '),
          'data-language': node.attrs.language ?? undefined,
          'data-mode': node.attrs.mode ?? 'code',
        },
        0,
      ],
    ]
  },
})


