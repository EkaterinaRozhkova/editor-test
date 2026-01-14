import { Extension } from '@tiptap/core'

export interface MathliveOptions {
	latex: string
}

declare module '@tiptap/core' {
	interface Commands<ReturnType> {
		mathliveExtension: {
			insertFormula: (latex: string) => ReturnType
		}
	}
}

export const MathliveExtension = Extension.create({
	name: 'mathliveExtension',

	addCommands() {
		return {
			insertFormula:
				(latex) =>
				({ chain }) => {
					return chain().insertContent(latex).run()
				},
		}
	},
})
