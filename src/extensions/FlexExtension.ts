// extensions/FlexExtension.ts
import { Extension } from '@tiptap/core'

export interface FlexColumn {
  title: string
  content: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flexExtension: {
      insertFlexExtension: (options?: {
        columns?: FlexColumn[]
      }) => ReturnType
    }
  }
}

export const FlexExtension = Extension.create({
  name: 'flexExtension',

  addCommands() {
    return {
      insertFlexExtension:
        (options) =>
          ({ chain }) => {
            const columns = options?.columns ?? []

            const contentLines = ['[flex]']

            columns.forEach((column, index) => {
              const isFinal = index === columns.length - 1
              contentLines.push(`[col title='${column.title}'${isFinal ? " final='true'" : ''}]`)
              contentLines.push(column.content)
              contentLines.push('[/col]')
            })

            contentLines.push('[/flex]')

            const content = contentLines.join('\n')

            return chain().focus().insertContent(content).run()
          },
    }
  },
})
