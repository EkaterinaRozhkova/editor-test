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

  inline: false,

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      columns: {
        default: [],
        parseHTML: (element) => {
          try {
            return JSON.parse((element as HTMLElement).getAttribute('data-columns') || '[]')
          } catch {
            return []
          }
        },
        renderHTML: (attributes) => {
          return {
            'data-columns': JSON.stringify(attributes.columns),
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="flex-shortcode"]',
      },
    ]
  },

  renderHTML({ node }) {
    const columns = node.attrs.columns || []

    // Формируем текст шорткода
    const shortcodeParts: string[] = []
    shortcodeParts.push('[flex]')

    columns.forEach((col: { title: string; text: string }, index: number) => {
      const isFinal = index === columns.length - 1
      const finalAttr = isFinal ? " final='true'" : ''
      shortcodeParts.push(`[col title='${col.title}'${finalAttr}]`)
      shortcodeParts.push(col.text)
      shortcodeParts.push('[/col]')
    })

    shortcodeParts.push('[/flex]')

    // Объединяем в один текст с переносами строк
    const shortcodeText = shortcodeParts.join('\n')

    return [
      'div',
      {
        'data-type': 'flex-shortcode',
        'data-columns': JSON.stringify(columns),
      },
      shortcodeText,
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
          const cols = []
          for (let i = 0; i < columns; i++) {
            cols.push({
              title: `Заголовок ${i + 1}`,
              text: 'Текст колонки...',
            })
          }

          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { columns: cols },
            })
            .run()
        },

      toggleFlexShortcode:
        () =>
        ({ state, chain }) => {
          const { from, to } = state.selection

          // Проверяем, находится ли курсор внутри flexShortcode
          let flexNodeColumns: any[] = []
          let flexNodeSize: number = 0
          let flexPos: number = -1
          let foundNode = false

          state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.type.name === this.name) {
              flexNodeColumns = node.attrs.columns || []
              flexNodeSize = node.nodeSize
              flexPos = pos
              foundNode = true
              return false
            }
          })

          // Если курсор на flexShortcode, разворачиваем его обратно в текст
          if (foundNode && flexPos >= 0) {
            const shortcodeText = flexNodeColumns
              .map((col: any, index: number) => {
                const isFinal = index === flexNodeColumns.length - 1
                const finalAttr = isFinal ? " final='true'" : ''
                return `[col title='${col.title}'${finalAttr}]\n${col.text}\n[/col]`
              })
              .join('\n')

            const fullText = `[flex]\n${shortcodeText}\n[/flex]`
            const lines = fullText.split('\n')

            const content: Array<{
              type: string
              content?: Array<{ type: string; text: string }>
            }> = []
            lines.forEach((line: string) => {
              content.push({
                type: 'paragraph',
                content: line ? [{ type: 'text', text: line }] : [],
              })
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