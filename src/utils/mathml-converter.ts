export class MathMLToLaTeX {
  convert(mathmlString: string): string | null {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(this.fixBrokenOperators(mathmlString), 'text/xml')
      const mathElement = doc.querySelector('math')

      if (!mathElement) {
        throw new Error('No math element found')
      }

      return this.processNode(mathElement)
    } catch (error) {
      console.error('MathML conversion error:', error)
      return null
    }
  }

  private fixBrokenOperators(mathml: string): string {
    let fixed = mathml

    // Исправить битые корни: <mo>\</mo><mn>3</mn> → корень 3-й степени
    fixed = fixed.replace(/<mo>\\<\/mo>\s*<mn>(\d+)<\/mn>/g, (match, num) => {
      return num === '2' ? '<msqrt>' : '<mroot><mrow>'
    })

    return fixed
  }

  private processNode(node: Element): string {
    const nodeName = node.nodeName.toLowerCase()

    switch (nodeName) {
      case 'math':
        return this.processChildren(node)
      case 'mfrac':
        return this.processFraction(node)
      case 'msup':
        return this.processSuperscript(node)
      case 'msub':
        return this.processSubscript(node)
      case 'msqrt':
        return `\\sqrt{${this.processChildren(node)}}`
      case 'mroot':
        return this.processRoot(node)
      case 'mrow':
        return this.processChildren(node)
      case 'mn':
      case 'mi':
      case 'mo':
      case 'mtext':
        return node.textContent?.trim() || ''
      default:
        return this.processChildren(node)
    }
  }

  private processChildren(node: Element): string {
    return Array.from(node.childNodes)
      .map(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          return child.textContent?.trim() || ''
        }
        return this.processNode(child as Element)
      })
      .filter(text => text.length > 0)
      .join(' ')
  }

  private processFraction(node: Element): string {
    const children = Array.from(node.children)
    if (children.length !== 2 || !children[0] || !children[1]) return ''

    const numerator = this.processNode(children[0])
    const denominator = this.processNode(children[1])

    return `\\frac{${numerator}}{${denominator}}`
  }

  private processSuperscript(node: Element): string {
    const children = Array.from(node.children)
    if (children.length !== 2 || !children[0] || !children[1]) return ''

    const base = this.processNode(children[0])
    const exponent = this.processNode(children[1])

    return `${base}^{${exponent}}`
  }

  private processSubscript(node: Element): string {
    const children = Array.from(node.children)
    if (children.length !== 2 || !children[0] || !children[1]) return ''

    const base = this.processNode(children[0])
    const subscript = this.processNode(children[1])

    return `${base}_{${subscript}}`
  }

  private processRoot(node: Element): string {
    const children = Array.from(node.children)
    if (children.length !== 2 || !children[0] || !children[1]) return ''

    const radicand = this.processNode(children[0])
    const index = this.processNode(children[1])

    return `\\sqrt[${index}]{${radicand}}`
  }
}

/**
 * Конвертирует все MathML теги в HTML в LaTeX формат для Tiptap
 */
export function convertMathMLToLatex(htmlContent: string): string {
  const converter = new MathMLToLaTeX()
  let converted = htmlContent

  const mathRegex = /<math[^>]*>[\s\S]*?<\/math>/gi
  const matches = htmlContent.match(mathRegex)

  if (matches) {
    console.log(`🔄 Converting ${matches.length} MathML formulas to LaTeX...`)

    matches.forEach((mathml, index) => {
      const latex = converter.convert(mathml)

      if (latex) {
        const escapedLatex = latex.replace(/"/g, '&quot;')
        converted = converted.replace(
          mathml,
          `<span data-type="math-inline" data-latex="${escapedLatex}">${latex}</span>`
        )
        console.log(`  ✓ Formula ${index + 1}: ${latex}`)
      } else {
        console.warn(`  ✗ Failed to convert formula ${index + 1}`)
      }
    })
  }

  return converted
}
