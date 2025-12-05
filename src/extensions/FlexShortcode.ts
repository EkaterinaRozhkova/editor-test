import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FlexShortcodeView from '@/components/FlexShortcodeView.vue'
import FlexColumnView from '@/components/FlexColumnView.vue'

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
    const result: any[] = []

    // Функция для создания DOM структуры с marks
    const wrapWithMarks = (text: string, marks: readonly any[]): any => {
      if (marks.length === 0) {
        return text
      }

      let wrapped: any = text

      for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i]

        if (mark.type.name === 'bold') {
          wrapped = ['strong', {}, wrapped]
        } else if (mark.type.name === 'strike') {
          wrapped = ['s', {}, wrapped]
        } else if (mark.type.name === 'italic') {
          wrapped = ['em', {}, wrapped]
        } else if (mark.type.name === 'underline') {
          wrapped = ['u', {}, wrapped]
        } else if (mark.type.name === 'code') {
          wrapped = ['code', {}, wrapped]
        } else if (mark.type.name === 'highlight') {
          wrapped = ['mark', {}, wrapped]
        } else if (mark.type.name === 'link') {
          const href = mark.attrs.href || ''
          wrapped = ['a', { href }, wrapped]
        } else if (mark.type.name === 'subscript') {
          wrapped = ['sub', {}, wrapped]
        } else if (mark.type.name === 'superscript') {
          wrapped = ['sup', {}, wrapped]
        }
      }

      return wrapped
    }

    // Функция для сериализации inline содержимого
    const serializeInlineContent = (node: any): any[] => {
      const content: any[] = []
      node.content.forEach((inline: any) => {
        if (inline.isText) {
          const text = inline.text || ''
          if (inline.marks && inline.marks.length > 0) {
            content.push(wrapWithMarks(text, inline.marks))
          } else {
            content.push(text)
          }
        }
      })
      return content
    }

    // Функция для сериализации блочного элемента
    const serializeBlock = (blockNode: any): any => {
      const type = blockNode.type.name

      if (type === 'paragraph') {
        const content = serializeInlineContent(blockNode)
        return content.length > 0 ? ['p', {}, ...content] : ['p', {}, '\u00A0']
      }
      else if (type === 'heading') {
        const level = blockNode.attrs.level || 1
        const content = serializeInlineContent(blockNode)
        return [`h${level}`, {}, ...content]
      }
      else if (type === 'bulletList') {
        const items: any[] = []
        blockNode.content.forEach((listItem: any) => {
          const itemContent: any[] = []
          listItem.content.forEach((itemBlock: any) => {
            if (itemBlock.type.name === 'paragraph') {
              itemContent.push(...serializeInlineContent(itemBlock))
            }
          })
          items.push(['li', {}, ...itemContent])
        })
        return ['ul', {}, ...items]
      }
      else if (type === 'orderedList') {
        const items: any[] = []
        const start = blockNode.attrs.start || 1
        blockNode.content.forEach((listItem: any) => {
          const itemContent: any[] = []
          listItem.content.forEach((itemBlock: any) => {
            if (itemBlock.type.name === 'paragraph') {
              itemContent.push(...serializeInlineContent(itemBlock))
            }
          })
          items.push(['li', {}, ...itemContent])
        })
        return start === 1 ? ['ol', {}, ...items] : ['ol', { start }, ...items]
      }

      return ['p', {}, '\u00A0']
    }

    // Формируем открывающий тег
    let openingText = '[flex]'

    node.content.forEach((child, index) => {
      if (child.type.name === 'flexColumn') {
        const title = child.attrs.title || ''
        const isFinal = index === node.content.childCount - 1
        const finalAttr = isFinal ? " final='true'" : ''
        openingText += `[col title='${title}'${finalAttr}]`
      }
    })

    // Первый параграф с открывающими тегами
    result.push(['p', {}, openingText])

    // Обрабатываем содержимое всех колонок
    node.content.forEach((child) => {
      if (child.type.name === 'flexColumn') {
        child.content.forEach((blockNode) => {
          result.push(serializeBlock(blockNode))
        })
      }
    })

    // Закрывающий тег
    result.push(['p', {}, '[/col][/flex]'])

    // Три пустых параграфа
    result.push(['p', {}, '\u00A0'])
    result.push(['p', {}, '\u00A0'])
    result.push(['p', {}, '\u00A0'])

    return ['div', { 'data-type': 'flex-shortcode' }, ...result]
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

// Экспортируем также FlexColumn для использования в редакторе
export const FlexColumn = Node.create({
  name: 'flexColumn',

  content: '(paragraph | heading | bulletList | orderedList)+',

  group: 'flexColumn',

  isolating: false,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="flex-column"]',
      },
    ]
  },

  renderHTML() {
    return ['div', { 'data-type': 'flex-column' }, 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(FlexColumnView)
  },
})