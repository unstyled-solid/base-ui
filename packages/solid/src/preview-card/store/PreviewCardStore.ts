import { createSignal, untrack } from 'solid-js';
import { createPopup, type PopupModel, type PopupOptions } from '../../utils/popups/createPopup';
import { createNullPopupStore } from '../../utils/popups/createNullPopupStore';
import { updateInlineRectCoords, type InlineRectCoords } from '../../utils/popups/inlineRect';
import type { MutableCell } from '../../internals/contracts/core';
import type { PreviewCardRoot } from '../root/PreviewCardRoot';
import { CLOSE_DELAY } from '../utils/constants';

export interface PreviewCardStore<Payload> extends PopupModel<Payload> {
  readonly inlineRectCoordsRef: MutableCell<InlineRectCoords | undefined>;
  readonly instantType: 'dismiss' | 'focus' | undefined;
  readonly closeDelay: number;
}

export type PreviewCardHandleStore<Payload> = Pick<PreviewCardStore<Payload>,
  'state' | 'context' | 'registerTrigger' | 'inlineRectCoordsRef'>;

/** PreviewCard policy only; transactions, trigger lifetime and presence belong to createPopup. */
export function createPreviewCardStore<Payload>(
  props: PreviewCardRoot.Props<Payload>,
  options: Pick<PopupOptions<Payload>, 'parent' | 'nested'>,
): PreviewCardStore<Payload> {
  const inlineRectCoordsRef: MutableCell<InlineRectCoords | undefined> = { current: undefined };
  const [instant, setInstant] = createSignal<'dismiss' | 'focus'>();
  const model = createPopup<Payload>({
    ...options,
    open: () => props.open,
    defaultOpen: untrack(() => props.defaultOpen ?? false),
    triggerId: () => props.triggerId,
    defaultTriggerId: untrack(() => props.defaultTriggerId ?? null),
    closeOnActiveTriggerUnmount: true,
    onOpenChange: () => (nextOpen, details) => {
      // The popup foundation attaches preventUnmountOnClose before this callback.
      props.onOpenChange?.(nextOpen, details as PreviewCardRoot.ChangeEventDetails);
    },
    onAcceptedChange(nextOpen, details) {
      if (nextOpen && details.reason === 'trigger-focus') setInstant('focus');
      else if (!nextOpen && (details.reason === 'trigger-press' || details.reason === 'escape-key')) setInstant('dismiss');
      else if (details.reason === 'trigger-hover') setInstant(undefined);

      const event = details.event;
      if (nextOpen && details.reason === 'trigger-hover' && details.trigger &&
          'clientX' in event && 'clientY' in event &&
          inlineRectCoordsRef.current?.element !== details.trigger) {
        updateInlineRectCoords(inlineRectCoordsRef, details.trigger, Number(event.clientX), Number(event.clientY));
      }
    },
    onOpenChangeComplete: () => (open) => {
      if (!open) inlineRectCoordsRef.current = undefined;
      props.onOpenChangeComplete?.(open);
    },
  });

  return Object.defineProperties(model, {
    inlineRectCoordsRef: { value: inlineRectCoordsRef },
    instantType: { get: () => instant() },
    closeDelay: { get: () => model.getTriggerData(model.state.activeTriggerId)?.closeDelay ?? CLOSE_DELAY },
  }) as PreviewCardStore<Payload>;
}

export function createNullPreviewCardStore<Payload>(): PreviewCardHandleStore<Payload> {
  return Object.assign(createNullPopupStore<Payload>(), {
    inlineRectCoordsRef: { current: undefined } as MutableCell<InlineRectCoords | undefined>,
  });
}
