import { createEffect, createSignal, type Accessor } from 'solid-js';
import { createScrollLock } from './createScrollLock';
export function createAnchoredPopupScrollLock(enabled: Accessor<boolean>, touchOpen: Accessor<boolean>, positioner: Accessor<HTMLElement | null>, reference: Accessor<Element | null>): void {
  const [fullWidth, setFullWidth] = createSignal(false);
  createEffect(() => ({ enabled: enabled(), touch: touchOpen(), element: positioner() }), (next) => {
    if (!next.enabled || !next.touch || !next.element) { setFullWidth(false); return; }
    const element = next.element;
    const update = () => { const width = element.ownerDocument.documentElement.clientWidth; setFullWidth(width > 0 && element.offsetWidth > 0 && element.offsetWidth >= width - 20); };
    update();
    const Observer = element.ownerDocument.defaultView?.ResizeObserver;
    if (!Observer) return;
    const observer = new Observer(update); observer.observe(element); return () => observer.disconnect();
  });
  createScrollLock(() => enabled() && (!touchOpen() || fullWidth()), reference);
}
export { createAnchoredPopupScrollLock as useAnchoredPopupScrollLock };
