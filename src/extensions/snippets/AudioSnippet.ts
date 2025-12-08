// extensions/AudioSnippet.ts
import { Extension } from '@tiptap/core'

export interface AudioSnippetOptions {
  src: string
  text: string
  textPosition: 'left' | 'right'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audioSnippet: {
      insertAudioSnippet: (options: AudioSnippetOptions) => ReturnType
    }
  }
}

export const AudioSnippet = Extension.create({
  name: 'audioSnippet',

  addCommands() {
    return {
      insertAudioSnippet:
        (options) =>
          ({ chain }) => {
            const { src, text, textPosition } = options

            const audioElement = `<audio class="audio" controls="" controlslist="nodownload" src="${src}"></audio>`
            const textElement = text ? `<span>${text}</span>` : ''

            let snippet = ''
            if (textPosition === 'left') {
              snippet = `${textElement}${audioElement}`
            } else {
              snippet = `${audioElement}${textElement}`
            }

            return chain().focus().insertContent(snippet).run()
          },
    }
  },
})