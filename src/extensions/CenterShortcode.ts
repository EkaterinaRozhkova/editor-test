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
        tag: 'div[data-type="center-shortcode"]',
        getAttrs: (element) => ({
          text: (element as HTMLElement).getAttribute('data-text') || '',
        }),
      },
    ]
  },

  renderHTML({ node }) {
    // Преобразуем переносы строк в <br> теги
    const lines = node.attrs.text.split('\n')
    const contentWithBreaks: (string | string[])[] = []

    lines.forEach((line: string, index: number) => {
      contentWithBreaks.push(line)
      if (index < lines.length - 1) {
        contentWithBreaks.push(['br'])
      }
    })

    return [
      'div',
      { 'data-type': 'center-shortcode', 'data-text': node.attrs.text },
      ['p', {}, '[center]'],
      ['p', {}, ...contentWithBreaks],
      ['p', {}, '[/center]'],
    ]
  },

  addCommands() {
    return {
      toggleCenterShortcode:
        () =>
          ({ state, chain }) => {
            const { from, to, empty } = state.selection

            // Проверяем, находится ли курсор внутри или на centerShortcode
            let centerNodeText: string = ''
            let centerNodeSize: number = 0
            let centerPos: number = -1
            let foundNode = false

            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === this.name) {
                centerNodeText = String(node.attrs.text || '')
                centerNodeSize = node.nodeSize
                centerPos = pos
                foundNode = true
                return false
              }
            })

            // Если курсор на centerShortcode, разворачиваем его обратно в текст
            if (foundNode && centerPos >= 0) {
              const lines = centerNodeText.split('\n')

              // Создаем содержимое из параграфов
              const content: Array<{ type: string; content?: Array<{ type: string; text: string }> }> = []
              lines.forEach((line: string) => {
                content.push({
                  type: 'paragraph',
                  content: line ? [{ type: 'text', text: line }] : []
                })
              })

              return chain()
                .focus()
                .deleteRange({ from: centerPos, to: centerPos + centerNodeSize })
                .insertContentAt(centerPos, content)
                .run()
            }

            // Если не внутри шорткода, создаем новый
            if (empty) return false

            // Получаем выделенный текст с сохранением переносов строк
            const selectedText = state.doc.textBetween(from, to, '\n', '\n')

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
