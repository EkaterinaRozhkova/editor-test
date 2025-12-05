import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FlexShortcodeView from '@/components/FlexShortcodeView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flexShortcode: {
      insertFlexShortcode: (columns?: number) => ReturnType
      toggleFlexShortcode: () => ReturnType
    }
  }
}

export const FlexShortcode = Node.create({
  name: 'flexShortcode',

  group: 'block',

  content: 'flexColumn+',

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
        tag: 'div[data-type="flex-shortcode"]',
      },
    ]
  },

  renderHTML({ node }) {
    const parts: string[] = []
    parts.push('[flex]')

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
      if (child.type.name === 'flexColumn') {
        const title = child.attrs.title || ''
        const isFinal = index === node.content.childCount - 1
        const finalAttr = isFinal ? " final='true'" : ''

        parts.push(`[col title='${title}'${finalAttr}]`)
        parts.push('') // Пустая строка после открывающего тега

        // Сериализуем содержимое колонки
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
        parts.push('[/col]')
      }
    })

    parts.push('[/flex]')

    return ['pre', { 'data-type': 'flex-shortcode' }, parts.join('\n')]
  },

  addNodeView() {
    return VueNodeViewRenderer(FlexShortcodeView)
  },

  addCommands() {
    return {
      insertFlexShortcode:
        (columns = 2) =>
        ({ chain }) => {
          const content = []
          for (let i = 0; i < columns; i++) {
            content.push({
              type: 'flexColumn',
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

      toggleFlexShortcode:
        () =>
        ({ state, chain }) => {
          const { from, to } = state.selection

          // Проверяем, находится ли курсор внутри flexShortcode
          let flexNode: any = null
          let flexNodeSize: number = 0
          let flexPos: number = -1

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === this.name) {
              flexNode = node
              flexNodeSize = node.nodeSize
              flexPos = pos
              return false
            }
          })

          // Если курсор на flexShortcode, разворачиваем его обратно в текст
          if (flexNode && flexPos >= 0) {
            const content: Array<{
              type: string
              content?: Array<{ type: string; text: string }>
            }> = []

            content.push({
              type: 'paragraph',
              content: [{ type: 'text', text: '[flex]' }],
            })

            flexNode.forEach((child: any) => {
              if (child.type.name === 'flexColumn') {
                const title = child.attrs.title || ''
                content.push({
                  type: 'paragraph',
                  content: [{ type: 'text', text: `[col title='${title}']` }],
                })

                // Добавляем содержимое колонки
                child.content.forEach((blockNode: any) => {
                  const text = blockNode.textContent || ''
                  content.push({
                    type: 'paragraph',
                    content: text ? [{ type: 'text', text }] : [],
                  })
                })

                content.push({
                  type: 'paragraph',
                  content: [{ type: 'text', text: '[/col]' }],
                })
              }
            })

            content.push({
              type: 'paragraph',
              content: [{ type: 'text', text: '[/flex]' }],
            })

            return chain()
              .focus()
              .deleteRange({ from: flexPos, to: flexPos + flexNodeSize })
              .insertContentAt(flexPos, content)
              .run()
          }

          return false
        },
    }
  },
})
