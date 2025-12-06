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
            const lines = text.split('\n')

            const content = [
              { type: 'paragraph', content: [{ type: 'text', text: '[center]' }] },
              ...lines.map(line => ({
                type: 'paragraph',
                content: line ? [{ type: 'text', text: line }] : []
              })),
              { type: 'paragraph', content: [{ type: 'text', text: '[/center]' }] }
            ]

            return chain().focus().insertContent(content).run()
          },
    }
    //   insertCenterSnippet:
    //     (options) =>
    //       ({ chain }) => {
    //         const text = options?.text ?? ''
    //
    //         const snippet = `[center]${text}[/center]`
    //
    //         return chain().focus().insertContent(snippet).run()
    //       },
    // }
  },
})
