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

  // ВАЖНО: убираем atom
  atom: false,

  // Внутри ноды может быть текст
  content: 'text*',

  selectable: true, // по желанию можно оставить / убрать

  parseHTML() {
    return [
      {
        tag: 'span[data-type="header-shortcode"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // contentDOM будет на месте "0"
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-type': 'header-shortcode',
      },
      // статическая открывающая часть
      ['span', { 'data-role': 'open' }, '[header]'],
      // зона редактируемого текста
      ['span', { 'data-role': 'content' }, 0],
      // статическая закрывающая часть
      ['span', { 'data-role': 'close' }, '[/header]'],
    ]
  },

  addCommands() {
    return {
      toggleHeaderShortcode:
        () =>
          ({ state, chain }) => {
            const { from, to, empty } = state.selection
            const { doc } = state

            let headerNode: any = null
            let headerPos = -1

            // ищем headerShortcode в выделении / под курсором
            doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === this.name) {
                headerNode = node
                headerPos = pos
                return false
              }
            })

            // Если нашли — разворачиваем обратно в текст
            if (headerNode && headerPos >= 0) {
              const text = headerNode.textContent || ''

              return chain()
                .focus()
                .insertContentAt(
                  { from: headerPos, to: headerPos + headerNode.nodeSize },
                  text,
                )
                .run()
            }

            // Если не внутри шорткода, создаем новый из выделения
            if (empty) return false

            const selectedText = doc.textBetween(from, to, '')

            if (!selectedText) return false

            return chain()
              .focus()
              .deleteRange({ from, to })
              .insertContent({
                type: this.name,
                content: [{ type: 'text', text: selectedText }],
              })
              .run()
          },
    }
  },
})
