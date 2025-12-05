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

  renderHTML() {
    return [
      'div',
      {
        'data-type': 'flex-shortcode',
      },
      0,
    ]
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
