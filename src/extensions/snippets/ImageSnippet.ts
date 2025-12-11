import { Extension } from '@tiptap/core'

export interface ImageSnippetOptions {
  url: string
  name?: string
  width?: string | number
  alt?: string
  text?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageSnippet: {
      insertImageSnippet: (options: ImageSnippetOptions) => ReturnType
    }
  }
}

export const ImageSnippet = Extension.create({
  name: 'imageSnippet',

  addCommands() {
    return {
      insertImageSnippet:
        (options) =>
          ({ chain }) => {
            const {
              url,
              name = '',
              width = '50',
              alt = '',
              text = ''
            } = options

            const snippetLines = [
              `[img url='${url}' loading='lazy' name='${name}' width='${width}' alt='${alt}']`
            ]

            if (text) {
              snippetLines.push(text)
            }

            snippetLines.push('[/img]')

            const snippet = snippetLines.join('\n')

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})
