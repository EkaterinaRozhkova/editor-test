import { Extension } from '@tiptap/core'


declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    sectionExtension: {
      insertSectionExtension: (options?: {
        text?: string,
        icon: string
      }) => ReturnType
    }
  }
}

export const SectionExtension = Extension.create({
  name: 'sectionExtension',

  addCommands() {
    return {
      insertSectionExtension:
        (options) =>
          ({ chain }) => {
            const text = options?.text ?? ''
            const icon = options?.icon ?? ''

            const content = `[section icon='${icon}']${text}[/section]`

            return chain().focus().insertContent(content).run()
          },
    }
  },
})
