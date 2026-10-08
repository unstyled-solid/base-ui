import { ownerWindow } from './owner';
/** Extracts translation and scale from transform, not CSS transform longhands. */
export function getElementTransform(element: HTMLElement, computedStyle?: CSSStyleDeclaration) {
  const transform = (computedStyle ?? ownerWindow(element).getComputedStyle(element)).transform;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  if (transform && transform !== 'none') {
    const matrix = transform.match(/matrix(?:3d)?\(([^)]+)\)/);
    if (matrix) {
      const values = matrix[1].split(', ').map(parseFloat);
      if (values.length === 6) {
        translateX = values[4];
        translateY = values[5];
        scale = Math.sqrt(values[0] * values[0] + values[1] * values[1]);
      } else if (values.length === 16) {
        translateX = values[12];
        translateY = values[13];
        scale = values[0];
      }
    }
  }
  return { x: translateX, y: translateY, scale };
}
