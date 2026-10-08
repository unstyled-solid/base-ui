import { getComputedStyle, getNodeName, isHTMLElement, isShadowRoot } from '@floating-ui/utils/dom';
import { ownerDocument } from '../../utils/owner';
import { activeElement, contains } from './element';
import { isElementVisible } from './visibility';

export type FocusableElement = HTMLElement | SVGElement;
const CANDIDATE_SELECTOR = 'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';
function getParentElement(element: Element) {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return isShadowRoot(root) ? root.host : null;
}
function getDetailsSummary(details: Element) {
  for (const child of Array.from(details.children)) {
    if (getNodeName(child) === 'summary') return child;
  }
  return null;
}
function isWithinOpenDetailsSummary(element: Element, details: Element) {
  const summary = getDetailsSummary(details);
  return !!summary && (element === summary || contains(summary, element));
}
function isFocusableCandidate(element: Element | null): element is FocusableElement {
  const nodeName = element ? getNodeName(element) : '';
  return element != null && element.matches(CANDIDATE_SELECTOR) &&
    (nodeName !== 'summary' || (element.parentElement != null && getNodeName(element.parentElement) === 'details' && getDetailsSummary(element.parentElement) === element)) &&
    (nodeName !== 'details' || getDetailsSummary(element) == null) &&
    (nodeName !== 'input' || (element as HTMLInputElement).type !== 'hidden');
}
function isFocusableElement(element: Element | null): element is FocusableElement {
  if (!isFocusableCandidate(element) || !element.isConnected || element.matches(':disabled')) return false;
  for (let current: Element | null = element; current; current = getParentElement(current)) {
    const isAncestor = current !== element;
    const isSlot = getNodeName(current) === 'slot';
    if (current.hasAttribute('inert')) return false;
    if ((isAncestor && getNodeName(current) === 'details' && !(current as HTMLDetailsElement).open && !isWithinOpenDetailsSummary(element, current)) ||
      current.hasAttribute('hidden') || (!isSlot && !isVisibleInTabbableTree(current, isAncestor))) return false;
  }
  return true;
}
function isVisibleInTabbableTree(element: Element, isAncestor: boolean) {
  const styles = getComputedStyle(element);
  return isAncestor ? styles.display !== 'none' : isElementVisible(element, styles);
}
function getTabIndex(element: FocusableElement) {
  const tabIndex = element.tabIndex;
  if (tabIndex < 0) {
    const name = getNodeName(element);
    if (name === 'details' || name === 'audio' || name === 'video' || (isHTMLElement(element) && element.isContentEditable)) return 0;
  }
  return tabIndex;
}
function getNamedRadioInput(element: FocusableElement) {
  if (getNodeName(element) !== 'input') return null;
  const input = element as HTMLInputElement;
  return input.type === 'radio' && input.name !== '' ? input : null;
}
function isTabbableRadio(element: FocusableElement, candidates: FocusableElement[]) {
  const input = getNamedRadioInput(element);
  if (!input) return true;
  const checkedRadio = candidates.find((candidate) => {
    const radio = getNamedRadioInput(candidate);
    return radio?.name === input.name && radio.form === input.form && radio.checked;
  });
  if (checkedRadio) return checkedRadio === input;
  return candidates.find((candidate) => {
    const radio = getNamedRadioInput(candidate);
    return radio?.name === input.name && radio.form === input.form;
  }) === input;
}
function getComposedChildren(container: ParentNode): Element[] {
  if (isHTMLElement(container) && getNodeName(container) === 'slot') {
    const assignedElements = (container as HTMLSlotElement).assignedElements({ flatten: true });
    if (assignedElements.length > 0) return assignedElements;
  }
  if (isHTMLElement(container) && container.shadowRoot) return Array.from(container.shadowRoot.children);
  return Array.from(container.children);
}
function appendCandidates(container: ParentNode, list: FocusableElement[]) {
  getComposedChildren(container).forEach((child) => {
    if (isFocusableCandidate(child)) list.push(child);
    appendCandidates(child, list);
  });
}
function appendMatchingElements(container: ParentNode, selector: string, list: FocusableElement[]) {
  getComposedChildren(container).forEach((child) => {
    if (isFocusableCandidate(child) && child.matches(selector)) list.push(child);
    appendMatchingElements(child, selector, list);
  });
}
export function isTabbable(element: Element | null) { return isFocusableElement(element) && getTabIndex(element) >= 0; }
export function focusable(container: Element) {
  const candidates: FocusableElement[] = [];
  appendCandidates(container, candidates);
  return candidates.filter(isFocusableElement);
}
export function tabbable(container: Element) {
  const candidates = focusable(container);
  return candidates.filter((element) => getTabIndex(element) >= 0 && isTabbableRadio(element, candidates));
}
function getTabbableIn(container: HTMLElement, dir: 1 | -1): FocusableElement | undefined {
  const list = tabbable(container);
  if (!list.length) return undefined;
  const active = activeElement(ownerDocument(container)) as FocusableElement;
  const index = list.indexOf(active);
  const nextIndex = index === -1 ? (dir === 1 ? 0 : list.length - 1) : index + dir;
  return list[nextIndex];
}
export function getNextTabbable(referenceElement: Element | null): FocusableElement | null {
  return getTabbableIn(ownerDocument(referenceElement).body, 1) || referenceElement as FocusableElement;
}
export function getPreviousTabbable(referenceElement: Element | null): FocusableElement | null {
  return getTabbableIn(ownerDocument(referenceElement).body, -1) || referenceElement as FocusableElement;
}
export function getTabbableNearElement(referenceElement: Element | null, direction: 1 | -1, exclude?: Element | null): FocusableElement | null {
  if (!referenceElement) return null;
  // Disabled anchors retain composed-tree position, but never suppress eligible radios.
  const list: FocusableElement[] = [];
  appendCandidates(ownerDocument(referenceElement).body, list);
  const index = list.indexOf(referenceElement as FocusableElement);
  if (index === -1) return null;
  const candidates = list.filter(isFocusableElement);
  for (let offset = 1; offset < list.length; offset += 1) {
    const element = list[(index + direction * offset + list.length) % list.length];
    if (!contains(exclude, element) && isTabbable(element) && isTabbableRadio(element, candidates)) return element;
  }
  return list[index];
}
export function isOutsideEvent(event: FocusEvent, container?: Element) {
  const containerElement = container || event.currentTarget as Element;
  const relatedTarget = event.relatedTarget as HTMLElement | null;
  return !relatedTarget || !contains(containerElement, relatedTarget);
}

