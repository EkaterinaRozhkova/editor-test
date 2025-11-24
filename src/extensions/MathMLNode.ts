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
            const clean = mathml
              .replace(/&nbsp;/g, ' ')               // убрать &nbsp;
              .replace(/<\/math>.*$/, '</math>')    // убрать хвосты типа ;&nbsp;<math>
              .replace(/&lt;/g, '<')                // HTML → XML
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')

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


