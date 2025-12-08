import { Extension } from '@tiptap/core'


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sectionSnippet: {
      insertSectionSnippet: (options?: {
        text?: string,
        icon: string
      }) => ReturnType
    }
  }
}

export const SectionSnippet = Extension.create({
  name: 'sectionSnippet',

  addCommands() {
    return {
      insertSectionSnippet:
        (options) =>
          ({ chain }) => {
            const text = options?.text ?? ''
            const icon = options?.icon ?? ''

            const snippet = `[section icon='${icon}']${text}[/section]`

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})
