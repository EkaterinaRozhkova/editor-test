// Парсер шорткодов для TipTap редактора

interface ShortcodeMatch {
  type: 'flex' | 'row' | 'col' | 'closing'
  tag: string
  attrs: Record<string, string>
  start: number
  end: number
  content?: string
}

/**
 * Парсит шорткоды из текста и возвращает структуру для TipTap
 */
export function parseShortcodes(html: string): any[] {
  // Регулярное выражение для поиска шорткодов
  const shortcodeRegex = /\[(\/?)(\w+)([^\]]*)\]/g

  const matches: ShortcodeMatch[] = []
  let match: RegExpExecArray | null

  // Находим все шорткоды
  while ((match = shortcodeRegex.exec(html)) !== null) {
    const isClosing = match[1] === '/'
    const tag = match[2] || ''
    const attrsString = match[3] || ''

    // Парсим атрибуты
    const attrs: Record<string, string> = {}
    const attrRegex = /(\w+)='([^']*)'/g
    let attrMatch: RegExpExecArray | null

    while ((attrMatch = attrRegex.exec(attrsString)) !== null) {
      if (attrMatch[1] && attrMatch[2] !== undefined) {
        attrs[attrMatch[1]] = attrMatch[2]
      }
    }

    matches.push({
      type: isClosing ? 'closing' : (tag as any),
      tag,
      attrs,
      start: match.index,
      end: match.index + match[0].length
    })
  }

  // Если нет шорткодов, возвращаем обычный HTML
  if (matches.length === 0) {
    return [{ type: 'paragraph', content: html ? [{ type: 'text', text: html }] : [] }]
  }

  // Парсим структуру шорткодов
  return parseShortcodeStructure(html, matches)
}

function parseShortcodeStructure(html: string, matches: ShortcodeMatch[]): any[] {
  const result: any[] = []
  let currentIndex = 0
  let i = 0

  while (i < matches.length) {
    const match = matches[i]
    if (!match) break

    // Добавляем контент перед шорткодом
    if (match.start > currentIndex) {
      const textBefore = html.substring(currentIndex, match.start).trim()
      if (textBefore) {
        result.push(...parseHTMLContent(textBefore))
      }
    }

    if (match.tag === 'flex') {
      // Находим соответствующий закрывающий тег
      const flexEnd = findClosingTag(matches, i, 'flex')

      if (flexEnd > i) {
        const isColumn = match.attrs.column === 'true'

        if (isColumn) {
          // Парсим row-based flex
          const rowShortcode = parseRowShortcode(html, matches, i, flexEnd)
          result.push(rowShortcode)
        } else {
          // Парсим column-based flex
          const flexShortcode = parseFlexShortcode(html, matches, i, flexEnd)
          result.push(flexShortcode)
        }

        const flexEndMatch = matches[flexEnd]
        if (flexEndMatch) {
          currentIndex = flexEndMatch.end
        }
        i = flexEnd + 1
        continue
      }
    }

    currentIndex = match.end
    i++
  }

  // Добавляем оставшийся контент
  if (currentIndex < html.length) {
    const textAfter = html.substring(currentIndex).trim()
    if (textAfter) {
      result.push(...parseHTMLContent(textAfter))
    }
  }

  return result
}

function parseRowShortcode(html: string, matches: ShortcodeMatch[], start: number, end: number): any {
  const rows: any[] = []
  let i = start + 1

  while (i < end) {
    const match = matches[i]
    if (!match) break

    if (match.tag === 'row') {
      const rowEnd = findClosingTag(matches, i, 'row')

      if (rowEnd > i) {
        const title = match.attrs.title || ''

        // Извлекаем контент между открывающим и закрывающим тегами
        const currentMatch = matches[i]
        const rowEndMatch = matches[rowEnd]
        if (currentMatch && rowEndMatch) {
          const contentStart = currentMatch.end
          const contentEnd = rowEndMatch.start
          const content = html.substring(contentStart, contentEnd).trim()

          rows.push({
            type: 'row',
            attrs: { title },
            content: parseHTMLContent(content)
          })
        }

        i = rowEnd + 1
        continue
      }
    }

    i++
  }

  return {
    type: 'rowShortcode',
    content: rows.length > 0 ? rows : [{
      type: 'row',
      attrs: { title: 'Заголовок 1' },
      content: [{ type: 'paragraph' }]
    }]
  }
}

function parseFlexShortcode(html: string, matches: ShortcodeMatch[], start: number, end: number): any {
  const columns: any[] = []
  let i = start + 1

  while (i < end) {
    const match = matches[i]
    if (!match) break

    if (match.tag === 'col') {
      const colEnd = findClosingTag(matches, i, 'col')

      if (colEnd > i) {
        const title = match.attrs.title || ''

        // Извлекаем контент между открывающим и закрывающим тегами
        const currentMatch = matches[i]
        const colEndMatch = matches[colEnd]
        if (currentMatch && colEndMatch) {
          const contentStart = currentMatch.end
          const contentEnd = colEndMatch.start
          const content = html.substring(contentStart, contentEnd).trim()

          columns.push({
            type: 'flexColumn',
            attrs: { title },
            content: parseHTMLContent(content)
          })
        }

        i = colEnd + 1
        continue
      }
    }

    i++
  }

  return {
    type: 'flexShortcode',
    content: columns.length > 0 ? columns : [{
      type: 'flexColumn',
      attrs: { title: 'Заголовок 1' },
      content: [{ type: 'paragraph' }]
    }]
  }
}

function findClosingTag(matches: ShortcodeMatch[], startIndex: number, tagName: string): number {
  let depth = 0

  for (let i = startIndex; i < matches.length; i++) {
    const match = matches[i]
    if (!match) continue

    if (match.tag === tagName) {
      if (match.type === 'closing') {
        if (depth === 0) {
          return i
        }
        depth--
      } else {
        if (i !== startIndex) {
          depth++
        }
      }
    }
  }

  return -1
}

function parseHTMLContent(content: string): any[] {
  if (!content || content === '\n' || content === '\r\n') {
    return [{ type: 'paragraph' }]
  }

  // Разбиваем на строки
  const lines = content.split(/\n+/).filter(line => line.trim())

  if (lines.length === 0) {
    return [{ type: 'paragraph' }]
  }

  return lines.map(line => {
    const trimmedLine = line.trim()

    // Простейший парсинг HTML тегов
    if (trimmedLine.startsWith('<h1>')) {
      return {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: trimmedLine.replace(/<\/?h1>/g, '') }]
      }
    }
    if (trimmedLine.startsWith('<h2>')) {
      return {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: trimmedLine.replace(/<\/?h2>/g, '') }]
      }
    }
    if (trimmedLine.startsWith('<h3>')) {
      return {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: trimmedLine.replace(/<\/?h3>/g, '') }]
      }
    }
    if (trimmedLine.startsWith('<p>')) {
      return {
        type: 'paragraph',
        content: [{ type: 'text', text: trimmedLine.replace(/<\/?p>/g, '') }]
      }
    }

    // Обычный текст
    return {
      type: 'paragraph',
      content: trimmedLine ? [{ type: 'text', text: trimmedLine }] : []
    }
  })
}