import { createSignal, untrack, type Setter } from 'solid-js';
import { createControlled } from '../../utils/createControlled';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createTransitionStatus, type TransitionStatus } from '../../internals/createTransitionStatus';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { CollapsibleRootChangeEventDetails } from './CollapsibleRoot';

/** Source-compatible disclosure seam. All public state fields are live getters. */
export function createCollapsibleRoot(parameters: UseCollapsibleRootParameters): UseCollapsibleRootReturnValue {
  const value = createControlled<boolean, CollapsibleRootChangeEventDetails>({
    value: () => parameters.open,
    defaultValue: untrack(() => parameters.defaultOpen ?? false),
    name: 'Collapsible', state: 'open',
  });
  const presence = createTransitionStatus(value.value, () => true, () => true);
  const defaultId = createBaseUiId();
  const [registeredId, setPanelIdState] = createSignal<string | null | undefined>(undefined);
  let panelRegistration: object | undefined;
  const setOpen = (next: boolean) => { value.request(next, createChangeEventDetails('none')); };
  return {
    get defaultPanelId() { return defaultId(); },
    get panelId() { return registeredId() === null ? undefined : registeredId() ?? defaultId(); },
    get disabled() { return parameters.disabled ?? false; },
    get open() { return value.value(); },
    get mounted() { return presence.mounted; },
    get transitionStatus() { return presence.transitionStatus; },
    setMounted: presence.setMounted,
    setPanelIdState,
    registerPanelId(id) {
      const registration = {};
      panelRegistration = registration;
      setPanelIdState(id);
      return () => {
        if (panelRegistration !== registration) return;
        panelRegistration = undefined;
        setPanelIdState(null);
      };
    },
    setOpen,
    handleTrigger(event) {
      const next = !untrack(value.value);
      const details = createChangeEventDetails('trigger-press', event);
      untrack(() => parameters.onOpenChange?.(next, details));
      if (!details.isCanceled) setOpen(next);
    },
  };
}
export interface UseCollapsibleRootParameters {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean, details: CollapsibleRootChangeEventDetails) => void;
}
export interface UseCollapsibleRootReturnValue {
  readonly defaultPanelId: string | undefined;
  readonly panelId: string | undefined;
  readonly disabled: boolean;
  readonly open: boolean;
  readonly mounted: boolean;
  readonly transitionStatus: TransitionStatus;
  handleTrigger(event: MouseEvent | KeyboardEvent): void;
  setOpen(open: boolean): void;
  setMounted(mounted: boolean): void;
  setPanelIdState: Setter<string | null | undefined>;
  /** Optional for source-compatible adapters; stale disposal cannot clear a replacement. */
  registerPanelId?(id: string | undefined): () => void;
}
export interface UseCollapsibleRootState {}
export { createCollapsibleRoot as useCollapsibleRoot };
