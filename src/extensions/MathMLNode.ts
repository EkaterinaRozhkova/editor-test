
import { Node } from '@tiptap/core'
import { mathmlToLatex } from '../utils/mathConverter'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mathml: {
      insertMathML: (mathml: string) => ReturnType
    }
  }
}

/**
 * Extension для обработки старых MathML тегов из CKEditor/MathType
 * Автоматически конвертирует их в LaTeX для работы с Mathematics extension
 */
export const MathMLNode = Node.create({
  name: 'mathml',

  priority: 1000, // Высокий приоритет для обработки до других extensions

  group: 'inline',
  inline: true,
  atom: true,

  parseHTML() {
    return [
      {
        tag: 'math',
        getAttrs: (element) => {
          if (typeof element === 'string') return false

          const mathElement = element as HTMLElement
          const mathml = mathElement.outerHTML

          try {
            // Конвертируем MathML в LaTeX
            const latex = mathmlToLatex(mathml)

            return {
              mathml: mathml,
              latex: latex,
              display: mathElement.getAttribute('display') === 'block'
            }
          } catch (error) {
            console.error('Ошибка парсинга MathML:', error)
            return false
          }
        }
      }
    ]
  },

  addAttributes() {
    return {
      mathml: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-mathml') || element.outerHTML,
      },
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
      },
      display: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-display') === 'true',
      }
    }
  },

  renderHTML({ node }) {
    // Рендерим как span с LaTeX для совместимости с KaTeX
    const latex = node.attrs.latex
    const display = node.attrs.display

    return [
      'span',
      {
        'data-type': display ? 'block-math' : 'inline-math',
        'data-content': latex,
        'data-mathml': node.attrs.mathml, // Сохраняем оригинальный MathML
        class: display ? 'math-block' : 'math-inline',
      },
      display ? `$$${latex}$$` : `$${latex}$`
    ]
  },

  addCommands() {
    return {
      insertMathML:
        (mathml: string) =>
        ({ tr, dispatch, editor }) => {
          try {
            // Санитизация MathML
            const clean = mathml
              .replace(/&nbsp;/g, ' ')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/\u00A0/g, ' ')
              .replace(/\u00B7/g, '·')
              .replace(/<\/math>.*$/, '</math>')

            // Конвертируем в LaTeX
            const latex = mathmlToLatex(clean)

            if (!latex) {
              console.error('Не удалось конвертировать MathML в LaTeX')
              return false
            }

            // Определяем тип (inline/block)
            const isBlock = clean.includes('display="block"')

            // Создаем узел
            const node = this.type.create({
              mathml: clean,
              latex: latex,
              display: isBlock
            })

            if (dispatch) {
              dispatch(tr.replaceSelectionWith(node))
            }

            return true
          } catch (error) {
            console.error('Ошибка вставки MathML:', error)
            return false
          }
        },
    }
  },
})
