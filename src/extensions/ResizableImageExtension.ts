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
          if (!attributes.style) {
            return {};
          }
          return { style: attributes.style };
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

    // Добавляем ширину к wrapper div если есть caption
    const finalWrapperStyle = wrapperStyle;
    if (caption) {
      const width = node.attrs.width || imageAttrs.width;
      console.log(width, 'width')




      content.push(['span', {
        class: 'image-description',
        style: `display: block; font-size: 11px; line-height: 18px; font-weight: 400; color: #7D7D7D; text-align: center; maxWidth: ${imageAttrs!.width + 'px'}; box-sizing: border-box; overflow-wrap: break-word;`
      }, caption]);

      // Обязательно добавляем ширину к wrapper div
      // if (widthValue) {
      //   // Убираем существующий width если есть
      //   let cleanedStyle = wrapperStyle.replace(/width\s*:\s*[^;]+;?/gi, '').trim();
      //   // Убираем trailing точку с запятой если есть
      //   if (cleanedStyle.endsWith(';')) {
      //     cleanedStyle = cleanedStyle.slice(0, -1);
      //   }
      //   // Добавляем width
      //   finalWrapperStyle = `${cleanedStyle}; width: ${widthValue};`;
      //   console.log('Final wrapper style:', finalWrapperStyle);
      // }
    }

    return ['div', { style: finalWrapperStyle }, ...content];
  },
});
