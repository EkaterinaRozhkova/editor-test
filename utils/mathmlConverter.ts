// utils/mathmlConverter.ts
import { MathMLToLaTeX } from 'mathml-to-latex'

export function convertMathMLToLatex(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const mathElements = doc.querySelectorAll('math')

  mathElements.forEach((mathElement) => {
    try {
      // Конвертируем MathML в LaTeX через статический метод класса
      const mathml = mathElement.outerHTML
      const latex = MathMLToLaTeX.convert(mathml)

      // Создаем span с data-type="math" для TipTap Mathematics extension
      const mathSpan = doc.createElement('span')
      mathSpan.setAttribute('data-type', 'math')
      mathSpan.setAttribute('data-latex', latex)
      mathSpan.textContent = `$${latex}$` // KaTeX синтаксис

      // Заменяем MathML элемент на span
      mathElement.parentNode?.replaceChild(mathSpan, mathElement)
    } catch (error) {
      console.error('Error converting MathML to LaTeX:', error, mathElement.outerHTML)
      // Оставляем текстовое представление в случае ошибки
      const textSpan = doc.createElement('span')
      textSpan.textContent = mathElement.textContent || '[Math Formula]'
      mathElement.parentNode?.replaceChild(textSpan, mathElement)
    }
  })

  return doc.body.innerHTML
}
