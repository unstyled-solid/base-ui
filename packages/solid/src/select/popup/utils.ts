import type { JSX } from '@solidjs/web';
export const LIST_FUNCTIONAL_STYLES: JSX.CSSProperties = {
  position: 'relative', 'max-height': '100%', 'overflow-x': 'hidden', 'overflow-y': 'auto',
};
export function clearStyles(element: HTMLElement | null, styles: Partial<CSSStyleDeclaration>) {
  if (element) Object.assign(element.style, styles);
}
