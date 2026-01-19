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
            width: img.getAttribute('width'),
            loading: 'lazy',
            wrapperStyle: (element as HTMLElement).getAttribute('style'),
            caption: findCaptionText(element as HTMLElement),
          };
        },
      },
      ...this.parent?.() || [],
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { caption, wrapperStyle, ...imageAttrs } = node.attrs;

    // Удаляем wrapperStyle из imageAttrs
    const cleanImageAttrs = { ...imageAttrs };
    delete cleanImageAttrs.wrapperStyle;

    const imgStyle = 'border-radius: 10px;';

    if (!wrapperStyle) {
      return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { ...cleanImageAttrs, style: imgStyle })];
    }

    const imgAttrs = mergeAttributes(
      this.options.HTMLAttributes,
      HTMLAttributes,
      { ...cleanImageAttrs, style: imgStyle, loading: 'lazy' }
    );

    const content: (string | Record<string, unknown> | (string | Record<string, unknown>)[])[] = [['img', imgAttrs]];

    if (caption) {
      const width = node.attrs.width || imageAttrs.width;
      let descriptionWidth: string | undefined;

      if (width) {
        if (typeof width === 'number') {
          descriptionWidth = `${width}px`;
        } else if (/^\d+$/.test(width)) {
          descriptionWidth = `${width}px`;
        } else {
          descriptionWidth = width;
        }
      }

      content.push(['span', {
        class: 'image-description',
        style: `display: block; font-size: 11px; line-height: 18px; font-weight: 400; color: #7D7D7D; text-align: center; width: ${descriptionWidth}; max-width: 100%; box-sizing: border-box; overflow-wrap: break-word;`
      }, caption]);
    }

    return ['div', { style: wrapperStyle }, ...content];
  },
});
