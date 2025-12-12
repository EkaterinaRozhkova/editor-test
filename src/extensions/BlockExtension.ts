import { Extension } from '@tiptap/core'

export interface BlocksRow {
  title: string
  content: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockExtension: {
      insertBlockExtension: (options?: {
        rows?: BlocksRow[]
      }) => ReturnType
    }
  }
}

export const BlockExtension = Extension.create({
  name: 'blockExtension',

  addCommands() {
    return {
      insertBlockExtension:
        (options) =>
          ({ chain }) => {
            const rows: BlocksRow[] = options?.rows ?? []

            const contentLines = ['[flex]']

            rows.forEach((row, index) => {
              const isFinal = index === rows.length - 1
              contentLines.push(`[row title='${row.title}'${isFinal ? " final='true'" : ''}]`)
              contentLines.push(row.content)
              contentLines.push('[/row]')
            })

            contentLines.push('[/flex]')

            const content = contentLines.join('\n')

            return chain().focus().insertContent(content).run()
          },
    }
  },
})
