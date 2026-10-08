// Shared native capture operations. Ignore only the specified missing-pointer error.
export function acquirePointerCapture(element: Element | null, id: number): void {
  if (!element || typeof element.setPointerCapture !== 'function') return;
  try { element.setPointerCapture(id); } catch (error) {
    if (!(error && typeof error === 'object' && 'name' in error && error.name === 'NotFoundError')) throw error;
  }
}
export function releasePointerCapture(element: Element | null, id: number): void {
  if (!element || typeof element.releasePointerCapture !== 'function') return;
  if (typeof element.hasPointerCapture === 'function' && !element.hasPointerCapture(id)) return;
  try { element.releasePointerCapture(id); } catch (error) {
    if (!(error && typeof error === 'object' && 'name' in error && error.name === 'NotFoundError')) throw error;
  }
}
