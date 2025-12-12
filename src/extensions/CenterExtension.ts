import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    centerExtension: {
      insertCenterExtension: (options?: {
        text?: string
      }) => ReturnType
    }
  }
}

export const CenterExtension = Extension.create({
  name: 'centerExtension',

  addCommands() {
    return {
      insertCenterExtension:
        (options) =>
          ({ chain }) => {
            const text = options?.text ?? ''

            // Разбиваем на строки
            const lines = text.split('\n')

            // Группируем строки в параграфы (разделенные пустыми строками)
            const paragraphs: string[][] = []
            let currentParagraph: string[] = []

            lines.forEach(line => {
              if (line.trim() === '') {
                // Пустая строка - начинаем новый параграф
                if (currentParagraph.length > 0) {
                  paragraphs.push(currentParagraph)
                  currentParagraph = []
                }
              } else {
                currentParagraph.push(line)
              }
            })

            // Добавляем последний параграф, если он не пустой
            if (currentParagraph.length > 0) {
              paragraphs.push(currentParagraph)
            }

            // Создаем контент
            const content: any[] = [
              { type: 'paragraph', content: [{ type: 'text', text: '[center]' }] }
            ]

            // Для каждого параграфа создаем элементы с hardBreak между строками
            paragraphs.forEach(paragraphLines => {
              const paragraphContent: any[] = []

              paragraphLines.forEach((line, index) => {
                paragraphContent.push({ type: 'text', text: line })
                // Добавляем <br> между строками внутри параграфа
                if (index < paragraphLines.length - 1) {
                  paragraphContent.push({ type: 'hardBreak' })
                }
              })

              content.push({
                type: 'paragraph',
                content: paragraphContent
              })
            })

            content.push(
              { type: 'paragraph', content: [{ type: 'text', text: '[/center]' }] }
            )

            return chain().focus().insertContent(content).run()
          },
    }
  },
})
