import { Node } from '@tiptap/core'
import { mergeAttributes } from '@tiptap/core'

export interface MathliveOptions {
	onEditFormula?: (id: string, latex: string) => void
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		mathliveExtension: {
			insertFormula: (latex: string) => ReturnType
			updateFormula: (id: string, latex: string) => ReturnType
		}
	}
}

export const MathliveExtension = Node.create<MathliveOptions>({
	name: 'mathliveExtension',
	inline: true,
	group: 'inline',
	atom: true,

	addOptions() {
		return {
			onEditFormula: undefined,
		}
	},

	addAttributes() {
		return {
			id: {
				default: null,
			},
			latex: {
				default: '',
			},
		}
	},

	parseHTML() {
		return [
			{
				tag: 'span[data-mathlive]',
			},
		]
	},

	renderHTML({ HTMLAttributes }) {
		return [
			'span',
			mergeAttributes(HTMLAttributes, {
				'data-mathlive': '',
			}),
			HTMLAttributes.latex,
		]
	},

	addCommands() {
		return {
			insertFormula:
				(latex: string, id = crypto.randomUUID()) =>
				({ commands }) => {
					return commands.insertContent({
						type: this.name,
						attrs: { latex, id },
					})
				},

			updateFormula:
				(id: string, latex: string) =>
				({ state, tr, dispatch }) => {
					let updated = false

					state.doc.descendants((node, pos) => {
						if (
							node.type.name === this.name &&
							node.attrs.id === id
						) {
							tr.setNodeMarkup(pos, undefined, {
								...node.attrs,
								latex,
							})
							updated = true
							return false
						}
					})

					if (updated && dispatch) {
						dispatch(tr)
					}

					return updated
				},
		}
	},

	addNodeView() {
		const { onEditFormula } = this.options

		return ({ node, editor, getPos }) => {
			const dom = document.createElement('span')
			dom.setAttribute('data-mathlive', '')
			dom.setAttribute('data-id', node.attrs.id)
			dom.textContent = node.attrs.latex
			dom.style.cursor = 'pointer'
			dom.style.userSelect = 'none'
			dom.style.display = 'inline-block'
			dom.style.padding = '2px 4px'
			dom.style.borderRadius = '3px'
			dom.style.background = 'rgba(0,0,0,0.03)'

			dom.addEventListener('click', (e) => {
				e.preventDefault()
				e.stopPropagation()

				if (onEditFormula) {
					const pos = getPos()

					if (!pos) return

					const currentNode = editor.state.doc.nodeAt(pos)

					if (!currentNode) return

					onEditFormula(currentNode.attrs.id, currentNode.attrs.latex)
				}
			})

			dom.addEventListener('mouseenter', () => {
				dom.style.background = 'rgba(0,0,0,0.08)'
			})

			dom.addEventListener('mouseleave', () => {
				dom.style.background = 'rgba(0,0,0,0.03)'
			})

			return {
				dom,
				update: (updatedNode) => {
					if (updatedNode.type.name !== this.name) {
						return false
					}

					dom.textContent = updatedNode.attrs.latex
					dom.setAttribute('data-id', updatedNode.attrs.id)
					return true
				},
			}
		}
	},
})
