// extensions/HeaderExtension.ts
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    headerExtension: {
      insertHeaderExtension: (options?: {
        text?: string
      }) => ReturnType
    }
  }
}

export const HeaderExtension = Extension.create({
  name: 'headerExtension',

  addCommands() {
    return {
      insertHeaderExtension:
        (options) =>
          ({ chain }) => {
            const text = options?.text ?? ''

            const content = `[header]${text}[/header]`

            return chain().focus().insertContent(content).run()
          },
    }
  },
})