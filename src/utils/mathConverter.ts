// utils/mathmlConverter.ts
import { MathMLToLaTeX } from 'mathml-to-latex'
import katex from 'katex'


export function cleanLatexEntities(latex: string): string {
  return latex
    // Пробелы и отступы
    .replace(/&nbsp;/g, '~')
    .replace(/&thinsp;/g, '\\,')
    .replace(/&ensp;/g, '\\:')
    .replace(/&emsp;/g, '\\quad')
    .replace(/&hairsp;/g, '\\!')
    .replace(/&#x2009;/g, '\\,')
    .replace(/&#x200A;/g, '\\!')
    .replace(/&#x00A0;/g, '~')

    // Математические операторы
    .replace(/&times;/g, '\\times')
    .replace(/&divide;/g, '\\div')
    .replace(/&minus;/g, '-')
    .replace(/&plus;/g, '+')
    .replace(/&equals;/g, '=')
    .replace(/&plusmn;/g, '\\pm')           // ±
    .replace(/&mnplus;/g, '\\mp')           // ∓
    .replace(/&#x00D7;/g, '\\times')
    .replace(/&#x00F7;/g, '\\div')
    .replace(/&#x2212;/g, '-')
    .replace(/&#x00B1;/g, '\\pm')
    .replace(/&#x2213;/g, '\\mp')

    // Сравнения
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&le;/g, '\\leq')
    .replace(/&ge;/g, '\\geq')
    .replace(/&ne;/g, '\\neq')
    .replace(/&equiv;/g, '\\equiv')
    .replace(/&approx;/g, '\\approx')
    .replace(/&sim;/g, '\\sim')
    .replace(/&cong;/g, '\\cong')
    .replace(/&prop;/g, '\\propto')         // пропорционально
    .replace(/&#x2264;/g, '\\leq')
    .replace(/&#x2265;/g, '\\geq')
    .replace(/&#x2260;/g, '\\neq')
    .replace(/&#x2248;/g, '\\approx')
    .replace(/&#x221D;/g, '\\propto')

    // Греческие буквы (строчные)
    .replace(/&alpha;/g, '\\alpha')
    .replace(/&beta;/g, '\\beta')
    .replace(/&gamma;/g, '\\gamma')
    .replace(/&delta;/g, '\\delta')
    .replace(/&epsilon;/g, '\\epsilon')
    .replace(/&varepsilon;/g, '\\varepsilon')
    .replace(/&zeta;/g, '\\zeta')
    .replace(/&eta;/g, '\\eta')
    .replace(/&theta;/g, '\\theta')
    .replace(/&vartheta;/g, '\\vartheta')
    .replace(/&iota;/g, '\\iota')
    .replace(/&kappa;/g, '\\kappa')
    .replace(/&lambda;/g, '\\lambda')
    .replace(/&mu;/g, '\\mu')
    .replace(/&nu;/g, '\\nu')
    .replace(/&xi;/g, '\\xi')
    .replace(/&pi;/g, '\\pi')
    .replace(/&varpi;/g, '\\varpi')
    .replace(/&rho;/g, '\\rho')
    .replace(/&varrho;/g, '\\varrho')
    .replace(/&sigma;/g, '\\sigma')
    .replace(/&varsigma;/g, '\\varsigma')
    .replace(/&tau;/g, '\\tau')
    .replace(/&upsilon;/g, '\\upsilon')
    .replace(/&phi;/g, '\\phi')
    .replace(/&varphi;/g, '\\varphi')
    .replace(/&chi;/g, '\\chi')
    .replace(/&psi;/g, '\\psi')
    .replace(/&omega;/g, '\\omega')

    // Греческие буквы (заглавные)
    .replace(/&Gamma;/g, '\\Gamma')
    .replace(/&Delta;/g, '\\Delta')
    .replace(/&Theta;/g, '\\Theta')
    .replace(/&Lambda;/g, '\\Lambda')
    .replace(/&Xi;/g, '\\Xi')
    .replace(/&Pi;/g, '\\Pi')
    .replace(/&Sigma;/g, '\\Sigma')
    .replace(/&Upsilon;/g, '\\Upsilon')
    .replace(/&Phi;/g, '\\Phi')
    .replace(/&Psi;/g, '\\Psi')
    .replace(/&Omega;/g, '\\Omega')

    // Физические константы и единицы (специальные символы)
    .replace(/&deg;/g, '^\\circ')           // градус °
    .replace(/&#x00B0;/g, '^\\circ')
    .replace(/&prime;/g, "'")               // штрих '
    .replace(/&Prime;/g, "''")              // двойной штрих ''
    .replace(/&#x2032;/g, "'")
    .replace(/&#x2033;/g, "''")
    .replace(/&#x2034;/g, "'''")
    .replace(/&permil;/g, '\\text{‰}')      // промилле ‰
    .replace(/&#x2030;/g, '\\text{‰}')

    // Векторы и операторы
    .replace(/&nabla;/g, '\\nabla')         // набла ∇
    .replace(/&part;/g, '\\partial')        // частная производная ∂
    .replace(/&partial;/g, '\\partial')
    .replace(/&#x2207;/g, '\\nabla')
    .replace(/&#x2202;/g, '\\partial')
    .replace(/&dot;/g, '\\cdot')            // скалярное произведение
    .replace(/&middot;/g, '\\cdot')
    .replace(/&#x22C5;/g, '\\cdot')
    .replace(/&#x00B7;/g, '\\cdot')
    .replace(/&cross;/g, '\\times')         // векторное произведение
    .replace(/&#x2A2F;/g, '\\times')

    // Интегралы и суммы
    .replace(/&int;/g, '\\int')
    .replace(/&Int;/g, '\\iint')            // двойной интеграл
    .replace(/&iiint;/g, '\\iiint')         // тройной интеграл
    .replace(/&oint;/g, '\\oint')           // контурный интеграл
    .replace(/&sum;/g, '\\sum')
    .replace(/&prod;/g, '\\prod')
    .replace(/&#x222B;/g, '\\int')
    .replace(/&#x222C;/g, '\\iint')
    .replace(/&#x222D;/g, '\\iiint')
    .replace(/&#x222E;/g, '\\oint')
    .replace(/&#x2211;/g, '\\sum')
    .replace(/&#x220F;/g, '\\prod')

    // Специальные математические символы
    .replace(/&infin;/g, '\\infty')
    .replace(/&radic;/g, '\\sqrt')
    .replace(/&forall;/g, '\\forall')
    .replace(/&exist;/g, '\\exists')
    .replace(/&empty;/g, '\\emptyset')
    .replace(/&isin;/g, '\\in')
    .replace(/&notin;/g, '\\notin')
    .replace(/&sub;/g, '\\subset')
    .replace(/&sup;/g, '\\supset')
    .replace(/&sube;/g, '\\subseteq')
    .replace(/&supe;/g, '\\supseteq')
    .replace(/&#x221E;/g, '\\infty')
    .replace(/&#x221A;/g, '\\sqrt')

    // Стрелки (важно для векторов и направлений)
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

    // Скобки и разделители
    .replace(/&lfloor;/g, '\\lfloor')
    .replace(/&rfloor;/g, '\\rfloor')
    .replace(/&lceil;/g, '\\lceil')
    .replace(/&rceil;/g, '\\rceil')
    .replace(/&langle;/g, '\\langle')
    .replace(/&rangle;/g, '\\rangle')
    .replace(/&#x27E8;/g, '\\langle')
    .replace(/&#x27E9;/g, '\\rangle')

    // Специальные физические символы
    .replace(/&angst;/g, '\\text{Å}')       // ангстрем Å
    .replace(/&#x212B;/g, '\\text{Å}')
    .replace(/&ohm;/g, '\\Omega')           // ом Ω
    .replace(/&#x2126;/g, '\\Omega')
    .replace(/&micro;/g, '\\mu')            // микро µ
    .replace(/&#x00B5;/g, '\\mu')
    .replace(/&hbar;/g, '\\hbar')           // планковская постоянная ℏ
    .replace(/&#x210F;/g, '\\hbar')

    // Дополнительные операторы
    .replace(/&and;/g, '\\wedge')           // логическое И
    .replace(/&or;/g, '\\vee')              // логическое ИЛИ
    .replace(/&not;/g, '\\neg')             // отрицание
    .replace(/&#x2227;/g, '\\wedge')
    .replace(/&#x2228;/g, '\\vee')
    .replace(/&#x00AC;/g, '\\neg')

    // Общая обработка hex entities
    .replace(/&#x([0-9A-F]+);/gi, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16))
    })

    // Общая обработка decimal entities
    .replace(/&#(\d+);/g, (match, dec) => {
      return String.fromCharCode(parseInt(dec, 10))
    })

    // Удаление лишних пробелов
    .trim()
}

export function convertMathMLToLatex(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const mathElements = doc.querySelectorAll('math')

  mathElements.forEach((mathElement) => {
    try {
      const mathml = mathElement.outerHTML
      let latex = MathMLToLaTeX.convert(mathml)

      // Очистка HTML entities
      latex = cleanLatexEntities(latex)

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
//
// export function convertLatexToMathML(html: string): string {
//   // Регулярное выражение для поиска $latex$ паттернов
//   const latexPattern = /\$([^$]+)\$/g
//
//   // Заменяем каждый $latex$ на MathML
//   const result = html.replace(latexPattern, (match, latex) => {
//     try {
//       // Конвертируем LaTeX в MathML используя KaTeX
//       const mathml = katex.renderToString(latex, {
//         output: 'mathml',
//         throwOnError: false,
//         displayMode: false
//       })
//
//       return mathml
//     } catch (error) {
//       console.error('Error converting LaTeX to MathML:', error, 'LaTeX:', latex)
//       // Оставляем исходный текст в случае ошибки
//       return match
//     }
//   })
//
//   return result
// }
