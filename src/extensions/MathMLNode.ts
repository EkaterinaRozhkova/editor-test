import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathml: {
      insertMathML: (mathml: string) => ReturnType
    }
  }
}

export const MathMLNode = Node.create({
  name: 'mathml',

  group: 'inline',
  inline: true,
  atom: true,

  parseHTML() {
    return [{ tag: 'math' }]
  },

  addAttributes() {
    return {
      content: {
        default: '',
        parseHTML: element => element.outerHTML,
      }
    }
  },

  renderHTML({ node }) {
    const parser = new DOMParser()
    const xml = parser.parseFromString(node.attrs.content, 'application/xml')
    const math = xml.documentElement
    return { dom: math }
  },

  addCommands() {
    return {
      insertMathML:
        (mathml: string) =>
          ({ tr, dispatch }) => {

            // ---------- SANITIZE MATHML ----------
            let clean = mathml
              // HTML entities
              .replace(/&nbsp;/g, ' ')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')

              // Unicode NBSP (&#xA0; → U+00A0)
              .replace(/\u00A0/g, ' ')

              // Middle dot normalizer (&#xB7; — реальный символ)
              .replace(/\u00B7/g, '·')

              // удалить хвосты после </math>
              .replace(/<\/math>.*$/, '</math>')

            // --------------------------------------

            const node = this.type.create({
              content: clean,
            })

            if (dispatch) {
              dispatch(tr.replaceSelectionWith(node))
            }
            return true
          },
    }
  },
})



