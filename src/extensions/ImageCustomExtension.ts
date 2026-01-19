import { Extension } from '@tiptap/core'

export interface ImageExtensionOptions {
  url: string
  name?: string
  width?: string | number
  alt?: string
  text?: string
  position?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageCustomExtension: {
      insertImageExtension: (options: ImageExtensionOptions) => ReturnType
    }
  }
}

export const ImageCustomExtension = Extension.create({
  name: 'imageCustomExtension',

  addCommands() {
    return {
      insertImageExtension:
        (options) =>
          ({ chain }) => {
            const {
              url,
              name = '',
              width = '50',
              alt = '',
              text = '',
              position = 'left'
            } = options

            const contentLines = [
              `[img url='${url}' loading='lazy' name='${name}' float='${position}' width='${width}' alt='${alt}']`
            ]

            if (text) {
              contentLines.push(text)
            }

            contentLines.push('[/img]')

            const content = contentLines.join('\n')

            return chain().focus().insertContent(content).run()
          },
    }
  },
})
