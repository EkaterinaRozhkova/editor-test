import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    centerSnippet: {
      insertCenterSnippet: (options?: {
        text?: string
      }) => ReturnType
    }
  }
}

export const CenterSnippet = Extension.create({
  name: 'centerSnippet',

  addCommands() {
    return {
      insertCenterSnippet:
        (options) =>
          ({ chain }) => {
            const text = options?.text ?? ''

            const snippet = `[center]${text}[/center]`

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})
