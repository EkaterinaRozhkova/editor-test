import type { Editor } from '@tiptap/core'

/**
 * Мигрирует MathML строки в документе в специальные math ноды
 * Ищет <math> теги в тексте и преобразует их в inlineMath или mathBlock ноды
 *
 * @param editor - экземпляр TipTap редактора
 */
export function migrateMathMLStrings(editor: Editor) {
  const { state, view } = editor
  const { doc, schema } = state
  const tr = state.tr

  let modified = false

  // Проходим по всем нодам документа
  doc.descendants((node, pos) => {
    // Ищем только текстовые ноды
    if (node.isText && node.text) {
      const text = node.text

      // Регулярное выражение для поиска <math> тегов
      const mathRegex = /<math[^>]*>[\s\S]*?<\/math>/gi
      const matches = Array.from(text.matchAll(mathRegex))

      if (matches.length > 0) {
        console.log('[MigrateMathML] Found', matches.length, 'math elements in text at pos', pos)

        // Обрабатываем совпадения в обратном порядке, чтобы не сбивались позиции
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i]
          if (!match || match.index === undefined) continue

          const mathml = match[0]
          const matchStart = pos + match.index
          const matchEnd = matchStart + mathml.length

          // Определяем, блочная ли это формула
          const isBlock = mathml.includes('display="block"')

          console.log('[MigrateMathML] Replacing at', matchStart, '-', matchEnd, ':', mathml.substring(0, 50))

          // Создаем соответствующую ноду
          const nodeType = isBlock ? schema.nodes.mathBlock : schema.nodes.inlineMath

          if (nodeType) {
            const mathNode = nodeType.create({ mathml })

            // Заменяем текст на math ноду
            tr.replaceWith(matchStart, matchEnd, mathNode)
            modified = true
          }
        }
      }
    }

    return true // продолжаем обход
  })

  // Применяем изменения если были модификации
  if (modified) {
    console.log('[MigrateMathML] Applying transaction with', tr.steps.length, 'steps')
    view.dispatch(tr)
    return true
  }

  console.log('[MigrateMathML] No math elements found in text')
  return false
}