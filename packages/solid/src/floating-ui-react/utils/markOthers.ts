// Modified to add conditional `aria-hidden` support:
// https://github.com/theKashey/aria-hidden/blob/9220c8f4a4fd35f63bee5510a9f41a37264382d4/src/index.ts
import { getNodeName, isShadowRoot } from '@floating-ui/utils/dom';
import { ownerDocument } from '../../utils/owner';
type Undo = () => void;
interface MarkOthersOptions { ariaHidden?: boolean | undefined; mark?: boolean | undefined }
const markerName = 'data-base-ui-inert';
interface AttributeLock { count: number; original: string | null }
const ariaHiddenLocks = new WeakMap<Element, AttributeLock>();
const markerLocks = new WeakMap<Element, AttributeLock>();

function unwrapHost(node: Node | null): Element | null {
  if (!node) return null;
  return isShadowRoot(node) ? node.host : unwrapHost(node.parentNode);
}
const correctElements = (parent: HTMLElement, targets: Element[]): Element[] => targets.map((target) => {
  // Repeat for nested roots, rather than stopping at an inner shadow host.
  let current: Element | null = target;
  while (current && !parent.contains(current)) current = unwrapHost(current);
  return current;
}).filter((element): element is Element => element !== null);
const buildKeepSet = (targets: Element[]): Set<Node> => {
  const keep = new Set<Node>();
  targets.forEach((target) => {
    let node: Node | null = target;
    while (node && !keep.has(node)) { keep.add(node); node = node.parentNode; }
  });
  return keep;
};
const collectOutsideElements = (root: HTMLElement, keep: Set<Node>, stop: Set<Node>): Element[] => {
  const outside: Element[] = [];
  const walk = (parent: Element) => {
    if (stop.has(parent)) return;
    Array.from(parent.children).forEach((node) => {
      if (getNodeName(node) === 'script') return;
      if (keep.has(node)) walk(node);
      else outside.push(node);
    });
  };
  walk(root);
  return outside;
};
function acquire(element: Element, name: string, locks: WeakMap<Element, AttributeLock>) {
  const lock = locks.get(element);
  if (lock) { lock.count += 1; return; }
  const original = element.getAttribute(name);
  locks.set(element, { count: 1, original });
  if (name === markerName) element.setAttribute(name, '');
  else if (original === null || original === 'false') element.setAttribute(name, 'true');
}
function release(element: Element, name: string, locks: WeakMap<Element, AttributeLock>) {
  const lock = locks.get(element);
  if (!lock || --lock.count !== 0) return;
  if (lock.original === null) element.removeAttribute(name);
  else element.setAttribute(name, lock.original);
  locks.delete(element);
}
export function markOthers(avoidElements: Element[], options: MarkOthersOptions = {}): Undo {
  const { ariaHidden = false, mark = true } = options;
  const body = ownerDocument(avoidElements[0]).body;
  const avoid = correctElements(body, avoidElements);
  const marked = mark ? collectOutsideElements(body, buildKeepSet(avoid), new Set(avoid)) : [];
  const controls = avoid.concat(ariaHidden ? correctElements(body, Array.from(body.querySelectorAll('[aria-live]'))) : []);
  const hidden = ariaHidden ? collectOutsideElements(body, buildKeepSet(controls), new Set(controls)) : [];
  hidden.forEach((element) => acquire(element, 'aria-hidden', ariaHiddenLocks));
  marked.forEach((element) => acquire(element, markerName, markerLocks));
  let released = false;
  return () => {
    if (released) return;
    released = true;
    hidden.forEach((element) => release(element, 'aria-hidden', ariaHiddenLocks));
    marked.forEach((element) => release(element, markerName, markerLocks));
  };
}
