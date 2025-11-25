import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import MathView from '../components/MathView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    math: {
      insertInlineMath: (mathml: string) => ReturnType
      insertMathBlock: (mathml: string) => ReturnType
    }
  }
}

// Плагин для обработки вставки MathML
const mathPastePluginKey = new PluginKey('mathPaste')

function createMathPastePlugin() {
  return new Plugin({
    key: mathPastePluginKey,
    props: {
      handlePaste(view, event, slice) {
        // Получаем HTML из буфера обмена
        const html = event.clipboardData?.getData('text/html') || event.clipboardData?.getData('text/plain')

        if (!html) return false

        console.log('[MathPaste] Clipboard content:', html)

        // Проверяем, есть ли MathML в тексте
        if (html.includes('<math')) {
          // Создаем временный div для парсинга
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = html

          // Ищем все <math> элементы
          const mathElements = tempDiv.querySelectorAll('math')

          if (mathElements.length > 0) {
            console.log('[MathPaste] Found math elements:', mathElements.length)

            const { state, dispatch } = view
            const { tr } = state

            // Для каждого math элемента создаем соответствующую ноду
            mathElements.forEach((mathElement, index) => {
              const mathml = mathElement.outerHTML
              const isBlock = mathElement.getAttribute('display') === 'block'

              console.log('[MathPaste] Inserting math:', { mathml: mathml.substring(0, 100), isBlock })

              // Создаем ноду
              const nodeType = isBlock ? state.schema.nodes.mathBlock : state.schema.nodes.inlineMath

              if (nodeType) {
                const node = nodeType.create({ mathml })

                // Вставляем в позицию курсора
                if (index === 0) {
                  tr.replaceSelectionWith(node)
                } else {
                  // Добавляем пробел между формулами
                  const pos = tr.selection.to
                  tr.insert(pos, node)
                }
              }
            })

            if (tr.docChanged) {
              dispatch(tr)
              return true
            }
          }
        }

        return false
      },
    },
  })
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
        priority: 100,
      },
      {
        tag: 'math',
        priority: 51,
        getAttrs: (node) => {
          if (node instanceof HTMLElement) {
            // Проверяем, что это не блочная формула
            const display = node.getAttribute('display')
            if (display === 'block') return false

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

  addProseMirrorPlugins() {
    return [createMathPastePlugin()]
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
        priority: 100,
      },
      {
        tag: 'math[display="block"]',
        priority: 52,
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