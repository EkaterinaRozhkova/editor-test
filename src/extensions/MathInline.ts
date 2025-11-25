import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MathView from '../components/MathView.vue'
import { MathMLToLaTeX } from '../utils/mathml-converter'

export interface MathInlineOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (latex: string) => ReturnType
    }
  }
}

export const MathInline = Node.create<MathInlineOptions>({
  name: 'mathInline',

  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      latex: {
        default: '',
        parseHTML: element => element.getAttribute('data-latex') || element.textContent,
        renderHTML: attributes => {
          return {
            'data-latex': attributes.latex,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="math-inline"]',
      },
      {
        // Автоматически конвертировать MathML при вставке
        tag: 'math',
        getAttrs: (node) => {
          if (typeof node === 'string') return false

          const converter = new MathMLToLaTeX()
          const latex = converter.convert((node as HTMLElement).outerHTML)

          if (latex) {
            console.log('🔄 Converting pasted MathML:', latex)
            return { latex }
          }

          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'math-inline',
      }),
      0,
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathView)
  },

  addCommands() {
    return {
      setMathInline:
        (latex: string) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: { latex },
            })
          },
    }
  },
})
