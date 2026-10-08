import { ownerWindow } from './owner';
import { platform } from './platform';
interface ElementBounds { left: number; right: number; top: number; bottom: number }
const BOUNDARY_OFFSET = 5;
/** Includes pseudo-elements and the source's five-pixel pointer drift tolerance. */
export function isMouseWithinBounds(event: MouseEvent, element: HTMLElement): boolean {
  const bounds = getPseudoElementBounds(element);
  return event.clientX >= bounds.left - BOUNDARY_OFFSET && event.clientX <= bounds.right + BOUNDARY_OFFSET &&
    event.clientY >= bounds.top - BOUNDARY_OFFSET && event.clientY <= bounds.bottom + BOUNDARY_OFFSET;
}
export function getPseudoElementBounds(element: HTMLElement): ElementBounds {
  const rect = element.getBoundingClientRect();
  const win = ownerWindow(element);
  if (platform.env.jsdom) return rect;
  const before = win.getComputedStyle(element, '::before');
  const after = win.getComputedStyle(element, '::after');
  if (before.content === 'none' && after.content === 'none') return rect;
  const width = Math.max(rect.width, parseFloat(before.width) || 0, parseFloat(after.width) || 0);
  const height = Math.max(rect.height, parseFloat(before.height) || 0, parseFloat(after.height) || 0);
  const widthDiff = width - rect.width;
  const heightDiff = height - rect.height;
  return { left: rect.left - widthDiff / 2, right: rect.right + widthDiff / 2, top: rect.top - heightDiff / 2, bottom: rect.bottom + heightDiff / 2 };
}
