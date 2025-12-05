import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import HeaderShortcodeNodeView from '@/components/HeaderShortcodeNodeView.vue'

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

  // Делаем атомарной, чтобы нельзя было редактировать текст напрямую
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
        getAttrs: element => ({
          text: (element as HTMLElement).getAttribute('data-text') || '',
        }),
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'header-shortcode',
        'data-text': node.attrs.text,
      }),
      `[header]${node.attrs.text}[/header]`,
    ]
  },

  addNodeView() {
    // Подключаем Vue-компонент для отрисовки ноды
    return VueNodeViewRenderer(HeaderShortcodeNodeView)
  },

  addCommands() {
    return {
      toggleHeaderShortcode:
        () =>
          ({ state, chain }) => {
            const { from, to, empty } = state.selection

            let headerNodeText = ''
            let headerNodeSize = 0
            let headerPos = -1
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
                .insertContentAt(headerPos, {
                  type: 'text',
                  text: headerNodeText,
                })
                .run()
            }

            if (empty) return false

            const selectedText = state.doc.textBetween(from, to, '')

            if (!selectedText) return false

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
  },
})
