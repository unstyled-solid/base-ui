import type { Cleanup, Live, TransitionStatus } from './core';
import type { ChangeEventDetails, FloatingUIOpenChangeDetails } from './events';

/** Read-only lookup breaks the DOM/floating -> popup implementation cycle. */
export interface TriggerLookup {
  readonly size: number;
  getById(id: string): Element | undefined;
  hasElement(element: Element): boolean;
  hasMatchingElement(predicate: (element: Element) => boolean): boolean;
  entries(): IterableIterator<[string, Element]>;
  elements(): IterableIterator<Element>;
}
export interface PopupTriggerMap extends TriggerLookup {
  add(id: string, element: Element): void;
  delete(id: string): void;
}
/** Structural @floating-ui/dom virtual element, no geometry runtime dependency. */
export type ClientRectObject = Pick<DOMRect, 'x' | 'y' | 'width' | 'height' | 'top' | 'right' | 'bottom' | 'left'>;
export interface VirtualElement {
  getBoundingClientRect(): ClientRectObject;
  getClientRects?: (() => DOMRectList | ClientRectObject[]) | undefined;
  contextElement?: Element | undefined;
}
export type ReferenceType = Element | VirtualElement;
export interface FloatingRootState {
  readonly open: boolean;
  readonly transitionStatus: TransitionStatus;
  readonly domReferenceElement: Element | null;
  readonly referenceElement: ReferenceType | null;
  readonly positionReference: ReferenceType | null;
  readonly floatingElement: HTMLElement | null;
  readonly floatingId: string | undefined;
}
/** Extensible typed emitter; each owner specifies its event map, no global bus. */
export interface FloatingEvents<Events extends object = { openchange: FloatingUIOpenChangeDetails }> {
  emit<K extends keyof Events & string>(event: K, data: Events[K]): void;
  on<K extends keyof Events & string>(event: K, handler: (data: Events[K]) => void): void;
  off<K extends keyof Events & string>(event: K, handler: (data: Events[K]) => void): void;
}
export interface FloatingRootContext<Details extends ChangeEventDetails = ChangeEventDetails> {
  readonly state: Live<FloatingRootState>;
  readonly nested: boolean;
  readonly triggerElements: TriggerLookup;
  readonly events: FloatingEvents;
  /** Plain imperative metadata; retain native event identity. */
  readonly data: { openEvent?: Event | undefined; orientation?: 'horizontal' | 'vertical' | 'both' | undefined; floatingContext?: FloatingGeometryContext | undefined };
  /** Request path checks cancellation before dispatch; sync-only bridges delegate to popup. */
  setOpen(nextOpen: boolean, details: Details): void;
  /** Accepted transaction path, called once with explicit nextOpen. */
  dispatchOpenChange(nextOpen: boolean, details: Details): void;
  /** Optional owned position-reference publication for cursor interactions. */
  setPositionReference?(reference: ReferenceType | null): void;
}
export interface FloatingGeometryContext {
  readonly placement: import('@floating-ui/dom').Placement;
  readonly elements: { readonly domReference: Element | null; readonly floating: HTMLElement | null };
  readonly nodeId?: string | undefined;
}
export interface FloatingNodeType<Context = FloatingRootContext> {
  readonly id: string | undefined;
  readonly parentId: string | null;
  context?: Context | undefined;
}
export interface FloatingTreeEventMap { openchange: FloatingUIOpenChangeDetails; 'floating.closed': MouseEvent }
export interface FloatingTreeType<Context = FloatingRootContext, Events extends object = FloatingTreeEventMap> {
  /** Immediate read-through nodes; do not deep-proxy node context or DOM elements. */
  readonly nodes: readonly FloatingNodeType<Context>[];
  readonly events: FloatingEvents<Events>;
  addNode(node: FloatingNodeType<Context>): void;
  removeNode(node: FloatingNodeType<Context>): void;
  /** Native registration notification; lets setup-owned publishers follow late/replaced nodes. */
  subscribeNodes?(listener: () => void): Cleanup;
}
/** Portal event participation is logical ancestry, distinct from DOM containment. */
export interface LogicalLayer {
  markEvent(event: Event): void;
  containsEvent(event: Event): boolean;
  registerBranch(element: Element): Cleanup;
}
