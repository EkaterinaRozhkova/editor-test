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
        parseHTML: element => element.getAttribute('data-path'),
        renderHTML: attributes => {
          if (!attributes.path) {
            return {}
          }
          return { 'data-path': attributes.path }
        },
      },
      text: {
        default: '',
        parseHTML: element => element.getAttribute('data-text'),
        renderHTML: attributes => {
          if (!attributes.text) {
            return {}
          }
          return { 'data-text': attributes.text }
        },
      },
      textPosition: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-text-position') || 'left',
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
        tag: 'audio-shortcode',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio-shortcode', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(AudioShortcodeComponent)
  },

  addCommands() {
    return {
      setAudioShortcode:
        (attributes) =>
          ({ commands }) => {
            return commands.insertContent({
              type: this.name,
              attrs: attributes,
            })
          },
    }
  },
})
