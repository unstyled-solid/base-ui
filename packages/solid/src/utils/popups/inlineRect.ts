// Base UI's inline line-box selection with trigger identity and delayed hit-line reuse, MIT.
import type { Middleware, VirtualElement } from '@floating-ui/dom';
import { isElement } from '@floating-ui/utils/dom';
import type { Accessor } from 'solid-js';
export interface InlineRectCoords { x: number; y: number; lineIndex?: number | undefined; element: Element }
type RectLike = { -readonly [K in 'left' | 'top' | 'right' | 'bottom' | 'width' | 'height']: DOMRect[K] };
interface ClientRectsReference { getClientRects(): ArrayLike<RectLike> }
type Cell = { current: InlineRectCoords | undefined };
const rect = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom, x: left, y: top, width: right - left, height: bottom - top });
function linesFor(rects: ArrayLike<RectLike>) {
  const lines: RectLike[] = []; let previous: RectLike | undefined;
  let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
  for (const source of [...Array.from(rects)].sort((a, b) => a.top - b.top)) {
    left = Math.min(left, source.left); top = Math.min(top, source.top); right = Math.max(right, source.right); bottom = Math.max(bottom, source.bottom);
    if (!previous || source.top - previous.top > previous.height / 2) lines.push({ left: source.left, top: source.top, right: source.right, bottom: source.bottom, width: source.width, height: source.height });
    else { const line = lines.at(-1)!; line.left = Math.min(line.left, source.left); line.right = Math.max(line.right, source.right); line.bottom = Math.max(line.bottom, source.bottom); line.width = line.right - line.left; line.height = line.bottom - line.top; }
    previous = source;
  }
  return { lines, fallback: rect(left, top, right, bottom) };
}
const findLine = (lines: RectLike[], x: number, y: number) => lines.findIndex((line) => x > line.left - 2 && x < line.right + 2 && y > line.top - 2 && y < line.bottom + 2);
export function updateInlineRectCoords(coords: Cell, element: Element, x: number, y: number): InlineRectCoords | undefined {
  const { lines } = linesFor(element.getClientRects());
  const index = findLine(lines, x, y);
  return coords.current = lines.length < 2 ? undefined : { x, y, element, lineIndex: index === -1 ? undefined : index };
}
export function getInlineRectTriggerProps(source: Cell | Accessor<Cell>, isOpen: boolean | (() => boolean)) {
  const coords = () => typeof source === 'function' ? source() : source;
  const update = (event: MouseEvent) => { if (!(typeof isOpen === 'function' ? isOpen() : isOpen)) updateInlineRectCoords(coords(), event.currentTarget as Element, event.clientX, event.clientY); };
  return { onFocus() { coords().current = undefined; }, onMouseEnter: update, onMouseMove: update };
}
function inlineRect(reference: ClientRectsReference, placement: string, coords: InlineRectCoords | undefined) {
  const { lines, fallback } = linesFor(reference.getClientRects());
  if (lines.length < 2) return null;
  const index = coords?.lineIndex != null && lines[coords.lineIndex] ? coords.lineIndex : coords ? findLine(lines, coords.x, coords.y) : -1;
  if (index !== -1) { const line = lines[index]!; return rect(line.left, line.top, line.right, line.bottom); }
  if (lines.length === 2 && lines[0]!.left > lines[1]!.right && coords) return fallback;
  const side = placement[0], first = lines[0]!, last = lines.at(-1)!;
  if (side === 't' || side === 'b') { const target = side === 't' ? first : last; return rect(target.left, first.top, target.right, last.bottom); }
  const leftward = side === 'l'; let left = first.left, right = first.right, edge = leftward ? Infinity : -Infinity, targetFirst = first, targetLast = first;
  for (const line of lines) {
    left = Math.min(left, line.left); right = Math.max(right, line.right);
    const candidate = leftward ? line.left : line.right;
    if (leftward ? candidate < edge : candidate > edge) { edge = candidate; targetFirst = line; targetLast = line; }
    else if (candidate === edge) targetLast = line;
  }
  return rect(left, targetFirst.top, right, targetLast.bottom);
}
export function createInlineMiddleware(source: Cell | Accessor<Cell>): Middleware {
  return { name: 'inline', async fn(state) {
    const reference = state.elements.reference;
    if (typeof (reference as Partial<ClientRectsReference>).getClientRects !== 'function') return {};
    const contextElement = 'contextElement' in reference ? reference.contextElement : isElement(reference) ? reference : undefined;
    const current = (typeof source === 'function' ? source() : source).current;
    const box = inlineRect(reference as ClientRectsReference, state.placement, current?.element === reference || current?.element === contextElement ? current : undefined);
    if (!box) return {};
    const resetRects = await state.platform.getElementRects({ reference: { contextElement, getBoundingClientRect: () => box } satisfies VirtualElement, floating: state.elements.floating, strategy: state.strategy });
    if (['x', 'y', 'width', 'height'].every((key) => state.rects.reference[key as 'x' | 'y' | 'width' | 'height'] === resetRects.reference[key as 'x' | 'y' | 'width' | 'height'])) return {};
    return { reset: { rects: resetRects } };
  } };
}
