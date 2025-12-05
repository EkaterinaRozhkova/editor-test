import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import RowShortcodeView from '@/components/RowShortcodeView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rowShortcode: {
      insertRowShortcode: (rows?: number) => ReturnType
      toggleRowShortcode: () => ReturnType
    }
  }
}

export const RowShortcode = Node.create({
  name: 'rowShortcode',

  group: 'block',

  content: 'row+',

  inline: false,

  isolating: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="row-shortcode"]',
      },
    ]
  },

  renderHTML({ node }) {
    const result: any[] = []

    const serializeMarks = (text: string, marks: readonly any[]) => {
      let result = text
      marks.forEach((mark) => {
        if (mark.type.name === 'bold') {
          result = `<strong>${result}</strong>`
        } else if (mark.type.name === 'strike') {
          result = `<s>${result}</s>`
        } else if (mark.type.name === 'italic') {
          result = `<em>${result}</em>`
        } else if (mark.type.name === 'underline') {
          result = `<u>${result}</u>`
        } else if (mark.type.name === 'code') {
          result = `<code>${result}</code>`
        } else if (mark.type.name === 'highlight') {
          result = `<mark>${result}</mark>`
        } else if (mark.type.name === 'link') {
          const href = mark.attrs.href || ''
          result = `<a href="${href}">${result}</a>`
        } else if (mark.type.name === 'subscript') {
          result = `<sub>${result}</sub>`
        } else if (mark.type.name === 'superscript') {
          result = `<sup>${result}</sup>`
        }
      })
      return result
    }

    // Открывающий тег [flex column='true']
    let openingText = "[flex column='true']"

    node.content.forEach((child, index) => {
      if (child.type.name === 'row') {
        const title = child.attrs.title || ''
        const isFinal = index === node.content.childCount - 1
        const finalAttr = isFinal ? " final='true'" : ''

        // Добавляем [row title='...' final='true'] к открывающему тегу
        openingText += `[row title='${title}'${finalAttr}']`
      }
    })

    // Создаем первый параграф с открывающими тегами
    result.push(['p', {}, openingText])

    // Обрабатываем содержимое всех строк
    node.content.forEach((child) => {
      if (child.type.name === 'row') {
        child.content.forEach((blockNode) => {
          const contentArray: any[] = []

          // Сериализуем содержимое блока с marks
          blockNode.content.forEach((inline) => {
            const text = inline.text || ''
            if (inline.marks && inline.marks.length > 0) {
              const markedText = serializeMarks(text, inline.marks)
              // Парсим HTML-строку обратно в структуру для renderHTML
              contentArray.push(['span', { innerHTML: markedText }])
            } else {
              contentArray.push(text)
            }
          })

          // Создаем параграф с содержимым
          if (contentArray.length > 0) {
            result.push(['p', {}, ...contentArray])
          }
        })
      }
    })

    // Закрывающий тег [/row][/flex]
    result.push(['p', {}, '[/row][/flex]'])

    // Добавляем пустые параграфы
    result.push(['p', {}, '\u00A0']) // &nbsp;
    result.push(['p', {}, '\u00A0'])
    result.push(['p', {}, '\u00A0'])

    // Возвращаем контейнер с результатом
    return ['div', { 'data-type': 'row-shortcode' }, ...result]
  },

  addNodeView() {
    return VueNodeViewRenderer(RowShortcodeView)
  },

  addCommands() {
    return {
      insertRowShortcode:
        (rows = 2) =>
          ({ chain }) => {
            const content = []
            for (let i = 0; i < rows; i++) {
              content.push({
                type: 'row',
                attrs: {
                  title: `Заголовок ${i + 1}`,
                },
                content: [
                  {
                    type: 'paragraph',
                  },
                ],
              })
            }

            return chain()
              .focus()
              .insertContent({
                type: this.name,
                content,
              })
              .run()
          },

      toggleRowShortcode:
        () =>
          ({ state, chain }) => {
            const { from, to } = state.selection

            let rowNode: any = null
            let rowNodeSize: number = 0
            let rowPos: number = -1

            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === this.name) {
                rowNode = node
                rowNodeSize = node.nodeSize
                rowPos = pos
                return false
              }
            })

            if (rowNode && rowPos >= 0) {
              const content: Array<{
                type: string
                content?: Array<{ type: string; text: string }>
              }> = []

              content.push({
                type: 'paragraph',
                content: [{ type: 'text', text: "[flex column='true']" }],
              })

              rowNode.forEach((child: any) => {
                if (child.type.name === 'row') {
                  const title = child.attrs.title || ''
                  content.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: `[row title='${title}']` }],
                  })

                  child.content.forEach((blockNode: any) => {
                    const text = blockNode.textContent || ''
                    content.push({
                      type: 'paragraph',
                      content: text ? [{ type: 'text', text }] : [],
                    })
                  })

                  content.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: '[/row]' }],
                  })
                }
              })

              content.push({
                type: 'paragraph',
                content: [{ type: 'text', text: '[/flex]' }],
              })

              return chain()
                .focus()
                .deleteRange({ from: rowPos, to: rowPos + rowNodeSize })
                .insertContentAt(rowPos, content)
                .run()
            }

            return false
          },
    }
  },
})