// Preserve exact attributes and retain a lock per disabling container. In particular,
// a second layer must not lose its lock just because the first has set tabindex=-1.
interface FocusLock { count: number; tabindex: string | null; dataTabindex: string | null }
const focusLocks = new WeakMap<FocusableElement, FocusLock>();
const containerLocks = new WeakMap<HTMLElement, FocusableElement[][]>();
export function disableFocusInside(container: HTMLElement) {
  const candidates: FocusableElement[] = [];
  appendCandidates(container, candidates);
  const enabled = new Set(tabbable(container));
  const elements = candidates.filter((element) => enabled.has(element) || focusLocks.has(element));
  for (const element of elements) {
    const lock = focusLocks.get(element);
    if (lock) { lock.count += 1; continue; }
    const tabindex = element.getAttribute('tabindex');
    focusLocks.set(element, { count: 1, tabindex, dataTabindex: element.getAttribute('data-tabindex') });
    element.setAttribute('data-tabindex', tabindex || '');
    element.setAttribute('tabindex', '-1');
  }
  const locks = containerLocks.get(container) || [];
  locks.push(elements);
  containerLocks.set(container, locks);
}
export function enableFocusInside(container: HTMLElement) {
  const locks = containerLocks.get(container);
  const elements = locks?.pop();
  if (!locks?.length) containerLocks.delete(container);
  if (elements) {
    for (const element of elements) {
      const lock = focusLocks.get(element);
      if (!lock || --lock.count !== 0) continue;
      if (lock.tabindex === null) element.removeAttribute('tabindex');
      else element.setAttribute('tabindex', lock.tabindex);
      if (lock.dataTabindex === null) element.removeAttribute('data-tabindex');
      else element.setAttribute('data-tabindex', lock.dataTabindex);
      focusLocks.delete(element);
    }
    return;
  }
  // Retain support for source-compatible saved tabindex markup from another owner.
  const saved: FocusableElement[] = [];
  appendMatchingElements(container, '[data-tabindex]', saved);
  for (const element of saved) {
    if (focusLocks.has(element)) continue;
    const tabindex = element.getAttribute('data-tabindex');
    element.removeAttribute('data-tabindex');
    if (tabindex) element.setAttribute('tabindex', tabindex);
    else element.removeAttribute('tabindex');
  }
}
