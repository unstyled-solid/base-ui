// Base UI's quadrilateral/trough and cursor-speed algorithm, MIT (19511bb).
import { isElement } from '@floating-ui/utils/dom';
import { Timeout } from '../utils/createTimeout';
import { contains, getTarget } from './utils/element';
import { getNodeChildren } from './utils/nodes';
import type { HandleClose, HandleCloseOptions } from './hooks/hoverShared';
export interface SafePolygonOptions extends HandleCloseOptions {}
function polygon(x: number, y: number, points: readonly (readonly [number, number])[]): boolean {
  let inside = false;
  for (let i = 0; i < points.length; i++) {
    const [xi, yi] = points[i]!, [xj, yj] = points[(i + 1) % points.length]!;
    if ((yi >= y) !== (yj >= y) && x <= (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function rectangle(x: number, y: number, x1: number, y1: number, x2: number, y2: number) { return x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2); }
export function safePolygon(options: SafePolygonOptions = {}): HandleClose {
  const timeout = new Timeout();
  const fn: HandleClose = ({ x, y, placement, elements, onClose, nodeId, tree }) => {
    const side = placement?.split('-')[0];
    let landed = false, lastX: number | null = null, lastY: number | null = null;
    let cursorTime = typeof performance !== 'undefined' ? performance.now() : 0;
    const close = () => { timeout.clear(); onClose(); };
    const closeIfNoChild = () => { if (!(tree && getNodeChildren(tree.nodes, nodeId).length)) close(); };
    const slowly = (x: number, y: number) => {
      const time = performance.now(), elapsed = time - cursorTime;
      const slow = lastX !== null && lastY !== null && elapsed !== 0 && (x - lastX) ** 2 + (y - lastY) ** 2 < elapsed ** 2 * 0.01;
      lastX = x; lastY = y; cursorTime = time; return slow;
    };
    return (event) => {
      timeout.clear();
      const reference = elements.domReference, floating = elements.floating;
      if (!reference || !floating || !side || x === null || y === null) return;
      const px = event.clientX, py = event.clientY, target = getTarget(event) as Element | null, leave = event.type === 'mouseleave';
      if (contains(floating, target)) { landed = true; if (!leave) return; }
      if (contains(reference, target)) { landed = false; if (!leave) { landed = true; return; } }
      if (leave && isElement(event.relatedTarget) && contains(floating, event.relatedTarget)) return;
      if (tree && getNodeChildren(tree.nodes, nodeId).length) return;
      const ref = reference.getBoundingClientRect(), rect = floating.getBoundingClientRect();
      const rightward = x > rect.right - rect.width / 2, downward = y > rect.bottom - rect.height / 2;
      const wider = rect.width > ref.width, taller = rect.height > ref.height;
      const left = (wider ? ref : rect).left, right = (wider ? ref : rect).right, top = (taller ? ref : rect).top, bottom = (taller ? ref : rect).bottom;
      if ((side === 'top' && y >= ref.bottom - 1) || (side === 'bottom' && y <= ref.top + 1) || (side === 'left' && x >= ref.right - 1) || (side === 'right' && x <= ref.left + 1)) { closeIfNoChild(); return; }
      const trough = side === 'top' ? rectangle(px, py, left, ref.top + 1, right, rect.bottom - 1)
        : side === 'bottom' ? rectangle(px, py, left, rect.top + 1, right, ref.bottom - 1)
        : side === 'left' ? rectangle(px, py, rect.right - 1, bottom, ref.left + 1, top)
        : rectangle(px, py, ref.right - 1, bottom, rect.left + 1, top);
      if (trough) return;
      if (landed && !rectangle(px, py, ref.x, ref.y, ref.x + ref.width, ref.y + ref.height)) { closeIfNoChild(); return; }
      if (!leave && slowly(px, py)) { closeIfNoChild(); return; }
      let points: [number, number][];
      if (side === 'top' || side === 'bottom') {
        const buffer = wider ? 0.25 : 2;
        const one = wider ? x + buffer : rightward ? x + buffer : x - buffer;
        const two = wider ? x - buffer : rightward ? x + buffer : x - buffer;
        const near = side === 'top' ? rect.bottom - 0.5 : rect.top + 0.5;
        const far = side === 'top' ? rect.top : rect.bottom;
        const cursorY = side === 'top' ? y + 1.5 : y - 0.5;
        points = [[one, cursorY], [two, cursorY], [rect.left, rightward || wider ? near : far], [rect.right, !rightward || wider ? near : far]];
      } else {
        const buffer = taller ? 0.25 : 2;
        const one = taller ? y + buffer : downward ? y + buffer : y - buffer;
        const two = taller ? y - buffer : downward ? y + buffer : y - buffer;
        const near = side === 'left' ? rect.right - 0.5 : rect.left + 0.5;
        const far = side === 'left' ? rect.left : rect.right;
        const cursorX = side === 'left' ? x + 1.5 : x - 0.5;
        points = side === 'left' ? [[downward || taller ? near : far, rect.top], [!downward || taller ? near : far, rect.bottom], [cursorX, one], [cursorX, two]]
          : [[cursorX, one], [cursorX, two], [downward || taller ? near : far, rect.top], [!downward || taller ? near : far, rect.bottom]];
      }
      if (!polygon(px, py, points)) closeIfNoChild(); else if (!landed) timeout.start(40, closeIfNoChild);
    };
  };
  fn.__options = { ...options, blockPointerEvents: options.blockPointerEvents ?? false };
  fn.dispose = timeout.clear;
  return fn;
}
