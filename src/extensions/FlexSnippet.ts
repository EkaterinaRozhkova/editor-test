// extensions/FlexSnippet.ts
import { Extension } from '@tiptap/core'

export interface FlexColumn {
  title: string
  content: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    flexSnippet: {
      insertFlexSnippet: (options?: {
        columns?: FlexColumn[]
      }) => ReturnType
    }
  }
}

export const FlexSnippet = Extension.create({
  name: 'flexSnippet',

  addCommands() {
    return {
      insertFlexSnippet:
        (options) =>
          ({ chain }) => {
            const columns = options?.columns ?? []

            const snippetLines = ['[flex]']

            columns.forEach((column, index) => {
              const isFinal = index === columns.length - 1
              snippetLines.push(`[col title='${column.title}'${isFinal ? " final='true'" : ''}]`)
              snippetLines.push(column.content)
              snippetLines.push('[/col]')
            })

            snippetLines.push('[/flex]')

            const snippet = snippetLines.join('\n')

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})
