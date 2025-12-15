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
        // Парсим оба варианта: audio-block и raw-html-embed
        tag: 'div.raw-html-embed',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const audio = el.querySelector('audio')
          const span = el.querySelector('span')

          if (!audio) return false

          const src = audio.getAttribute('src') || ''
          const text = span?.textContent || ''

          // Определяем позицию текста по порядку элементов
          let textPosition: 'left' | 'right' = 'right'
          if (span && audio) {
            const spanIndex = Array.from(el.children).indexOf(span)
            const audioIndex = Array.from(el.children).indexOf(audio)
            textPosition = spanIndex < audioIndex ? 'left' : 'right'
          }

          return { src, text, textPosition }
        }
      },
      {
        // Также поддерживаем div.audio-block для обратной совместимости
        tag: 'div.audio-block',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const audio = el.querySelector('audio')
          const span = el.querySelector('span')

          if (!audio) return false

          return {
            src: audio.getAttribute('src') || '',
            text: span?.textContent || '',
            textPosition: el.classList.contains('text-left') ? 'left' : 'right'
          }
        }
      }
    ]
  },

  renderHTML({ node }) {
    const { src, text, textPosition } = node.attrs

    const audioHTML = `<audio class="audio" controls="" controlslist="nodownload" src="${src}"></audio>`
    const textHTML = text ? `<span>${text}</span>` : ''

    const content = textPosition === 'left'
      ? textHTML + audioHTML
      : audioHTML + textHTML

    return ['div', { class: 'raw-html-embed' }, ['div', { innerHTML: content }]]
  },

  addNodeView() {
    return ({ node }) => {
      const { src, text, textPosition } = node.attrs

      const dom = document.createElement('div')
      dom.className = 'raw-html-embed'

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
