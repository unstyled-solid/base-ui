import { createSignal } from 'solid-js';
import { isElement } from '@floating-ui/utils/dom';
import { createFloatingRoot } from '../components/createFloatingRoot';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createFloatingParentNodeId } from '../components/FloatingTree';
import type { ReferenceType } from '../../internals/contracts/floating';
import type { ChangeEventDetails } from '../../internals/contracts/events';
export interface UseFloatingRootContextOptions {
  open?: boolean | undefined;
  elements?: { reference?: ReferenceType | null | undefined; floating?: HTMLElement | null | undefined } | undefined;
  onOpenChange?(open: boolean, details: ChangeEventDetails): void;
}
export function createFloatingRootContext(options: UseFloatingRootContextOptions = {}) {
  const id = createBaseUiId(), parent = createFloatingParentNodeId();
  const [reference, setReference] = createSignal<ReferenceType | null>(null), [floating, setFloating] = createSignal<HTMLElement | null>(null);
  const currentReference = () => options.elements?.reference === undefined ? reference() : options.elements.reference;
  const root = createFloatingRoot({
    state: { get open() { return options.open ?? false; }, transitionStatus: undefined,
      get domReferenceElement() { const element = currentReference(); return isElement(element) ? element : null; },
      get referenceElement() { return currentReference(); }, positionReference: null,
      get floatingElement() { return options.elements?.floating === undefined ? floating() : options.elements.floating; }, get floatingId() { return id(); } },
    get nested() { return parent() !== null; }, onOpenChange: (next, details) => options.onOpenChange?.(next, details),
  });
  return Object.assign(root, { setReference(value: ReferenceType | null) { setReference(() => value); }, setFloating(value: HTMLElement | null) { setFloating(value); } });
}
export { createFloatingRootContext as useFloatingRootContext };
