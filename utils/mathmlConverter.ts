// utils/mathmlConverter.ts
import { MathMLToLaTeX } from 'mathml-to-latex'

export function convertMathMLToLatex(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const mathElements = doc.querySelectorAll('math')

  mathElements.forEach((mathElement) => {
    try {
      const mathml = mathElement.outerHTML
      let latex = MathMLToLaTeX.convert(mathml)

      // Очистка HTML entities
      latex = latex
        .replace(/&nbsp;/g, ' ')
        .replace(/&thinsp;/g, '\\,')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#x([0-9A-F]+);/gi, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        .trim()

      console.log('Converted LaTeX:', latex)

      // Создаем текстовый узел с $ для MathJax
      const textNode = doc.createTextNode(`$${latex}$`)

      mathElement.parentNode?.replaceChild(textNode, mathElement)
    } catch (error) {
      console.error('Error converting MathML:', error)
      const textSpan = doc.createElement('span')
      textSpan.textContent = mathElement.textContent || '[Formula Error]'
      mathElement.parentNode?.replaceChild(textSpan, mathElement)
    }
  })

  return doc.body.innerHTML
}
