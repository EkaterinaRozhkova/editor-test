// flexShortcodeParser.ts
import {
  Fragment,
  Schema,
  Node as PMNode,
  DOMParser as ProseMirrorDOMParser,
} from 'prosemirror-model'

/**
 * Парсит содержимое <div data-type="flex-shortcode"> с шорткодами
 * [flex] / [col title='...'] / [/col] / [/flex]
 * в структуру flexColumn-нод с сохранением форматирования внутри.
 */
export function parseFlexShortcodeContent(
  element: HTMLElement,
  schema: Schema,
): Fragment {
  // Типы нод, которые нам нужны
  const nodes = schema.nodes as typeof schema.nodes & {
    flexColumn?: any
    paragraph?: any
  }

  const flexColumnType = nodes.flexColumn
  const paragraphType = nodes.paragraph

  // Если по какой-то причине нужных нод нет — ничего не парсим
  if (!flexColumnType || !paragraphType) {
    return Fragment.empty
  }

  // Парсер DOM -> ProseMirror по текущей схеме
  const domParser = ProseMirrorDOMParser.fromSchema(schema)

  // Берём только непосредственных детей <p> внутри div[data-type="flex-shortcode"]
  const paragraphs = Array.from(
    element.querySelectorAll(':scope > p'),
  ) as HTMLElement[]

  const flexColumns: PMNode[] = []

  let inColumn = false
  let currentTitle = ''
  let currentBlocks: PMNode[] = []

  const isEmptyP = (p: HTMLElement): boolean => {
    const text = (p.textContent || '').replace(/\u00A0/g, '').trim()
    return text.length === 0
  }

  for (const p of paragraphs) {
    const textContent = p.textContent || ''
    const text = textContent.trim()

    if (!text) {
      // Пустые абзацы можно игнорить (кроме тех, что явно нужны — их добавим отдельно)
      continue
    }

    // Игнорируем обёртку [flex] и [/flex]
    if (text === '[flex]' || text === '[/flex]') {
      continue
    }

    // Открытие колонки: [col title='Заголовок 1'] (в том числе с final='true')
    const colOpenMatch = text.match(
      /^\[col\s+title='([^']*)'(?:\s+final='true')?\]$/,
    )

    if (colOpenMatch) {
      // Если уже была предыдущая колонка — закрываем её
      if (inColumn) {
        const colNode = flexColumnType.create(
          { title: currentTitle },
          Fragment.from(currentBlocks),
        )
        flexColumns.push(colNode)
      }

      currentTitle = colOpenMatch[1] || ''
      currentBlocks = []
      inColumn = true
      continue
    }

    // Закрытие колонки: [/col]
    if (text === '[/col]') {
      if (inColumn) {
        const colNode = flexColumnType.create(
          { title: currentTitle },
          Fragment.from(currentBlocks),
        )
        flexColumns.push(colNode)
        currentTitle = ''
        currentBlocks = []
        inColumn = false
      }
      continue
    }

    // Обычный контент внутри колонки
    if (inColumn) {
      if (isEmptyP(p)) {
        // Пустой <p> -> пустой параграф
        const emptyPara = paragraphType.create()
        currentBlocks.push(emptyPara)
      } else {
        // Парсим <p> полностью через ProseMirror DOMParser,
        // чтобы не потерять форматирование (strong, em, ссылки и т.д.)
        const doc = domParser.parse(p)

        doc.content.forEach(child => {
          // В flexColumn у тебя разрешены paragraph | heading | bulletList | orderedList
          if (
            child.type.name === 'paragraph' ||
            child.type.name === 'heading' ||
            child.type.name === 'bulletList' ||
            child.type.name === 'orderedList'
          ) {
            currentBlocks.push(child)
          }
        })
      }
    }

    // Всё, что вне колонки (например, лишние <p> после [/flex]) игнорируем
  }

  // Если осталась незакрытая колонка — закрываем её
  if (inColumn && currentBlocks.length) {
    const colNode = flexColumnType.create(
      { title: currentTitle },
      Fragment.from(currentBlocks),
    )
    flexColumns.push(colNode)
  }

  // На всякий случай: если колонок не получилось — создаём одну пустую,
  // чтобы не уронить парсер
  if (!flexColumns.length) {
    const emptyPara = paragraphType.create()
    const emptyCol = flexColumnType.create(
      { title: '' },
      Fragment.from([emptyPara]),
    )
    return Fragment.from([emptyCol])
  }

  return Fragment.from(flexColumns)
}

