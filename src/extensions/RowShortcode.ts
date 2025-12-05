import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import RowShortcodeView from '@/components/RowShortcodeView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rowShortcode: {
      insertRowShortcode: (rows?: number) => ReturnType
      toggleRowShortcode: () => ReturnType
    }
  }
}

export const RowShortcode = Node.create({
  name: 'rowShortcode',

  group: 'block',

  content: 'row+',

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
        tag: 'div[data-type="row-shortcode"]',
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

      // Оборачиваем от последнего mark к первому
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

    // Формируем открывающий тег
    let openingText = "[flex column='true']"

    node.content.forEach((child, index) => {
      if (child.type.name === 'row') {
        const title = child.attrs.title || ''
        const isFinal = index === node.content.childCount - 1
        const finalAttr = isFinal ? " final='true'" : ''
        openingText += `[row title='${title}'${finalAttr}]`
      }
    })

    // Первый параграф с открывающими тегами
    result.push(['p', {}, openingText])

    // Обрабатываем содержимое всех строк
    node.content.forEach((child) => {
      if (child.type.name === 'row') {
        child.content.forEach((blockNode) => {
          const contentArray: any[] = []

          // Проходим по всем inline элементам
          blockNode.content.forEach((inline) => {
            if (inline.isText) {
              const text = inline.text || ''
              if (inline.marks && inline.marks.length > 0) {
                // Оборачиваем текст в marks
                contentArray.push(wrapWithMarks(text, inline.marks))
              } else {
                contentArray.push(text)
              }
            }
          })

          // Создаем параграф только если есть содержимое
          if (contentArray.length > 0) {
            result.push(['p', {}, ...contentArray])
          }
        })
      }
    })

    // Закрывающий тег
    result.push(['p', {}, '[/row][/flex]'])

    // Три пустых параграфа
    result.push(['p', {}, '\u00A0'])
    result.push(['p', {}, '\u00A0'])
    result.push(['p', {}, '\u00A0'])

    // Возвращаем div с результатом
    return ['div', { 'data-type': 'row-shortcode' }, ...result]
  },

  addNodeView() {
    return VueNodeViewRenderer(RowShortcodeView)
  },

  addCommands() {
    return {
      insertRowShortcode:
        (rows = 2) =>
          ({ chain }) => {
            const content = []
            for (let i = 0; i < rows; i++) {
              content.push({
                type: 'row',
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

      toggleRowShortcode:
        () =>
          ({ state, chain }) => {
            const { from, to } = state.selection

            let rowNode: any = null
            let rowNodeSize: number = 0
            let rowPos: number = -1

            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.type.name === this.name) {
                rowNode = node
                rowNodeSize = node.nodeSize
                rowPos = pos
                return false
              }
            })

            if (rowNode && rowPos >= 0) {
              const content: Array<{
                type: string
                content?: Array<{ type: string; text: string }>
              }> = []

              content.push({
                type: 'paragraph',
                content: [{ type: 'text', text: "[flex column='true']" }],
              })

              rowNode.forEach((child: any) => {
                if (child.type.name === 'row') {
                  const title = child.attrs.title || ''
                  content.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: `[row title='${title}']` }],
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
                    content: [{ type: 'text', text: '[/row]' }],
                  })
                }
              })

              content.push({
                type: 'paragraph',
                content: [{ type: 'text', text: '[/flex]' }],
              })

              return chain()
                .focus()
                .deleteRange({ from: rowPos, to: rowPos + rowNodeSize })
                .insertContentAt(rowPos, content)
                .run()
            }

            return false
          },
    }
  },
})
