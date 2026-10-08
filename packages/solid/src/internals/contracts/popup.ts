import type { Cleanup, ElementAccessor, Live, TransitionStatus } from './core';
import type { ChangeEventDetails } from './events';
import type { FloatingRootContext, PopupTriggerMap, TriggerLookup } from './floating';
import type { HTMLProps } from './render';

export interface PopupState<Payload> {
  readonly open: boolean;
  readonly openProp: boolean | undefined;
  readonly mounted: boolean;
  readonly transitionStatus: TransitionStatus;
  readonly floatingRootContext: FloatingRootContext;
  readonly floatingId: string | undefined;
  readonly triggerCount: number;
  readonly preventUnmountingOnClose: boolean;
  readonly payload: Payload | undefined;
  readonly activeTriggerId: string | null;
  readonly activeTriggerElement: Element | null;
  readonly openedWithoutTrigger: boolean;
  readonly triggerIdProp: string | null | undefined;
  readonly popupElement: HTMLElement | null;
  readonly positionerElement: HTMLElement | null;
  readonly activeTriggerProps: HTMLProps;
  readonly inactiveTriggerProps: HTMLProps;
  readonly popupProps: HTMLProps;
  readonly adaptiveOrigin?: import('@floating-ui/dom').Middleware | undefined;
}
/** Source-compatible type name; it is a live view, not a ReactStore. */
export type PopupStoreState<Payload> = PopupState<Payload>;
export interface PopupStoreContext<Details> {
  readonly triggerElements: PopupTriggerMap;
  readonly popupRef: ElementAccessor;
  readonly onOpenChange?: ((nextOpen: boolean, details: Details) => void) | undefined;
  readonly onOpenChangeComplete: ((open: boolean) => void) | undefined;
  readonly beforeTriggerFocusGuardRef?: { current: HTMLElement | null } | undefined;
  readonly beforeContentFocusGuardRef?: { current: HTMLElement | null } | undefined;
  readonly triggerFocusTargetRef?: { current: HTMLElement | null } | undefined;
}
export interface PopupTriggerMetadata<Payload = unknown> {
  payload?: Payload | undefined; disabled?: boolean | undefined; openOnHover?: boolean | undefined; closeDelay?: number | undefined; closeOnClick?: boolean | undefined;
}
export interface PopupTriggerDataStore<Payload = unknown> {
  readonly state: Live<PopupState<Payload>>;
  readonly context: { readonly triggerElements: TriggerLookup };
  /** Own the model/id/element triple; stale cleanup cannot remove its replacement. */
  registerTrigger(id: string, element: Element, payload?: Payload, metadata?: PopupTriggerMetadata<Payload>): Cleanup;
}
export interface PopupHandleStoreWithTriggers {
  readonly context: { readonly triggerElements: TriggerLookup };
}
export interface PopupHandleStoreWithOpen<Details extends ChangeEventDetails = ChangeEventDetails>
  extends PopupHandleStoreWithTriggers {
  setOpen(nextOpen: boolean, details: Details): void;
}
export interface PopupHandleStoreProvider<HandleStore> {
  /** Reactive getter to active root, or stable inert fallback while detached. */
  readonly store: HandleStore;
  /** Stable fallback for SSR/first hydration; never attach a root during SSR. */
  readonly serverStore: HandleStore;
}
export interface PopupHandleAttachment<HandleStore, RootStore extends HandleStore = HandleStore>
  extends PopupHandleStoreProvider<HandleStore> {
  /** Setup-owned committed lifetime. Last attached living root wins. */
  attachStore(store: RootStore): Cleanup;
}
export interface PopupChangeEventDetails extends ChangeEventDetails {
  preventUnmountOnClose(): void;
}
