// flexShortcodeParser.ts
import { Fragment, Schema, Node as PMNode } from 'prosemirror-model'

export function parseFlexShortcodeContent(
  element: HTMLElement,
  schema: Schema,
): Fragment {
  // Берём только непосредственные <p> внутри div[data-type="flex-shortcode"]
  const paragraphs = Array.from(element.querySelectorAll<HTMLElement>(':scope > p'))

  const flexColumns: PMNode[] = []

  let inColumn = false
  let currentTitle = ''
  let currentBlocks: PMNode[] = []

  const isEmptyP = (p: HTMLElement) => {
    const text = (p.textContent || '').replace(/\u00A0/g, '').trim()
    return text.length === 0
  }

  for (const p of paragraphs) {
    const raw = p.textContent || ''
    const text = raw.trim()

    if (!text) {
      // пустой абзац внутри flex — можно игнорить
      continue
    }

    // Игнорируем обёртку [flex] и [/flex]
    if (text === '[flex]' || text === '[/flex]') {
      continue
    }

    // Открытие колонки: [col title='Заголовок 1'] или [col title='...' final='true']
    const colOpenMatch = text.match(
      /^\[col\s+title='([^']*)'(?:\s+final='true')?\]$/,
    )

    if (colOpenMatch) {
      // Если уже были накоплены блоки предыдущей колонки — пушим её
      if (inColumn) {
        const colNode = schema.nodes?.flexColumn?.create(
          { title: currentTitle },
          Fragment.from(currentBlocks),
        )
        if(colNode) {
          flexColumns.push(colNode)
        }
      }

      currentTitle = colOpenMatch[1] || ''
      currentBlocks = []
      inColumn = true
      continue
    }

    // Закрытие колонки: [/col]
    if (text === '[/col]') {
      if (inColumn) {
        const colNode = schema?.nodes?.flexColumn?.create(
          { title: currentTitle },
          Fragment.from(currentBlocks),
        )
        if(colNode) {
          flexColumns.push(colNode)
          currentTitle = ''
          currentBlocks = []
          inColumn = false
        }
      }
      continue
    }

    // Обычный контент внутри колонки
    if (inColumn) {
      // Здесь можно усложнить и парсить p.innerHTML → schema,
      // но для начала берём просто текст в параграф
      const contentText = isEmptyP(p) ? '' : raw

      const para = schema?.nodes?.paragraph?.create(
        undefined,
        contentText ? schema.text(contentText) : undefined,
      )

      if(para) {
        currentBlocks.push(para)
      }
    }
    // Если не внутри колонки — просто игнорируем (например, &nbsp; после [/flex])
  }

  // Если осталась незакрытая колонка
  if (inColumn && currentBlocks.length) {
    const colNode = schema.nodes?.flexColumn?.create(
      { title: currentTitle },
      Fragment.from(currentBlocks),
    )
    if (colNode) {
      flexColumns.push(colNode)
    }
  }

  // Если вдруг колонок не нашлось — чтобы не падать, создадим одну пустую
  if (!flexColumns.length) {
    const emptyPara = schema.nodes?.paragraph?.create(
      undefined,
      schema.text(''),
    )
    const emptyCol = schema.nodes?.flexColumn?.create(
      { title: '' },
      Fragment.from(emptyPara ? [emptyPara] : []),
    )
    return Fragment.from(emptyCol ? [emptyCol] : [])
  }

  // Возвращаем Fragment из flexColumn-нод — это станет content для flexShortcode
  return Fragment.from(flexColumns)
}
