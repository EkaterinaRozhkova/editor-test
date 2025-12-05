import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    headerShortcode: {
      toggleHeaderShortcode: () => ReturnType
    }
  }
}

export const HeaderShortcode = Node.create({
  name: 'headerShortcode',

  group: 'inline',

  inline: true,

  atom: true,

  selectable: true,

  draggable: true,

  addAttributes() {
    return {
      text: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="header-shortcode"]',
        getAttrs: (element) => ({
          text: (element as HTMLElement).getAttribute('data-text') || '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    return [
      'span',
      {
        'data-type': 'header-shortcode',
        'data-text': node.attrs.text,
      },
      `[header]${node.attrs.text}[/header]`,
    ]
  },

  addCommands() {
    return {
      toggleHeaderShortcode:
        () =>
          ({ state, chain }) => {
            const { from, to, empty } = state.selection

            // Проверяем, находится ли курсор внутри или на headerShortcode
            let headerNodeText: string = ''
            let headerNodeSize: number = 0
            let headerPos: number = -1
            let foundNode = false

            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === this.name) {
                headerNodeText = String(node.attrs.text || '')
                headerNodeSize = node.nodeSize
                headerPos = pos
                foundNode = true
                return false
              }
            })

            // Если курсор на headerShortcode, разворачиваем его обратно в текст
            if (foundNode && headerPos >= 0) {
              return chain()
                .focus()
                .deleteRange({ from: headerPos, to: headerPos + headerNodeSize })
                .insertContentAt(headerPos, { type: 'text', text: headerNodeText })
                .run()
            }

            // Если не внутри шорткода, создаем новый
            if (empty) return false

            // Получаем выделенный текст
            const selectedText = state.doc.textBetween(from, to, '')

            if (!selectedText) return false

            // Удаляем выделенный текст и вставляем шорткод
            return chain()
              .focus()
              .deleteRange({ from, to })
              .insertContent({
                type: this.name,
                attrs: { text: selectedText },
              })
              .run()
          },
    }
  }
})
