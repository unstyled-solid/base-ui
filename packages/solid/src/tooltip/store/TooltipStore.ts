import { createEffect, createSignal, onCleanup, untrack } from 'solid-js';
import { createPopup, type PopupModel } from '../../utils/popups/createPopup';
import { createNullPopupStore } from '../../utils/popups/createNullPopupStore';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { ChangeEventDetails } from '../../internals/contracts/events';
import type { TooltipRootProps, TooltipRootChangeEventDetails } from '../root/TooltipRoot';
import { tooltipInstant, type TooltipInstant } from '../utils/instant';

export interface TooltipTriggerData {
  readonly closeOnClick: boolean;
  readonly closeDelay: number;
  readonly isInstantPhase: boolean;
}
export interface TooltipStore<Payload = unknown> extends PopupModel<Payload> {
  readonly disabled: boolean;
  readonly trackCursorAxis: 'none' | 'x' | 'y' | 'both';
  readonly disableHoverablePopup: boolean;
  readonly instantType: TooltipInstant;
  readonly lastOpenChangeReason: string | null;
  readonly closeOnClick: boolean;
  readonly closeDelay: number;
  registerTooltipData(id: string, data: TooltipTriggerData): () => void;
  setCloseOnClickSource(data: TooltipTriggerData): void;
  cancelPendingOpen(event: MouseEvent | PointerEvent): void;
}

/** Tooltip policy over the single shared popup transaction/registration engine. */
export function createTooltipStore<Payload>(props: TooltipRootProps<Payload>): TooltipStore<Payload> {
  const [reason, setReason] = createSignal<string | null>(null);
  const [instant, setInstant] = createSignal<TooltipInstant>(undefined);
  const model = createPopup<Payload>({
    open: () => props.open,
    defaultOpen: untrack(() => props.defaultOpen),
    triggerId: () => props.triggerId,
    defaultTriggerId: untrack(() => props.defaultTriggerId),
    disabled: () => props.disabled ?? false,
    presenceOpen: open => !(props.disabled ?? false) && open,
    closeOnActiveTriggerUnmount: true,
    onOpenChange: () => (open, details) => {
      props.onOpenChange?.(open, details as TooltipRootChangeEventDetails);
    },
    onAcceptedChange(open, details) {
      setReason(details.reason);
      if (open && details.reason === 'trigger-focus') setInstant('focus');
      else if (!open && (details.reason === 'trigger-press' || details.reason === 'escape-key')) setInstant('dismiss');
      else if (details.reason === 'trigger-hover') setInstant(undefined);
    },
    onOpenChangeComplete: () => props.onOpenChangeComplete,
  });
  createEffect(() => ({ disabled: props.disabled ?? false, open: model.state.open }), value => {
    if (value.disabled && value.open) model.setOpen(false, createChangeEventDetails('disabled'));
  });
  // A triggerless open invalidates the prior trigger's transaction payload.
  // Keep this policy in Tooltip: payload-bearing popup families may intentionally
  // open without a trigger and must retain their programmatic payload instead.
  createEffect(() => ({ open: model.state.open, id: model.state.activeTriggerId, payload: model.state.payload }), value => {
    if (value.open && value.id == null && value.payload !== undefined) model.setPayload(undefined);
  });
  const [revision, setRevision] = createSignal(0);
  return extendTooltipStore(model, props, reason, instant, revision, () => setRevision(value => value + 1), true);
}

function extendTooltipStore<Payload>(
  model: PopupModel<Payload>,
  props: Pick<TooltipRootProps<Payload>, 'disabled' | 'trackCursorAxis' | 'disableHoverablePopup'>,
  reason: () => string | null,
  instant: () => TooltipInstant,
  revision: () => number,
  notify: () => void,
  owned = false,
): TooltipStore<Payload> {
  // Only Tooltip metadata lives here; registration/ownership/payload belong to model.
  const metadata = new Map<string, TooltipTriggerData>();
  let pressSource: { data: TooltipTriggerData; trigger: Element | null } | undefined;
  let retained: { id: string; data: TooltipTriggerData } | undefined;
  if (owned) onCleanup(() => { metadata.clear(); retained = undefined; pressSource = undefined; });
  const active = () => {
    revision();
    const id = model.state.activeTriggerId;
    return metadata.get(id ?? '') ?? (retained?.id === id ? retained.data : undefined);
  };
  const extension = {
    get disabled() { return props.disabled ?? false; },
    get trackCursorAxis() { return props.trackCursorAxis ?? 'none'; },
    get disableHoverablePopup() { return props.disableHoverablePopup ?? false; },
    get instantType() {
      return tooltipInstant(model.state.transitionStatus, active()?.isInstantPhase ?? false, reason(), instant());
    },
    get lastOpenChangeReason() { return reason(); },
    get closeOnClick() {
      // Pointerdown chooses the clicked trigger before the lazy reference-press
      // check runs. Carry that proposal immediately across RC13's staged writes.
      const trigger = model.getCurrentTrigger?.() ?? model.state.activeTriggerElement;
      if (pressSource && pressSource.trigger === trigger) return pressSource.data.closeOnClick;
      // An accepted imperative handoff is visible before RC13 commits the
      // selector. Resolve its registered metadata by raw node identity.
      if (trigger) {
        const entry = [...model.context.triggerElements.entries()].find(([, element]) => element === trigger);
        if (entry) return metadata.get(entry[0])?.closeOnClick ?? true;
      }
      return active()?.closeOnClick ?? true;
    },
    get closeDelay() { return active()?.closeDelay ?? 0; },
    registerTooltipData(id: string, data: TooltipTriggerData) {
      metadata.set(id, data);
      notify();
      return () => untrack(() => {
        if (metadata.get(id) === data) {
          if (model.state.activeTriggerId === id) {
            retained = { id, data: { closeOnClick: data.closeOnClick, closeDelay: data.closeDelay, isInstantPhase: data.isInstantPhase } };
          }
          metadata.delete(id);
          if (pressSource?.data === data) pressSource = undefined;
          notify();
        }
      });
    },
    setCloseOnClickSource(data: TooltipTriggerData) {
      pressSource = { data, trigger: model.getCurrentTrigger?.() ?? model.state.activeTriggerElement };
    },
    cancelPendingOpen(event: MouseEvent | PointerEvent) {
      model.state.floatingRootContext.dispatchOpenChange(false, createChangeEventDetails('trigger-press', event));
    },
  };
  return new Proxy(model as TooltipStore<Payload>, {
    get(target, key) {
      return key in extension ? Reflect.get(extension, key, extension) : Reflect.get(target, key, target);
    },
  });
}

export function createNullTooltipStore<Payload>(): TooltipStore<Payload> {
  return extendTooltipStore(createNullPopupStore<Payload>(), {}, () => null, () => undefined, () => 0, () => {});
}
export type TooltipHandleStore<Payload> = TooltipStore<Payload>;
export type TooltipOpenDetails = ChangeEventDetails;
