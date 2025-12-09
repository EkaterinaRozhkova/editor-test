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

    // Добавляем кнопку удаления
    children.push([
      'button',
      {
        class: 'audio-block-delete',
        type: 'button',
        'data-delete-audio': 'true',
        style: 'position: absolute; top: 8px; right: 8px; width: 24px; height: 24px; padding: 0; border: none; background: rgba(0, 0, 0, 0.6); color: white; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; line-height: 1; z-index: 10;'
      },
      '×'
    ])

    return [
      'div',
      {
        class: 'raw-html-embed',
        style: 'position: relative;'
      },
      ...children
    ]
  },

  addNodeView() {
    return ({ node, editor, getPos }) => {
      const dom = document.createElement('div')
      dom.className = 'raw-html-embed'
      dom.style.position = 'relative'

      const { src, text, textPosition } = node.attrs

      // Создаем элементы
      const audio = document.createElement('audio')
      audio.className = 'audio'
      audio.controls = true
      audio.setAttribute('controlslist', 'nodownload')
      audio.src = src

      const span = document.createElement('span')
      span.textContent = text

      // Добавляем в нужном порядке
      if (textPosition === 'left' && text) {
        dom.appendChild(span)
        dom.appendChild(audio)
      } else {
        dom.appendChild(audio)
        if (text) {
          dom.appendChild(span)
        }
      }

      // Создаем кнопку удаления
      const deleteButton = document.createElement('button')
      deleteButton.className = 'audio-block-delete'
      deleteButton.type = 'button'
      deleteButton.textContent = '×'
      deleteButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        padding: 0;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        line-height: 1;
        z-index: 10;
        transition: background 0.2s;
      `

      // Обработчик удаления
      deleteButton.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (typeof getPos === 'function') {
          const pos = getPos()
          editor.commands.deleteRange({
            from: pos ?? 0,
            to: pos ?? 0 + node.nodeSize
          })
        }
      })

      dom.appendChild(deleteButton)

      return {
        dom,
        destroy() {
          deleteButton.removeEventListener('click', () => {})
        }
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
