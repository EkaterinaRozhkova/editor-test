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
        renderHTML: () => ({}), // Стили обрабатываются в renderHTML() метода
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

          // Берем только border-radius из inline стилей img (если есть)
          const imgStyle = img.getAttribute('style');
          const borderRadiusMatch = imgStyle?.match(/border-radius:\s*[^;]+/);
          const cleanImgStyle = borderRadiusMatch ? borderRadiusMatch[0] : null;

          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            loading: 'lazy',
            style: cleanImgStyle, // Только border-radius, без стилей контейнера
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
    const { caption, wrapperStyle, containerStyle: _containerStyle, ...imageAttrs } = node.attrs;

    // Удаляем wrapperStyle, containerStyle и style из imageAttrs
    const cleanImageAttrs = { ...imageAttrs };
    delete cleanImageAttrs.wrapperStyle;
    delete cleanImageAttrs.containerStyle;
    delete cleanImageAttrs.style;

    // Только border-radius для изображения
    const imgStyle = 'border-radius: 10px;';

    if (!wrapperStyle) {
      return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { ...cleanImageAttrs, style: imgStyle })];
    }

    // Удаляем style из HTMLAttributes чтобы стили контейнера не попали в img
    const cleanHTMLAttributes = { ...HTMLAttributes };
    delete cleanHTMLAttributes.style;

    const imgAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      cleanHTMLAttributes,
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


      const descriptionWidth = numericWidth > 0
        ? `${numericWidth}px`
        : widthValue;

      content.push(['span', {
        class: 'image-description',
        style: `display: block; font-size: 11px; line-height: 18px; font-weight: 400; color: #7D7D7D; text-align: center; width: ${descriptionWidth}; maxWidth: 100%, box-sizing: border-box; overflow-wrap: break-word;`
      }, caption]);

    }

    return ['div', { style: wrapperStyle }, ...content];
  },
});
