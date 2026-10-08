import { getComputedStyle } from '@floating-ui/utils/dom';
/** Extracted from pinned composite.ts; no navigation-layer dependency. */
export function isHiddenByStyles(styles: CSSStyleDeclaration) {
  return styles.visibility === 'hidden' || styles.visibility === 'collapse';
}
export function isElementVisible(element: Element | null, styles: CSSStyleDeclaration | null = element ? getComputedStyle(element) : null) {
  if (!element || !element.isConnected || !styles || isHiddenByStyles(styles)) return false;
  if (typeof element.checkVisibility === 'function') return element.checkVisibility();
  return styles.display !== 'none' && styles.display !== 'contents';
}
