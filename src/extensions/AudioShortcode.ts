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
        tag: 'div.raw-html-embed',
        getAttrs: (element) => {
          const el = element as HTMLElement
          const audio = el.querySelector('audio')
          const span = el.querySelector('span')

          if (!audio) return false

          const src = audio.getAttribute('src') || ''
          const text = span?.textContent || ''

          let textPosition: 'left' | 'right' = 'right'
          if (span && audio) {
            const spanIndex = Array.from(el.children).indexOf(span)
            const audioIndex = Array.from(el.children).indexOf(audio)
            textPosition = spanIndex < audioIndex ? 'left' : 'right'
          }

          return { src, text, textPosition }
        }
      }
    ]
  },

  renderHTML({ node }) {
    const { src, text, textPosition } = node.attrs

    // Создаем структуру без innerHTML
    const audioAttrs = {
      class: 'audio',
      controls: '',
      controlslist: 'nodownload',
      src: src
    }

    const children = []

    if (textPosition === 'left' && text) {
      children.push(['span', {}, text])
      children.push(['audio', audioAttrs])
    } else {
      children.push(['audio', audioAttrs])
      if (text) {
        children.push(['span', {}, text])
      }
    }

    return ['div', { class: 'raw-html-embed' }, ...children]
  },

  addNodeView() {
    return ({ node }) => {
      const { src, text, textPosition } = node.attrs

      const dom = document.createElement('div')
      dom.className = 'raw-html-embed'

      const audio = document.createElement('audio')
      audio.className = 'audio'
      audio.controls = true
      audio.setAttribute('controlslist', 'nodownload')
      audio.src = src

      if (textPosition === 'left' && text) {
        const span = document.createElement('span')
        span.textContent = text
        dom.appendChild(span)
        dom.appendChild(audio)
      } else {
        dom.appendChild(audio)
        if (text) {
          const span = document.createElement('span')
          span.textContent = text
          dom.appendChild(span)
        }
      }

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
