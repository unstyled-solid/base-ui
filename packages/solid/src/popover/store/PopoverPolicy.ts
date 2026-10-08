import { createEffect, createMemo, createSignal } from 'solid-js';
import { createTimeout } from '../../utils/createTimeout';
import type { PopupChangeEventDetails } from '../../internals/contracts/popup';
import { PATIENT_CLICK_THRESHOLD } from '../../internals/constants';

export type PopoverInstant = 'dismiss' | 'click' | 'focus' | 'trigger-change' | undefined;
export type PopoverInteraction = import('../../utils/createOpenInteractionType').InteractionType;

/** Popover policy only. Open transactions, retention and completion belong to createPopup. */
export function createPopoverPolicy(options: {
  open(): boolean;
  getCurrentTrigger(): Element | null;
  onOpenChange(open: boolean, details: PopupChangeEventDetails): void;
}) {
  const [reason, setReason] = createSignal<string | null>(null);
  const [instant, setInstant] = createSignal<PopoverInstant>(undefined);
  const [methodRequest, setMethodRequest] = createSignal<{ value: PopoverInteraction | null }>();
  // useOpenInteractionType resets on an effective true -> false edge. Carry
  // that history in the derivation, so close readers never see the old method
  // and a later imperative reopen cannot resurrect it. A request made while
  // closed still records the interaction that is about to open the popup.
  const method = createMemo((previous: { open: boolean; request: ReturnType<typeof methodRequest>; value: PopoverInteraction | null } | undefined) => {
    const open = options.open(), request = methodRequest();
    const value = previous?.open && !open ? null
      : request !== previous?.request ? request?.value ?? null : previous?.value ?? null;
    return previous && previous.open === open && previous.request === request && previous.value === value
      ? previous : { open, request, value };
  });
  const [stick, setStick] = createSignal(true);
  const patientClick = createTimeout();

  createEffect(options.open, (open) => {
    if (!open) patientClick.clear();
  });

  return {
    get openChangeReason() { return reason(); },
    get openMethod() { return method().value; },
    get stickIfOpen() { return stick(); },
    get instantType() { return instant() === 'trigger-change' && !options.open() ? undefined : instant(); },
    setOpenMethod(value: PopoverInteraction | null) { setMethodRequest({ value }); },
    setInstantType: setInstant,
    complete(open: boolean) {
      if (!open) {
        patientClick.clear();
        setStick(true);
        setReason(null);
      }
    },
    beforeChange(open: boolean, details: PopupChangeEventDetails & { trigger?: Element }) {
      if (!open && details.reason === 'close-press' && details.trigger == null) {
        // Enrich before the callback, using the accepted transaction rather than staged getters.
        details.trigger = options.getCurrentTrigger() ?? undefined;
      }
      options.onOpenChange(open, details);
    },
    /** Called by the shared transaction only after callback/cancellation and accepted dispatch. */
    acceptedChange(open: boolean, details: PopupChangeEventDetails) {
      if (details.isCanceled) return;

      setReason(details.reason);
      if (details.reason === 'trigger-hover') {
        setStick(true);
        patientClick.start(PATIENT_CLICK_THRESHOLD, () => setStick(false));
      }
      setInstant(details.reason === 'trigger-press' && 'detail' in details.event && details.event.detail === 0
        ? 'click'
        : !open && (details.reason === 'escape-key' || details.reason == null) ? 'dismiss'
        : details.reason === 'focus-out' ? 'focus' : undefined);
    },
  };
}
