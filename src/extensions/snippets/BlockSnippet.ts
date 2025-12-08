import { Extension } from '@tiptap/core'

export interface BlocksRow {
  title: string
  content: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockSnippet: {
      insertBlockSnippet: (options?: {
        rows?: BlocksRow[]
      }) => ReturnType
    }
  }
}

export const BlockSnippet = Extension.create({
  name: 'blockSnippet',

  addCommands() {
    return {
      insertBlockSnippet:
        (options) =>
          ({ chain }) => {
            const rows: BlocksRow[] = options?.rows ?? []

            const snippetLines = ['[flex]']

            rows.forEach((row, index) => {
              const isFinal = index === rows.length - 1
              snippetLines.push(`[row title='${row.title}'${isFinal ? " final='true'" : ''}]`)
              snippetLines.push(row.content)
              snippetLines.push('[/row]')
            })

            snippetLines.push('[/flex]')

            const snippet = snippetLines.join('\n')

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})
