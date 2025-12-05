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
    const parts: string[] = []
    parts.push("[flex column='true']")

    const serializeMarks = (text: string, marks: readonly any[]) => {
      let result = text
      // Применяем marks в обратном порядке для правильной вложенности
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

    node.content.forEach((child, index) => {
      if (child.type.name === 'row') {
        const title = child.attrs.title || ''
        const isFinal = index === node.content.childCount - 1
        const finalAttr = isFinal ? " final='true'" : ''

        parts.push(`[row title='${title}'${finalAttr}]`)
        parts.push('') // Пустая строка после открывающего тега

        // Сериализуем содержимое строки
        child.content.forEach((blockNode) => {
          let blockHTML = ''

          // Обрабатываем содержимое блока
          blockNode.content.forEach((inline) => {
            const text = inline.text || ''
            if (inline.marks && inline.marks.length > 0) {
              blockHTML += serializeMarks(text, inline.marks)
            } else {
              blockHTML += text
            }
          })

          parts.push(blockHTML)
        })

        parts.push('') // Пустая строка перед закрывающим тегом
        parts.push('[/row]')
      }
    })

    parts.push('[/flex]')

    return ['pre', { 'data-type': 'row-shortcode' }, parts.join('\n')]
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

          // Проверяем, находится ли курсор внутри rowShortcode
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

          // Если курсор на rowShortcode, разворачиваем его обратно в текст
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

                // Добавляем содержимое строки
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