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
      latex = latex.replace(/&nbsp;/g, ' ')
        .replace(/&thinsp;/g, '\\,')
        .replace(/&#x([0-9A-F]+);/gi, (match, hex) => {
          return String.fromCharCode(parseInt(hex, 16))
        })
        .trim()

      // Создаем простой span с атрибутом для LaTeX
      const latexSpan = doc.createElement('span')
      latexSpan.className = 'math-inline'
      latexSpan.setAttribute('data-latex', latex)
      // Сохраняем LaTeX без $ для отображения
      latexSpan.textContent = latex

      mathElement.parentNode?.replaceChild(latexSpan, mathElement)
    } catch (error) {
      console.error('Error converting MathML to LaTeX:', error)
      const textSpan = doc.createElement('span')
      textSpan.textContent = mathElement.textContent || '[Formula]'
      mathElement.parentNode?.replaceChild(textSpan, mathElement)
    }
  })

  return doc.body.innerHTML
}
