// extensions/AudioBlock.ts
import { Node } from '@tiptap/core'

export interface AudioBlockOptions {
  src: string
  text: string
  textPosition: 'left' | 'right'
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audioBlock: {
      insertAudioBlock: (options: AudioBlockOptions) => ReturnType
    }
  }
}

export const AudioBlock = Node.create({
  name: 'audioBlock',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      text: {
        default: '',
      },
      textPosition: {
        default: 'right',
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.audio-block',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const audio = el.querySelector('audio')
          const span = el.querySelector('span')
          return {
            src: audio?.getAttribute('src') || '',
            text: span?.textContent || '',
            textPosition: el.classList.contains('text-left') ? 'left' : 'right'
          }
        }
      }
    ]
  },

  renderHTML({ node }) {
    const { src, text, textPosition } = node.attrs

    const wrapper = document.createElement('div')
    wrapper.className = 'audio-block raw-html-embed'

    const audioHTML = `<audio class="audio" controls="" controlslist="nodownload" src="${src}"></audio>`
    const textHTML = text ? `<span>${text}</span>` : ''

    wrapper.innerHTML = textPosition === 'left'
      ? textHTML + audioHTML
      : audioHTML + textHTML

    return wrapper
  },

  addNodeView() {
    return ({ node }) => {
      const { src, text, textPosition } = node.attrs

      const dom = document.createElement('div')
      dom.className = 'audio-block raw-html-embed'

      const audioHTML = `<audio class="audio" controls="" controlslist="nodownload" src="${src}"></audio>`
      const textHTML = text ? `<span>${text}</span>` : ''

      dom.innerHTML = textPosition === 'left'
        ? textHTML + audioHTML
        : audioHTML + textHTML

      return {
        dom,
      }
    }
  },

  addCommands() {
    return {
      insertAudioBlock: (options: AudioBlockOptions) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options
        })
      }
    }
  }
})
