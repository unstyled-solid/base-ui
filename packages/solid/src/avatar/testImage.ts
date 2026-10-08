import { vi } from 'vitest';

export interface MockImage {
  complete: boolean;
  naturalWidth: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  referrerPolicy: string;
  crossOrigin: string | null;
  sizes: string;
  srcset: string;
  src: string;
}

/** Detached probes only. Rendered img load/error events are dispatched independently. */
export function mockImageLoading({ cached = false, width = 100 } = {}) {
  const images: MockImage[] = [];
  const assignments: string[][] = [];
  const OriginalImage = window.Image;
  const constructor = vi.fn(function Image() {
    const order: string[] = [];
    let source = '';
    let sourceSet = '';
    const image: MockImage = {
      complete: false, naturalWidth: 0, onload: null, onerror: null,
      referrerPolicy: '', crossOrigin: null, sizes: '',
      get src() { return source; },
      set src(value) {
        source = value; order.push('src');
        if (cached) { image.complete = true; image.naturalWidth = width; }
      },
      get srcset() { return sourceSet; },
      set srcset(value) {
        sourceSet = value; order.push('srcset');
        if (cached) { image.complete = true; image.naturalWidth = width; }
      },
    };
    images.push(image);
    assignments.push(order);
    return image;
  });
  window.Image = constructor as unknown as typeof window.Image;
  return { images, assignments, constructor, restore() { window.Image = OriginalImage; } };
}

export { TRANSPARENT_IMAGE } from './fixtures/imageSource';
