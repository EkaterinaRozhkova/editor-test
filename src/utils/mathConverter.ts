// utils/mathmlConverter.ts
import { MathMLToLaTeX } from 'mathml-to-latex'
import katex from 'katex'

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

export function convertLatexToMathML(html: string): string {
  // Регулярное выражение для поиска $latex$ паттернов
  const latexPattern = /\$([^$]+)\$/g

  // Заменяем каждый $latex$ на MathML
  const result = html.replace(latexPattern, (match, latex) => {
    try {
      // Конвертируем LaTeX в MathML используя KaTeX
      const mathml = katex.renderToString(latex, {
        output: 'mathml',
        throwOnError: false,
        displayMode: false
      })

      return mathml
    } catch (error) {
      console.error('Error converting LaTeX to MathML:', error, 'LaTeX:', latex)
      // Оставляем исходный текст в случае ошибки
      return match
    }
  })

  return result
}

export function convertMathNodesToLatexStrings(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Обрабатываем inline math nodes
  const inlineMathElements = doc.querySelectorAll('[data-type="inline-math"]')
  inlineMathElements.forEach((mathElement) => {
    const latex = mathElement.getAttribute('data-latex') || ''
    const textNode = doc.createTextNode(`$${latex}$`)
    mathElement.parentNode?.replaceChild(textNode, mathElement)
  })

  // Обрабатываем block math nodes
  const blockMathElements = doc.querySelectorAll('[data-type="block-math"]')
  blockMathElements.forEach((mathElement) => {
    const latex = mathElement.getAttribute('data-latex') || ''
    const textNode = doc.createTextNode(`$$${latex}$$`)
    mathElement.parentNode?.replaceChild(textNode, mathElement)
  })

  return doc.body.innerHTML
}
