import { MathMLToLaTeX } from 'mathml-to-latex'

/**
 * Конвертирует MathML в LaTeX
 */
export function mathmlToLatex(mathml: string): string {
  try {
    // Санитизация MathML
    let clean = mathml
      // HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // Unicode NBSP
      .replace(/\u00A0/g, ' ')
      // Middle dot normalizer
      .replace(/\u00B7/g, '·')
      // Удалить хвосты после </math>
      .replace(/<\/math>.*$/, '</math>')
      // Добавить namespace если отсутствует
      .replace(/<math(?!\s+xmlns)/g, '<math xmlns="http://www.w3.org/1998/Math/MathML"')

    // Используем статический метод convert
    const latex = MathMLToLaTeX.convert(clean)

    return latex
  } catch (error) {
    console.error('Ошибка конвертации MathML в LaTeX:', error)
    console.error('MathML:', mathml)
    // Возвращаем пустую строку в случае ошибки
    return ''
  }
}

/**
 * Конвертирует LaTeX в формат совместимый с MathJax preview
 * Оборачивает LaTeX в $...$ для inline или $$...$$ для display math
 */
export function latexToMathJax(latex: string, display: boolean = false): string {
  if (display) {
    return `$$${latex}$$`
  }
  return `$${latex}$`
}

/**
 * Обрабатывает HTML контент, конвертируя все MathML теги в LaTeX
 * для совместимости с TipTap Mathematics extension
 */
export function convertMathMLInHTML(html: string): string {
  // Создаем временный DOM элемент для парсинга HTML
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Находим все <math> теги
  const mathElements = doc.querySelectorAll('math')

  mathElements.forEach((mathElement) => {
    try {
      const mathml = mathElement.outerHTML
      const latex = mathmlToLatex(mathml)

      if (latex) {
        // Определяем, inline или display math
        const display = mathElement.getAttribute('display') === 'block'

        // Создаем span с LaTeX в формате KaTeX
        const span = doc.createElement('span')
        span.setAttribute('data-type', display ? 'block-math' : 'inline-math')
        span.setAttribute('data-content', latex)
        span.textContent = display ? `$$${latex}$$` : `$${latex}$`

        // Заменяем <math> на span
        mathElement.replaceWith(span)
      }
    } catch (error) {
      console.error('Ошибка обработки math элемента:', error)
    }
  })

  return doc.body.innerHTML
}

/**
 * Конвертирует LaTeX обратно в формат MathML для сохранения
 * (для обратной совместимости с math preview)
 */
export function convertLatexToMathPreviewFormat(html: string): string {
  // Для math preview просто оборачиваем LaTeX в $ или $$
  // т.к. mathjax понимает этот формат
  return html
}