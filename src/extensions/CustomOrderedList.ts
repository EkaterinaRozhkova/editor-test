import OrderedList from '@tiptap/extension-ordered-list'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customOrderedList: {
      setOrderedListType: (type: '1' | 'A' | 'a' | 'I' | 'i') => ReturnType
    }
  }
}

export const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: '1',
        parseHTML: element => element.getAttribute('type') || '1',
        renderHTML: attributes => {
          if (!attributes.type || attributes.type === '1') {
            return {}
          }
          return { type: attributes.type }
        },
      },
    }
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setOrderedListType: (type: '1' | 'A' | 'a' | 'I' | 'i') => ({ commands }: { commands: any }) => {
        return commands.updateAttributes('orderedList', { type })
      },
    }
  },
})
