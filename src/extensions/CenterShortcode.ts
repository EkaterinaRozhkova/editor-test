import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    centerShortcode: {
      toggleCenterShortcode: () => ReturnType
    }
  }
}

export const CenterShortcode = Node.create({
  name: 'centerShortcode',

  group: 'block',

  inline: false,

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
        tag: 'div[data-type="center-shortcode"]',
        getAttrs: (element) => ({
          text: (element as HTMLElement).getAttribute('data-text') || '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    return [
      ['p', '[center]'],
      ['p', node.attrs.text],
      ['p', '[/center]'],
    ]
  },

  addCommands() {
    return {
      toggleCenterShortcode:
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
