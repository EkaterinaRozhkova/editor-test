// extensions/HeaderSnippet.ts
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    headerSnippet: {
      insertHeaderSnippet: (options?: {
        text?: string
      }) => ReturnType
    }
  }
}

export const HeaderSnippet = Extension.create({
  name: 'headerSnippet',

  addCommands() {
    return {
      insertHeaderSnippet:
        (options) =>
          ({ chain }) => {
            const text = options?.text ?? ''

            const snippet = `[header]${text}[/header]`

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})