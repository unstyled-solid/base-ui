import { createEffect, type Accessor } from 'solid-js';
import { isOverflowElement } from '@floating-ui/utils/dom';
import { platform } from './platform';
import { AnimationFrame } from './createAnimationFrame';
interface Lock { count: number; restore(): void }
const locks = new WeakMap<Document, Lock>();
function scroller(doc: Document): HTMLElement { return isOverflowElement(doc.documentElement) ? doc.documentElement : doc.body; }
function locked(doc: Document): boolean { return /hidden|clip/.test(doc.defaultView!.getComputedStyle(scroller(doc)).overflowY); }
function acquire(doc: Document): () => void {
  const held = locks.get(doc);
  if (held) { held.count++; return () => release(doc, held); }
  const win = doc.defaultView!, html = doc.documentElement, body = doc.body;
  const frame = new AnimationFrame();
  let observer: MutationObserver | undefined;
  let restoreStyles = () => {};
  let removeResize = () => {};
  const record: Lock = { count: 1, restore() { observer?.disconnect(); frame.cancel(); removeResize(); restoreStyles(); } };
  locks.set(doc, record);
  const apply = () => {
    if (!record.count) return;
    if (locked(doc)) {
      observer = new win.MutationObserver(() => { if (!locked(doc)) { observer!.disconnect(); observer = undefined; apply(); } });
      observer.observe(html, { attributes: true }); observer.observe(body, { attributes: true });
      return;
    }
    if (platform.engine.webkit && (win.visualViewport?.scale ?? 1) !== 1) return;
    const styles = new Map<HTMLElement, Map<string, { original: string; priority: string; written: string }>>();
    const write = (element: HTMLElement, property: string, value: string) => {
      let map = styles.get(element); if (!map) styles.set(element, map = new Map());
      if (!map.has(property)) map.set(property, { original: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property), written: value });
      else map.get(property)!.written = value;
      element.style.setProperty(property, value);
    };
    const viewport = scroller(doc), inset = win.innerWidth - html.clientWidth > 0 && !platform.os.ios;
    const scrollTop = html.scrollTop, scrollLeft = html.scrollLeft;
    let movedScroll = false;
    let markerOriginal: string | null = null;
    if (!inset) { write(viewport, 'overflow-y', 'hidden'); write(viewport, 'overflow-x', 'hidden'); }
    else {
      const htmlCSS = win.getComputedStyle(html), bodyCSS = win.getComputedStyle(body);
      const gutter = htmlCSS.scrollbarGutter.includes('both-edges') ? 'stable both-edges' : 'stable';
      let stable = false;
      if (win.CSS?.supports?.('scrollbar-gutter', 'stable')) {
        const oldOverflow = viewport.style.overflowY, oldGutter = html.style.scrollbarGutter;
        html.style.scrollbarGutter = 'stable'; viewport.style.overflowY = 'scroll'; const before = viewport.offsetWidth;
        viewport.style.overflowY = 'hidden'; stable = before === viewport.offsetWidth;
        viewport.style.overflowY = oldOverflow; html.style.scrollbarGutter = oldGutter;
      }
      write(html, 'scrollbar-gutter', gutter);
      if (stable) { write(viewport, 'overflow-y', 'hidden'); write(viewport, 'overflow-x', 'hidden'); }
      else {
        const width = Math.max(0, win.innerWidth - body.clientWidth), height = Math.max(0, win.innerHeight - body.clientHeight);
        const marginX = (parseFloat(bodyCSS.marginLeft) || 0) + (parseFloat(bodyCSS.marginRight) || 0), marginY = (parseFloat(bodyCSS.marginTop) || 0) + (parseFloat(bodyCSS.marginBottom) || 0);
        write(html, 'overflow-y', html.scrollHeight > html.clientHeight || htmlCSS.overflowY === 'scroll' || bodyCSS.overflowY === 'scroll' ? 'scroll' : 'hidden');
        write(html, 'overflow-x', html.scrollWidth > html.clientWidth || htmlCSS.overflowX === 'scroll' || bodyCSS.overflowX === 'scroll' ? 'scroll' : 'hidden');
        write(body, 'position', 'relative'); write(body, 'height', marginY || height ? `calc(100dvh - ${marginY + height}px)` : '100dvh');
        write(body, 'width', marginX || width ? `calc(100vw - ${marginX + width}px)` : '100vw'); write(body, 'box-sizing', 'border-box');
        write(body, 'overflow-y', 'hidden'); write(body, 'overflow-x', 'hidden'); write(body, 'scroll-behavior', 'unset'); write(html, 'scroll-behavior', 'unset');
        body.scrollTop = scrollTop; body.scrollLeft = scrollLeft;
        markerOriginal = html.getAttribute('data-base-ui-scroll-locked'); html.setAttribute('data-base-ui-scroll-locked', ''); movedScroll = true;
      }
    }
    restoreStyles = () => {
      for (const [element, properties] of styles) for (const [property, value] of properties) {
        if (element.style.getPropertyValue(property) !== value.written) continue;
        if (value.original) element.style.setProperty(property, value.original, value.priority); else element.style.removeProperty(property);
      }
      if (movedScroll) { html.scrollTop = scrollTop; html.scrollLeft = scrollLeft;
        if (html.getAttribute('data-base-ui-scroll-locked') === '') { if (markerOriginal === null) html.removeAttribute('data-base-ui-scroll-locked'); else html.setAttribute('data-base-ui-scroll-locked', markerOriginal); }
      }
    };
    const resize = () => { restoreStyles(); removeResize(); frame.request(apply); };
    win.addEventListener('resize', resize); removeResize = () => win.removeEventListener('resize', resize);
  };
  // A microtask boundary coalesces acquire/release before taking any DOM snapshot.
  queueMicrotask(() => { if (locks.get(doc) === record && record.count) apply(); });
  return () => release(doc, record);
}
function release(doc: Document, record: Lock) { if (record.count <= 0) return; record.count--; if (!record.count) queueMicrotask(() => { if (!record.count && locks.get(doc) === record) { record.restore(); locks.delete(doc); } }); }
export function createScrollLock(enabled: Accessor<boolean> = () => true, element: Accessor<Element | null> = () => null): void {
  createEffect(() => ({ enabled: enabled(), element: element() }), (next) => {
    if (!next.enabled || typeof document === 'undefined') return;
    let released = false;
    let cleanup: (() => void) | undefined;
    // Template refs can precede adoption. Resolve the document at the DOM
    // checkpoint rather than retaining the inert template's ownerDocument.
    queueMicrotask(() => {
      if (released) return;
      const doc = next.element?.ownerDocument ?? document;
      if (doc.defaultView && doc.documentElement && doc.body) cleanup = acquire(doc);
    });
    return () => { released = true; cleanup?.(); };
  });
}
export { createScrollLock as useScrollLock };
