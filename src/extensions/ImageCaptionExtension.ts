import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageCaption: {
      addImageCaption: () => ReturnType
    }
  }
}

const imageCaptions = new Map<string, string>()

const applyDescriptionStyles = (span: HTMLSpanElement, imgElement?: HTMLImageElement, wrapperDiv?: HTMLElement) => {
  // Применяем ширину к wrapper div
  if (wrapperDiv && imgElement) {
    const imgWidth = imgElement.clientWidth || imgElement.width
    if (imgWidth > 0) {
      wrapperDiv.style.width = `${imgWidth}px`

      Object.assign(span.style, {
        display: 'block',
        fontSize: '11px',
        lineHeight: '18px',
        fontWeight: '400',
        color: '#7D7D7D',
        textAlign: 'center',
        maxWidth: `100%`,
        boxSizing: 'border-box',
        overflowWrap: 'break-word'
      })
    }
  } else {
    // Если нет wrapper или img, просто применяем базовые стили
    Object.assign(span.style, {
      display: 'block',
      fontSize: '11px',
      lineHeight: '18px',
      fontWeight: '400',
      color: '#7D7D7D',
      textAlign: 'center',
      maxWidth: `100%`,
      boxSizing: 'border-box',
      overflowWrap: 'break-word'
    })
  }
}

const findParentWithPosition = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement
  while (parent && !parent.style.position) {
    parent = parent.parentElement
  }
  return parent
}

const updateNodeCaption = (state: any, dispatch: any, imgSrc: string, caption: string | null) => {
  let nodePos = -1
  let node: any = null

  state.doc.descendants((n: any, pos: number) => {
    if (n.type.name === 'imageResize' && n.attrs.src === imgSrc) {
      nodePos = pos
      node = n
      return false
    }
  })

  if (nodePos !== -1 && node) {
    const tr = state.tr.setNodeMarkup(nodePos, null, {
      ...node.attrs,
      caption
    })
    dispatch(tr)
  }
}

const updateAllCaptionSpans = (imgSrc: string, caption: string | null) => {
  document.querySelectorAll('img').forEach((img) => {
    if (img.getAttribute('src') !== imgSrc) return

    const wrapperDiv = img.parentElement as HTMLElement
    const parentDiv = findParentWithPosition(img as HTMLElement)
    if (!parentDiv) return

    const span = parentDiv.querySelector('.image-description') as HTMLSpanElement

    if (caption) {
      if (span) {
        span.textContent = caption
        applyDescriptionStyles(span, img as HTMLImageElement, wrapperDiv)
      } else {
        const newSpan = document.createElement('span')
        newSpan.className = 'image-description'
        newSpan.textContent = caption
        applyDescriptionStyles(newSpan, img as HTMLImageElement, wrapperDiv)
        img.parentNode?.insertBefore(newSpan, img.nextSibling)
      }
    } else if (span) {
      span.remove()
    }
  })
}

