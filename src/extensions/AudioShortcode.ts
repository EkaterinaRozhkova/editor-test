// audioShortcode.ts
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import AudioShortcodeComponent from '@/components/AudioShortcodeComponent.vue'

export interface AudioShortcodeOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audioShortcode: {
      setAudioShortcode: (attributes: {
        path: string
        text?: string
        textPosition?: 'left' | 'right'
      }) => ReturnType
    }
  }
}

export const AudioShortcode = Node.create<AudioShortcodeOptions>({
  name: 'audioShortcode',

  group: 'block',

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      path: {
        default: '',
        parseHTML: element => {
          const audio = element.querySelector('audio')
          return audio?.getAttribute('data-path') || element.getAttribute('data-path') || ''
        },
        renderHTML: attributes => {
          if (!attributes.path) {
            return {}
          }
          return { 'data-path': attributes.path }
        },
      },
      text: {
        default: '',
        parseHTML: element => {
          const audio = element.querySelector('audio')
          return audio?.getAttribute('data-text') || element.getAttribute('data-text') || ''
        },
        renderHTML: attributes => {
          if (!attributes.text) {
            return {}
          }
          return { 'data-text': attributes.text }
        },
      },
      textPosition: {
        default: 'left',
        parseHTML: element => {
          const audio = element.querySelector('audio')
          return audio?.getAttribute('data-text-position') || element.getAttribute('data-text-position') || 'left'
        },
        renderHTML: attributes => {
          if (!attributes.textPosition || attributes.textPosition === 'left') {
            return {}
          }
          return { 'data-text-position': attributes.textPosition }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: element => {
          if (element instanceof HTMLElement && element.querySelector('audio[data-path]')) {
            return {}
          }
          return false
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { path, text, textPosition, ...attrs } = HTMLAttributes

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, attrs),
      [
        'audio',
        mergeAttributes({
          'data-path': path,
          'data-text': text,
          'data-text-position': textPosition,
        }),
      ],
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(AudioShortcodeComponent)
  },

  addCommands() {
    return {
      setAudioShortcode:
        (attributes) =>
          ({ commands }) => {
            console.log(attributes)
            return commands.insertContent({
              type: this.name,
              attrs: attributes,
            })
          },
    }
  },
})
