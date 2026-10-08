import type { Accessor } from 'solid-js';
import type { ElementAccessor } from './core';
import type { LogicalLayer } from './floating';

/** undefined defaults; literal null waits; accessor returning null is an unresolved explicit target. */
export type PortalContainer = Element | ShadowRoot | null | undefined |
  Accessor<Element | ShadowRoot | null | undefined>;
export interface PortalFocusState {
  readonly modal: boolean;
  readonly open: boolean;
  readonly domReference: Element | null;
  readonly closeOnFocusOut: boolean;
  onOpenChange(open: boolean, data?: { reason?: string | undefined; event?: Event | undefined }): void;
}
export interface PortalContext {
  /** Always the actual HTMLElement mount, including an owned wrapper inside ShadowRoot. */
  readonly portalNode: ElementAccessor;
  readonly beforeInside: ElementAccessor;
  readonly afterInside: ElementAccessor;
  readonly beforeOutside: ElementAccessor;
  readonly afterOutside: ElementAccessor;
  readonly focusState: PortalFocusState | null;
  /** Register the owned live derivation; cleanup only releases that registration. */
  registerFocusManagerState(state: Accessor<PortalFocusState | null>): () => void;
  setBeforeInside?(element: HTMLElement | null): void;
  setAfterInside?(element: HTMLElement | null): void;
  readonly layer: LogicalLayer;
}
