import { ownerWindow } from '../../utils/owner';

/** Pinned Base UI geometry; inline thumb margins deliberately assume symmetry (Safari RTL). */
export function getOffset(element: Element | null, prop: 'margin' | 'padding', axis: 'x' | 'y') {
  if (!element) return 0;
  const styles = ownerWindow(element).getComputedStyle(element);
  const key = `${prop}${axis === 'x' ? 'Inline' : 'Block'}` as const;
  const start = parseFloat(styles[`${key}Start`]) || 0;
  if (axis === 'x' && prop === 'margin') return start * 2;
  return start + (parseFloat(styles[`${key}End`]) || 0);
}
