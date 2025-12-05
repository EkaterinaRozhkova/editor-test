import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FlexColumnView from '@/components/FlexColumnView.vue'

export const FlexColumn = Node.create({
  name: 'flexColumn',

  content: 'block+',

  group: 'flexColumn',

  isolating: true,

  addAttributes() {
    return {
      title: {
        default: '',
        parseHTML: (element) => (element as HTMLElement).getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="flex-column"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'flex-column',
      }),
      0,
    ]
  },

  addNodeView() {
    return VueNodeViewRenderer(FlexColumnView)
  },
})