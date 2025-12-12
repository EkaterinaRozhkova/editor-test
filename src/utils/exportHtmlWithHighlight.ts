import hljs from 'highlight.js'

export function exportHtmlWithHighlight(rawHtml: string): string {
  const doc = new DOMParser().parseFromString(rawHtml, 'text/html')

  doc.querySelectorAll('pre > code').forEach(codeEl => {
    const language = codeEl.getAttribute('data-language') || undefined
    const code = codeEl.textContent || ''

    let result
    try {
      result = language
        ? hljs.highlight(code, { language })
        : hljs.highlightAuto(code)
    } catch {
      return
    }

    codeEl.innerHTML = result.value
    codeEl.classList.add('hljs')

    if (result.language) {
      codeEl.classList.add(`language-${result.language}`)
    }
  })

  return doc.body.innerHTML
}
