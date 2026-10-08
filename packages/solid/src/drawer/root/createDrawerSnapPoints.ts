import { createEffect, createSignal } from 'solid-js';
import { useDialogRootContext } from '../../dialog/root/DialogRootContext';
import { useDrawerRootContext } from './DrawerRootContext';
import { resolveSnapPoints, resolveActiveSnapPoint } from './snapPoints';
export * from './snapPoints';

export function createDrawerSnapPoints() {
  const store = useDialogRootContext();
  const drawer = useDrawerRootContext();
  const [geometry, setGeometry] = createSignal({ height: 0, fontSize: 16 });
  createEffect(() => ({ node: store.state.viewportElement ?? store.state.popupElement, viewport: store.state.viewportElement }), ({ node, viewport }) => {
    if (!node) return;
    const win = node.ownerDocument.defaultView;
    if (!win) return;
    const html = node.ownerDocument.documentElement;
    let disposed = false;
    const measure = () => {
      if (disposed) return;
      const parsed = Number.parseFloat(win.getComputedStyle(html).fontSize);
      setGeometry({ height: viewport ? viewport.offsetHeight : html.clientHeight, fontSize: Number.isFinite(parsed) ? parsed : 16 });
    };
    measure();
    const observer = win.ResizeObserver ? new win.ResizeObserver(measure) : null;
    observer?.observe(viewport ?? html);
    win.addEventListener('resize', measure);
    return () => { disposed = true; observer?.disconnect(); win.removeEventListener('resize', measure); };
  });
  const points = () => resolveSnapPoints(drawer.snapPoints, geometry().height, drawer.popupHeight, geometry().fontSize);
  return {
    get snapPoints() { return drawer.snapPoints; },
    get activeSnapPoint() { return drawer.activeSnapPoint; },
    setActiveSnapPoint: drawer.setActiveSnapPoint,
    get popupHeight() { return drawer.popupHeight; },
    get viewportHeight() { return geometry().height; },
    get resolvedSnapPoints() { return points(); },
    get activeSnapPointOffset() { return resolveActiveSnapPoint(drawer.activeSnapPoint, points(), geometry().height, drawer.popupHeight, geometry().fontSize)?.offset ?? null; },
  };
}
export { createDrawerSnapPoints as useDrawerSnapPoints };
