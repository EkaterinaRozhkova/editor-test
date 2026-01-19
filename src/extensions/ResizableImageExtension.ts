import ImageResize from 'tiptap-extension-resize-image';
import { mergeAttributes } from '@tiptap/core';

const findCaptionText = (element: HTMLElement): string | null => {
  const captionSpan = element.querySelector('.image-description');
  return captionSpan?.textContent || null;
};

export const CustomResizableImage = ImageResize.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      loading: {
        default: 'lazy',
        parseHTML: () => 'lazy',
        renderHTML: () => ({ loading: 'lazy' }),
      },
      caption: {
        default: null,
        parseHTML: element => {
          if (element.tagName === 'DIV') {
            return findCaptionText(element as HTMLElement);
          }
          return element.parentElement ? findCaptionText(element.parentElement) : null;
        },
        renderHTML: () => ({}),
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          console.log(attributes)
          if (!attributes.style) {
            return {...attributes};
          }
          return { style: attributes.style, attributes };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[style*="inline-block"]',
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector('img');
          if (!img) return false;

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            loading: 'lazy',
            wrapperStyle: (element as HTMLElement).getAttribute('style'),
            containerStyle: (element as HTMLElement).getAttribute('style'),
            caption: findCaptionText(element as HTMLElement),
          };
        },
      },
      ...this.parent?.() || [],
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { caption, wrapperStyle, containerStyle, ...imageAttrs } = node.attrs;

    // Добавляем border-radius к существующим стилям изображения
    const existingStyle = imageAttrs.style || '';
    let imgStyle = existingStyle;
    if (!/border-radius\s*:/i.test(existingStyle)) {
      imgStyle = existingStyle ? `${existingStyle}; border-radius: 10px;` : 'border-radius: 10px;';
    }

    // Удаляем wrapperStyle и containerStyle из imageAttrs чтобы они не попали в img тег
    const cleanImageAttrs = { ...imageAttrs };
    delete cleanImageAttrs.wrapperStyle;
    delete cleanImageAttrs.containerStyle;

    if (!wrapperStyle) {
      return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { ...cleanImageAttrs, style: imgStyle })];
    }

    const imgAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
      { ...cleanImageAttrs, style: imgStyle },
      { loading: 'lazy' }
    );

    const content: (string | Record<string, unknown> | (string | Record<string, unknown>)[])[] = [['img', imgAttrs]];

    if (caption) {
      // Берем ширину из исходных атрибутов ноды
      const width = node.attrs.width || imageAttrs.width;
      // Обязательно добавляем px если это число или строка-число
      let widthValue: string | undefined;
      let numericWidth = 0;

      if (width) {
        if (typeof width === 'number') {
          numericWidth = width;
          widthValue = `${width}px`;
        } else if (/^\d+$/.test(width)) {
          // Если это строка содержащая только цифры, добавляем px
          numericWidth = parseInt(width, 10);
          widthValue = `${width}px`;
        } else {
          widthValue = width;
        }
      }

      // Вычисляем padding из wrapperStyle
      let paddingAdjustment = 0;
      const paddingLeftMatch = wrapperStyle.match(/padding-left:\s*(\d+)px/i);
      const paddingRightMatch = wrapperStyle.match(/padding-right:\s*(\d+)px/i);
      if (paddingLeftMatch) {
        paddingAdjustment += parseInt(paddingLeftMatch[1], 10);
      }
      if (paddingRightMatch) {
        paddingAdjustment += parseInt(paddingRightMatch[1], 10);
      }

      // Ширина для span с учетом padding
      const descriptionWidth = numericWidth > 0 && paddingAdjustment > 0
        ? `${numericWidth}px`
        : widthValue;

      console.log('ResizableImage renderHTML:', { width, widthValue, descriptionWidth, paddingAdjustment, wrapperStyle, caption });

      content.push(['span', {
        class: 'image-description',
        style: `display: block; font-size: 11px; line-height: 18px; font-weight: 400; color: #7D7D7D; text-align: center; width: ${descriptionWidth}; maxWidth: 100%, box-sizing: border-box; overflow-wrap: break-word;`
      }, caption]);

    }

    return ['div', { style: wrapperStyle }, ...content];
  },
});
