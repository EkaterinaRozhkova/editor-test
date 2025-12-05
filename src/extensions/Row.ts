import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import RowView from '@/components/RowView.vue'

export const Row = Node.create({
  name: 'row',

  content: 'block+',

  group: 'row',

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
        tag: 'div[data-type="row"]',
      },
    ]
  },

  renderHTML() {
    // Row не рендерится отдельно, его содержимое обрабатывается родителем (RowShortcode)
    return ['div', { 'data-type': 'row' }, 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(RowView)
  },
})