export const ImageCaptionExtension = Extension.create({
  name: 'imageCaption',

  addCommands() {
    return {
      addImageCaption:
        () =>
          ({ view, state }) => {
            const { selection } = state
            let imagePos = -1
            let foundImageNode: any = null

            state.doc.descendants((node, pos) => {
              if (
                node.type.name === 'imageResize' &&
                pos >= selection.from - 1 &&
                pos <= selection.to + 1 &&
                imagePos === -1
              ) {
                imagePos = pos
                foundImageNode = node
                return false
              }
            })

            if (imagePos === -1 || !foundImageNode?.attrs.src) return false

            const imageSrc = foundImageNode.attrs.src
            imageCaptions.set(imageSrc, '')

            const tr = state.tr.setNodeMarkup(imagePos, null, {
              ...foundImageNode.attrs,
              caption: ''
            })
            view.dispatch(tr)

            const domAtPos = view.domAtPos(imagePos)
            const imageElement = domAtPos.node as HTMLElement
            const imgElement = imageElement.tagName === 'IMG'
              ? imageElement as HTMLImageElement
              : imageElement.querySelector('img')

            if (!imgElement) return false

            const wrapperDiv = imgElement.parentElement as HTMLElement
            const parentDiv = findParentWithPosition(imgElement)
            if (!parentDiv || parentDiv.querySelector('.image-description')) return false

            const span = document.createElement('span')
            span.className = 'image-description'
            span.textContent = ''
            applyDescriptionStyles(span, imgElement, wrapperDiv)
            imgElement.parentNode?.insertBefore(span, imgElement.nextSibling)

            return true
          },
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageCaptionPlugin'),
        view(editorView) {
          let contextMenu: HTMLDivElement | null = null

          const showContextMenu = (e: MouseEvent, imgSrc: string, targetImg: HTMLImageElement) => {
            e.preventDefault()

            const { state } = editorView
            let isImageSelected = false

            state.doc.descendants((node, pos) => {
              if (node.type.name === 'imageResize' && node.attrs.src === imgSrc) {
                const { from, to } = state.selection
                if (from >= pos && to <= pos + node.nodeSize) {
                  isImageSelected = true
                  return false
                }
              }
            })

            if (!isImageSelected) return

            contextMenu?.remove()

            const imgFloat = window.getComputedStyle(targetImg).float
            contextMenu = document.createElement('div')

            Object.assign(contextMenu.style, {
              position: 'fixed',
              top: `${e.clientY}px`,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: '10000',
              padding: '4px 0',
              ...(imgFloat === 'right' ? { right: '0' } : { left: '0' })
            })

            const createMenuItem = (text: string, color?: string, onClick?: (e: MouseEvent) => void) => {
              const item = document.createElement('div')
              Object.assign(item.style, {
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'background 0.2s',
                ...(color && { color })
              })
              item.textContent = text
              if (onClick) item.onclick = onClick
              return item
            }

            const editOption = createMenuItem(
              imageCaptions.has(imgSrc) ? 'Редактировать описание' : 'Добавить описание',
              undefined,
              (e) => {
                e.preventDefault()
                const currentCaption = imageCaptions.get(imgSrc) || ''
                const newCaption = window.prompt('Введите описание для изображения:', currentCaption)

                if (newCaption !== null && newCaption.trim() !== '') {
                  const trimmedCaption = newCaption.trim()
                  imageCaptions.set(imgSrc, trimmedCaption)
                  updateNodeCaption(editorView.state, editorView.dispatch, imgSrc, trimmedCaption)

                  updateAllCaptionSpans(imgSrc, trimmedCaption)
                }

                contextMenu?.remove()
                contextMenu = null
              }
            )

            contextMenu.appendChild(editOption)

            if (imageCaptions.has(imgSrc)) {
              const separator = document.createElement('div')
              Object.assign(separator.style, {
                height: '1px',
                background: '#e0e0e0',
                margin: '4px 0'
              })
              contextMenu.appendChild(separator)

              const deleteOption = createMenuItem(
                'Удалить описание',
                '#d32f2f',
                (e) => {
                  e.preventDefault()
                  imageCaptions.delete(imgSrc)
                  updateNodeCaption(editorView.state, editorView.dispatch, imgSrc, null)


                  updateAllCaptionSpans(imgSrc, null)


                  contextMenu?.remove()
                  contextMenu = null
                }
              )
              contextMenu.appendChild(deleteOption)
            }

            document.body.appendChild(contextMenu)

            const closeMenu = (e: MouseEvent) => {
              if (contextMenu && !contextMenu.contains(e.target as Node)) {
                contextMenu.remove()
                contextMenu = null
                document.removeEventListener('click', closeMenu)
              }
            }

            setTimeout(() => document.addEventListener('click', closeMenu), 0)
          }

          return {
            update: (view) => {
              view.state.doc.descendants((node) => {
                if (node.type.name === 'imageResize' && node.attrs.src && node.attrs.caption) {
                  imageCaptions.set(node.attrs.src, node.attrs.caption)
                }
              })

              setTimeout(() => {
                view.dom.querySelectorAll('img').forEach((img) => {
                  const imgSrc = img.getAttribute('src')
                  if (!imgSrc) return

                  img.oncontextmenu = (e) => showContextMenu(e, imgSrc, img as HTMLImageElement)

                  const caption = imageCaptions.get(imgSrc)
                  if (!caption) return

                  const wrapperDiv = img.parentElement as HTMLElement
                  const parentDiv = findParentWithPosition(img as HTMLElement)
                  if (!parentDiv) return

                  const existingSpan = parentDiv.querySelector('.image-description') as HTMLSpanElement
                  if (existingSpan) {
                    if (existingSpan.textContent !== caption) {
                      existingSpan.textContent = caption
                    }
                    applyDescriptionStyles(existingSpan, img as HTMLImageElement, wrapperDiv)
                    return
                  }

                  const span = document.createElement('span')
                  span.className = 'image-description'
                  span.textContent = caption
                  applyDescriptionStyles(span, img as HTMLImageElement, wrapperDiv)
                  img.parentNode?.insertBefore(span, img.nextSibling)
                })
              }, 10)
            },
          }
        },
      }),
    ]
  },
})
