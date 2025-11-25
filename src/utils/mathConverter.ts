// utils/mathmlConverter.ts
import { MathMLToLaTeX } from 'mathml-to-latex'
import katex from 'katex'


export function cleanLatexEntities(latex: string): string {
  return latex
    // КРИТИЧНО: HTML entities нужно декодировать ПЕРВЫМИ
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

    // Пробелы
    .replace(/&nbsp;/g, '~')
    .replace(/&thinsp;/g, '\\,')
    .replace(/&ensp;/g, '\\:')
    .replace(/&emsp;/g, '\\quad')
    .replace(/&#x00A0;/g, '~')
    .replace(/&#x2009;/g, '\\,')
    .replace(/&#x200A;/g, '\\!')

    // Математические операторы
    .replace(/&times;/g, '\\times')
    .replace(/&divide;/g, '\\div')
    .replace(/&minus;/g, '-')
    .replace(/&plusmn;/g, '\\pm')
    .replace(/&mnplus;/g, '\\mp')
    .replace(/&#x00D7;/g, '\\times')
    .replace(/&#x00F7;/g, '\\div')
    .replace(/&#x2212;/g, '-')
    .replace(/&#x00B1;/g, '\\pm')
    .replace(/&#x2213;/g, '\\mp')

    // Сравнения (ПОСЛЕ базовых &lt; &gt;)
    .replace(/&le;/g, '\\leq')
    .replace(/&ge;/g, '\\geq')
    .replace(/&ne;/g, '\\neq')
    .replace(/&equiv;/g, '\\equiv')
    .replace(/&approx;/g, '\\approx')
    .replace(/&sim;/g, '\\sim')
    .replace(/&cong;/g, '\\cong')
    .replace(/&prop;/g, '\\propto')
    .replace(/&#x2264;/g, '\\leq')
    .replace(/&#x2265;/g, '\\geq')
    .replace(/&#x2260;/g, '\\neq')
    .replace(/&#x2248;/g, '\\approx')
    .replace(/&#x221D;/g, '\\propto')

    // Греческие буквы
    .replace(/&alpha;/g, '\\alpha')
    .replace(/&beta;/g, '\\beta')
    .replace(/&gamma;/g, '\\gamma')
    .replace(/&delta;/g, '\\delta')
    .replace(/&epsilon;/g, '\\epsilon')
    .replace(/&varepsilon;/g, '\\varepsilon')
    .replace(/&theta;/g, '\\theta')
    .replace(/&lambda;/g, '\\lambda')
    .replace(/&mu;/g, '\\mu')
    .replace(/&nu;/g, '\\nu')
    .replace(/&pi;/g, '\\pi')
    .replace(/&rho;/g, '\\rho')
    .replace(/&sigma;/g, '\\sigma')
    .replace(/&tau;/g, '\\tau')
    .replace(/&phi;/g, '\\phi')
    .replace(/&chi;/g, '\\chi')
    .replace(/&psi;/g, '\\psi')
    .replace(/&omega;/g, '\\omega')
    .replace(/&Gamma;/g, '\\Gamma')
    .replace(/&Delta;/g, '\\Delta')
    .replace(/&Theta;/g, '\\Theta')
    .replace(/&Lambda;/g, '\\Lambda')
    .replace(/&Xi;/g, '\\Xi')
    .replace(/&Pi;/g, '\\Pi')
    .replace(/&Sigma;/g, '\\Sigma')
    .replace(/&Phi;/g, '\\Phi')
    .replace(/&Psi;/g, '\\Psi')
    .replace(/&Omega;/g, '\\Omega')

    // Векторы и операторы
    .replace(/&nabla;/g, '\\nabla')
    .replace(/&partial;/g, '\\partial')
    .replace(/&#x2207;/g, '\\nabla')
    .replace(/&#x2202;/g, '\\partial')
    .replace(/&dot;/g, '\\cdot')
    .replace(/&middot;/g, '\\cdot')
    .replace(/&#x22C5;/g, '\\cdot')
    .replace(/&#x00B7;/g, '\\cdot')

    // Интегралы и суммы
    .replace(/&int;/g, '\\int')
    .replace(/&oint;/g, '\\oint')
    .replace(/&sum;/g, '\\sum')
    .replace(/&prod;/g, '\\prod')
    .replace(/&#x222B;/g, '\\int')
    .replace(/&#x222C;/g, '\\iint')
    .replace(/&#x222D;/g, '\\iiint')
    .replace(/&#x222E;/g, '\\oint')
    .replace(/&#x2211;/g, '\\sum')
    .replace(/&#x220F;/g, '\\prod')

    // Специальные символы
    .replace(/&infin;/g, '\\infty')
    .replace(/&#x221E;/g, '\\infty')
    .replace(/&deg;/g, '^\\circ')
    .replace(/&#x00B0;/g, '^\\circ')
    .replace(/&micro;/g, '\\mu')
    .replace(/&#x00B5;/g, '\\mu')

    // Стрелки
    .replace(/&rarr;/g, '\\rightarrow')
    .replace(/&larr;/g, '\\leftarrow')
    .replace(/&uarr;/g, '\\uparrow')
    .replace(/&darr;/g, '\\downarrow')
    .replace(/&harr;/g, '\\leftrightarrow')
    .replace(/&rArr;/g, '\\Rightarrow')
    .replace(/&lArr;/g, '\\Leftarrow')
    .replace(/&hArr;/g, '\\Leftrightarrow')
    .replace(/&#x2192;/g, '\\rightarrow')
    .replace(/&#x2190;/g, '\\leftarrow')
    .replace(/&#x2191;/g, '\\uparrow')
    .replace(/&#x2193;/g, '\\downarrow')
    .replace(/&#x21D2;/g, '\\Rightarrow')
    .replace(/&#x21D0;/g, '\\Leftarrow')

    // Hex entities (ПОСЛЕ всех named entities)
    .replace(/&#x([0-9A-F]+);/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16))
    })

    // Decimal entities
    .replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10))
    })

    .trim()
}

export function convertMathMLToLatex(html: string): string {
  if (!html) return ''

  // Сначала декодируем HTML entities в самом HTML
  const decodedHtml = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

  const parser = new DOMParser()
  const doc = parser.parseFromString(decodedHtml, 'text/html')
  const mathElements = doc.querySelectorAll('math')

  mathElements.forEach((mathElement, index) => {
    try {
      // Получаем innerHTML для лучшей обработки
      let mathml = mathElement.outerHTML

      // Убираем экранирование внутри MathML
      mathml = mathml
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      let latex = MathMLToLaTeX.convert(mathml)
      latex = cleanLatexEntities(latex)

      // Заменяем на текстовый узел
      const textNode = doc.createTextNode(`$${latex}$`)
      mathElement.parentNode?.replaceChild(textNode, mathElement)

    } catch (error) {
      console.error(`❌ [${index}] Error converting MathML:`, error)
      console.error('Failed MathML:', mathElement.outerHTML)

      const textSpan = doc.createElement('span')
      textSpan.className = 'math-error'
      textSpan.textContent = '[Math Error]'
      mathElement.parentNode?.replaceChild(textSpan, mathElement)
    }
  })

  const result = doc.body.innerHTML
  console.log('📤 Final HTML:', result)

  return result
}

export function convertLatexToMathML(html: string): string {
  if (!html) return ''

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  // Удаляем рендеры MathJax/KaTeX
  const renderedElements = doc.querySelectorAll(
    '.MathJax, .MathJax_Display, .MathJax_Preview, .MathJax_SVG, .MathJax_SVG_Display, ' +
    '.MathJax_CHTML, .MathJax_CHTML_Display, ' +
    '.katex, .katex-display, .katex-html, .katex-mathml, ' +
    'script[type="math/tex"], script[type="math/tex; mode=display"], ' +
    'nobr, span.MathJax_Preview'
  )
  renderedElements.forEach(el => el.remove())

  let cleanHtml = doc.body.innerHTML

  // Паттерн для $...$
  const latexPattern = /\$([^$]+)\$/g
  let matchCount = 0

  cleanHtml = cleanHtml.replace(latexPattern, (match, latex) => {
    try {
      const trimmedLatex = latex.trim()
      matchCount++

      console.log(`🔄 [${matchCount}] Converting LaTeX:`, trimmedLatex)

      // Конвертируем через KaTeX
      const mathml = katex.renderToString(trimmedLatex, {
        output: 'mathml',
        throwOnError: false,
        displayMode: false
      })

      // Добавляем namespace
      const mathmlWithNs = mathml.includes('xmlns')
        ? mathml
        : mathml.replace('<math>', '<math xmlns="http://www.w3.org/1998/Math/MathML">')

      console.log(`✅ [${matchCount}] Converted to MathML`)

      return mathmlWithNs
    } catch (error) {
      console.error(`❌ Error converting LaTeX:`, error, latex)
      return match
    }
  })

  return cleanHtml
}
