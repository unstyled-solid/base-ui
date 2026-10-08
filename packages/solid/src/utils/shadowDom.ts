import { isElement, isShadowRoot } from '@floating-ui/utils/dom';

export function activeElement(doc: Document) {
  let element = doc.activeElement;
  while (element?.shadowRoot?.activeElement != null) {
    element = element.shadowRoot.activeElement;
  }
  return element;
}

export function contains(parent?: Element | null, child?: Element | null) {
  if (!parent || !child) return false;
  if (parent.contains(child)) return true;
  // Follow slots as well as shadow hosts, retaining native light-tree containment.
  let current: Node | null = child;
  while (current) {
    if (parent === current) return true;
    current = (current as Element).assignedSlot ?? current.parentNode ??
      (isShadowRoot(current) ? current.host : null);
  }
  return false;
}

/** Finds the closest match in the composed tree. `:scope` is not supported. */
export function closest<K extends keyof HTMLElementTagNameMap>(node: Node | null | undefined, selector: K): HTMLElementTagNameMap[K] | null;
export function closest<K extends keyof SVGElementTagNameMap>(node: Node | null | undefined, selector: K): SVGElementTagNameMap[K] | null;
export function closest<E extends Element = Element>(node: Node | null | undefined, selector: string): E | null;
export function closest(node: Node | null | undefined, selector: string): Element | null {
  let current = node;
  while (current) {
    if (isElement(current) && current.matches(selector)) return current;
    current = (current as Element).assignedSlot ?? current.parentNode ??
      (isShadowRoot(current) ? current.host : null);
  }
  return null;
}

export function getTarget(event: Event) {
  if ('composedPath' in event) {
    // The path is empty after dispatch; native target remains available.
    return event.composedPath()[0] ?? event.target;
  }
  return (event as Event).target;
}
