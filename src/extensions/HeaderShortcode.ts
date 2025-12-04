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
          ({ commands, state, chain }) => {
            const { from, to, empty } = state.selection

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
