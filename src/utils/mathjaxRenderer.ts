// Глобальный флаг для отслеживания загрузки MathJax
let mathjaxLoaded = false
let mathjaxLoading: Promise<void> | null = null

declare global {
  interface Window {
    MathJax: any
  }
}

/**
 * Загружает MathJax из CDN
 */
async function loadMathJax(): Promise<void> {
  if (mathjaxLoaded) return
  if (mathjaxLoading) return mathjaxLoading

  mathjaxLoading = new Promise((resolve, reject) => {
    // Конфигурация MathJax
    window.MathJax = {
      startup: {
        typeset: false, // Не типсетим автоматически
        ready: () => {
          window.MathJax.startup.defaultReady()
          mathjaxLoaded = true
          resolve()
        }
      },
      options: {
        enableMenu: false
      },
      svg: {
        fontCache: 'local',
        scale: 1,
        minScale: 0.5
      }
    }

    // Загружаем скрипт (tex-mml-svg поддерживает и LaTeX и MathML)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-svg.js'
    script.async = true
    script.onerror = () => reject(new Error('Failed to load MathJax'))
    document.head.appendChild(script)
  })

  return mathjaxLoading
}

/**
 * Рендерит MathML в SVG используя MathJax
 * @param mathml - MathML строка для рендеринга
 * @param display - true для display mode (блочная формула), false для inline
 * @returns HTML строка с SVG
 */
export async function renderMathML(mathml: string, display: boolean = false): Promise<string> {
  try {
    // Загружаем MathJax если еще не загружен
    await loadMathJax()

    // Убеждаемся что MathML обернут в <math> теги
    let processedMathml = mathml.trim()

    if (!processedMathml.startsWith('<math')) {
      processedMathml = `<math xmlns="http://www.w3.org/1998/Math/MathML"${display ? ' display="block"' : ''}>${processedMathml}</math>`
    }

    // Добавляем display атрибут если нужно
    if (display && !processedMathml.includes('display=')) {
      processedMathml = processedMathml.replace('<math', '<math display="block"')
    }

    // Создаем временный контейнер
    const container = document.createElement('div')
    container.innerHTML = processedMathml

    // Конвертируем через MathJax
    await window.MathJax.typesetPromise([container])

    // Возвращаем результат
    return container.innerHTML
  } catch (error) {
    console.error('[MathJax] Rendering error:', error)
    // В случае ошибки возвращаем оригинальный MathML с обёрткой для стилей
    return `<span class="mathml-fallback">${mathml}</span>`
  }
}

/**
 * Рендерит LaTeX в SVG используя MathJax
 * @param latex - LaTeX строка для рендеринга
 * @param display - true для display mode (блочная формула), false для inline
 * @returns HTML строка с SVG
 */
export async function renderLatex(latex: string, display: boolean = false): Promise<string> {
  try {
    // Загружаем MathJax если еще не загружен
    await loadMathJax()

    // Оборачиваем LaTeX в delimiters
    const wrappedLatex = display ? `\\[${latex}\\]` : `\\(${latex}\\)`

    // Создаем временный контейнер
    const container = document.createElement('div')
    container.textContent = wrappedLatex

    // Конвертируем через MathJax
    await window.MathJax.typesetPromise([container])

    // Возвращаем результат
    return container.innerHTML
  } catch (error) {
    console.error('[MathJax] LaTeX rendering error:', error)
    // В случае ошибки возвращаем оригинальный LaTeX
    return `<code class="latex-fallback">${latex}</code>`
  }
}