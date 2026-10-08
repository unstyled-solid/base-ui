import { createEffect, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import type { FloatingRootContext, VirtualElement } from '../../internals/contracts/floating';
import type { InteractionProps } from './createDismiss';
import { contains, getTarget } from '../utils/element';
import { isMouseLikePointerType } from '../utils/event';
import { isServer } from '@solidjs/web';
export interface UseClientPointProps { enabled?: boolean | undefined; axis?: 'x' | 'y' | 'both' | 'none' | undefined; x?: number | null | undefined; y?: number | null | undefined }
export function createClientPoint(input: FloatingRootContext | Accessor<FloatingRootContext>, options: UseClientPointProps = {}): InteractionProps {
  if (isServer) return {};
  const context = () => typeof input === 'function' ? input() : input;
  const resetReference = (root: FloatingRootContext, dom: Element | null) => {
    // The root already derives its ordinary anchor. Only release an actual
    // cursor override; copying that anchor on every mount is a state relay.
    if (untrack(() => root.state.referenceElement) !== dom) root.setPositionReference?.(dom);
  };
  const [pointer, setPointer] = createSignal<string | undefined>(undefined), [restart, setRestart] = createSignal(0);
  let initial = false, remove = () => {}, listening = false;
  const setPoint = (x: number | null, y: number | null, dom = context().state.domReferenceElement) => {
    const root = context();
    if (initial || options.axis === 'none' || options.enabled === false || (root.data.openEvent && !('clientX' in root.data.openEvent))) return;
    const axis = options.axis ?? 'both', type = untrack(pointer);
    let offsetX: number | null = null, offsetY: number | null = null, updated = false;
    const virtual: VirtualElement = {
      contextElement: dom ?? undefined,
      getBoundingClientRect() {
        const rect = dom?.getBoundingClientRect() ?? { width: 0, height: 0, x: 0, y: 0 };
        const xAxis = axis === 'x' || axis === 'both', yAxis = axis === 'y' || axis === 'both';
        if (offsetX === null && x && xAxis) offsetX = rect.x - x;
        if (offsetY === null && y && yAxis) offsetY = rect.y - y;
        let nextX = rect.x - (offsetX ?? 0), nextY = rect.y - (offsetY ?? 0);
        const track = ['mouseenter', 'mousemove'].includes(root.data.openEvent?.type ?? '') && type !== 'touch';
        if (!updated || track) { nextX = xAxis && x !== null ? x : nextX; nextY = yAxis && y !== null ? y : nextY; }
        updated = true;
        const width = axis === 'y' ? rect.width : 0, height = axis === 'x' ? rect.height : 0;
        return { x: nextX, y: nextY, width, height, top: nextY, left: nextX, right: nextX + width, bottom: nextY + height };
      },
    };
    root.setPositionReference?.(virtual);
  };
  createEffect(() => ({ root: context(), enabled: options.enabled !== false && options.axis !== 'none', open: context().state.open, floating: context().state.floatingElement, dom: context().state.domReferenceElement, pointer: pointer(), axis: options.axis, x: options.x, y: options.y, restart: restart() }), (next) => {
    if (!next.floating) initial = false;
    if (!next.enabled) { if (next.open) initial = true; resetReference(next.root, next.dom); return; }
    if (next.x !== undefined || next.y !== undefined) untrack(() => setPoint(next.x ?? null, next.y ?? null, next.dom));
    if (!(isMouseLikePointerType(next.pointer) ? next.floating : next.open)) return;
    if (next.root.data.openEvent && !('clientX' in next.root.data.openEvent)) { resetReference(next.root, next.dom); return; }
    const win = next.floating?.ownerDocument.defaultView ?? next.dom?.ownerDocument.defaultView;
    if (!win) return;
    const move = (event: MouseEvent) => { if (!contains(next.floating, getTarget(event) as Element | null)) setPoint(event.clientX, event.clientY); else remove(); };
    win.addEventListener('mousemove', move); listening = true;
    remove = () => { listening = false; win.removeEventListener('mousemove', move); };
    return remove;
  });
  onCleanup(() => { remove(); untrack(() => context().setPositionReference?.(null)); });
  const reference: NonNullable<InteractionProps['reference']> = {
    onPointerDown(event) { setPointer(event.pointerType); }, onPointerEnter(event) { setPointer(event.pointerType); },
    onMouseEnter(event) { if (!context().state.open || !listening) { setPoint(event.clientX, event.clientY, event.currentTarget); setRestart((value) => value + 1); } },
    onMouseMove(event) { if (!context().state.open || !listening) { setPoint(event.clientX, event.clientY, event.currentTarget); setRestart((value) => value + 1); } },
  };
  return { get reference() { return options.enabled === false ? undefined : reference; }, get trigger() { return options.enabled === false ? undefined : reference; } };
}
export { createClientPoint as useClientPoint };
