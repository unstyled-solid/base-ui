import { vi } from 'vitest';

/** Source mobile viewport fixture: geometry is explicit, while native focus/scroll events remain real. */
export function mockKeyboardViewport() {
  const heightDescriptor = Object.getOwnPropertyDescriptor(window, 'innerHeight');
  const viewportDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport');
  let layoutHeight = 800;
  let visualHeight = 800;
  let offsetTop = 0;
  let scale = 1;
  let follows = false;
  const viewport = new EventTarget();
  Object.defineProperties(viewport, {
    height: { get: () => visualHeight }, offsetTop: { get: () => offsetTop }, scale: { get: () => scale },
  });
  Object.defineProperty(window, 'innerHeight', { configurable: true, get: () => layoutHeight });
  Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
  const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!.get!;
  const spy = vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (this: HTMLElement) {
    return this.style.height === '100svh' ? (follows ? visualHeight : 800) : offsetHeight.call(this);
  });
  return {
    resize(height: number) { visualHeight = height; viewport.dispatchEvent(new Event('resize')); },
    scroll(top: number) { offsetTop = top; viewport.dispatchEvent(new Event('scroll')); },
    zoom(value: number) { scale = value; viewport.dispatchEvent(new Event('resize')); },
    layout(height: number, smallFollows = false) { layoutHeight = height; follows = smallFollows; window.dispatchEvent(new Event('resize')); },
    restore() {
      spy.mockRestore();
      if (heightDescriptor) Object.defineProperty(window, 'innerHeight', heightDescriptor);
      if (viewportDescriptor) Object.defineProperty(window, 'visualViewport', viewportDescriptor);
      else Reflect.deleteProperty(window, 'visualViewport');
    },
  };
}
export function rect(top: number, bottom: number): DOMRect {
  return { top, bottom, height: bottom - top, left: 0, right: 320, width: 320, x: 0, y: top, toJSON: () => ({}) };
}
export function mockKeyboardScroll(scroll: HTMLElement, field: HTMLElement, padding = 20) {
  const previousHeight = scroll.style.height;
  // The source fixtures use a 420px body with 900px of content. Mocking the
  // metrics alone cannot make a desktop browser scroll: native scrollTop is
  // still clamped to its real layout overflow. Keep that physical prerequisite.
  scroll.style.height = '420px';
  scroll.style.overflowY = 'auto'; scroll.style.paddingBottom = `${padding}px`; scroll.style.overflowAnchor = 'auto';
  let filler: HTMLDivElement | null = null;
  if (scroll.scrollHeight <= scroll.clientHeight) {
    filler = scroll.ownerDocument.createElement('div');
    filler.style.height = '900px';
    scroll.prepend(filler);
  }
  Object.defineProperties(scroll, { clientHeight: { configurable: true, value: 420 }, scrollHeight: { configurable: true, value: 1200 } });
  scroll.getBoundingClientRect = () => rect(300, 720);
  field.getBoundingClientRect = () => rect(650 - scroll.scrollTop, 690 - scroll.scrollTop);
  const original = scroll.scrollTo;
  const scrollTo = vi.fn((options?: ScrollToOptions | number) => { if (typeof options === 'object' && options.top !== undefined) scroll.scrollTop = options.top; });
  scroll.scrollTo = scrollTo;
  return { scrollTo, restore() { scroll.scrollTo = original; scroll.style.height = previousHeight; filler?.remove(); } };
}
export async function animationFrames(count: number) {
  for (let i = 0; i < count; i++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}
