import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MathView from '../components/MathView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      insertInlineMath: (mathml: string) => ReturnType
      insertMathBlock: (mathml: string) => ReturnType
    }
  }
}

export const InlineMath = Node.create({
  name: 'inlineMath',

  group: 'inline',

  inline: true,

  atom: true,

  addAttributes() {
    return {
      mathml: {
        default: '',
        parseHTML: element => {
          // Парсим MathML из data-атрибута или из содержимого
          const dataAttr = element.getAttribute('data-mathml')
          if (dataAttr) return dataAttr

          // Если это сам элемент math, берем его outerHTML
          const mathElement = element.querySelector('math') || (element.tagName === 'MATH' ? element : null)
          if (mathElement) return mathElement.outerHTML

          return element.innerHTML
        },
        renderHTML: attributes => {
          return {
            'data-mathml': attributes.mathml,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span.inline-math',
      },
      {
        tag: 'math:not([display="block"])',
        getAttrs: (node) => {
          if (node instanceof HTMLElement) {
            return { mathml: node.outerHTML }
          }
          return false
        },
      },
    ]
  },

  renderHTML() {
    return ['span', { class: 'inline-math' }]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathView)
  },

  addCommands() {
    return {
      insertInlineMath: (mathml: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { mathml },
        })
      },
    }
  },
})

export const MathBlock = Node.create({
  name: 'mathBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      mathml: {
        default: '',
        parseHTML: element => {
          // Парсим MathML из data-атрибута или из содержимого
          const dataAttr = element.getAttribute('data-mathml')
          if (dataAttr) return dataAttr

          // Если это сам элемент math, берем его outerHTML
          const mathElement = element.querySelector('math') || (element.tagName === 'MATH' ? element : null)
          if (mathElement) return mathElement.outerHTML

          return element.innerHTML
        },
        renderHTML: attributes => {
          return {
            'data-mathml': attributes.mathml,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.math-block',
      },
      {
        tag: 'math[display="block"]',
        getAttrs: (node) => {
          if (node instanceof HTMLElement) {
            return { mathml: node.outerHTML }
          }
          return false
        },
      },
    ]
  },

  renderHTML() {
    return ['div', { class: 'math-block' }]
  },

  addNodeView() {
    return VueNodeViewRenderer(MathView)
  },

  addCommands() {
    return {
      insertMathBlock: (mathml: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { mathml },
        })
      },
    }
  },
})