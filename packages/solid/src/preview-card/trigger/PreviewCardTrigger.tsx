import { merge, omit, untrack } from 'solid-js';
import type { ComponentProps } from '@solidjs/web';
import { createBaseUiId } from '../../internals/createBaseUiId';
import { createRenderElement } from '../../internals/createRenderElement';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createFocus } from '../../floating-ui-react/hooks/createFocus';
import { createHoverReferenceInteraction } from '../../floating-ui-react/hooks/createHoverReferenceInteraction';
import { safePolygon } from '../../floating-ui-react/safePolygon';
import { createTriggerDataForwarding } from '../../utils/popups/createTriggerDataForwarding';
import { getInlineRectTriggerProps } from '../../utils/popups/inlineRect';
import { triggerOpenStateMapping } from '../../utils/popupStateMapping';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';
import type { PreviewCardHandle } from '../store/PreviewCardHandle';
import type { PreviewCardHandleStore } from '../store/PreviewCardStore';
import { CLOSE_DELAY, OPEN_DELAY } from '../utils/constants';

/** A link which opens a preview on pointer rest or keyboard focus. */
export function PreviewCardTrigger<Payload = unknown>(props: PreviewCardTrigger.Props<Payload>) {
  const root = usePreviewCardRootContext(true);
  const store = (): PreviewCardHandleStore<Payload> => {
    const result = props.handle?.store ?? root;
    if (!result) throw new Error('Base UI: <PreviewCard.Trigger> must be either used within a <PreviewCard.Root> component or provided with a handle.');
    return result as PreviewCardHandleStore<Payload>;
  };
  // Fail before allocating hover/focus resources whose cleanup needs a store.
  untrack(store);
  const id = createBaseUiId(() => typeof props.id === 'string' ? props.id : undefined);
  const forwarding = createTriggerDataForwarding({
    store,
    id,
    get payload() { return props.payload; },
    get closeDelay() { return props.closeDelay ?? CLOSE_DELAY; },
  });
  const context = () => store().state.floatingRootContext;
  const hover = createHoverReferenceInteraction(context, {
    mouseOnly: true,
    move: false,
    handleClose: safePolygon(),
    delay: () => ({ open: props.delay ?? OPEN_DELAY, close: props.closeDelay ?? CLOSE_DELAY }),
    triggerElement: forwarding.element,
    isActiveTrigger: () => store().state.activeTriggerId === id(),
    isClosing: () => store().state.transitionStatus === 'ending',
  });
  const focus = createFocus(context, { get delay() { return props.delay ?? OPEN_DELAY; } });
  const state: PreviewCardTriggerState = {
    get open() { return store().state.open && store().state.activeTriggerId === id(); },
  };
  const inlineProps = getInlineRectTriggerProps(() => store().inlineRectCoordsRef, () => state.open);
  const elementProps = omit(props, 'render', 'class', 'style', 'ref', 'delay', 'closeDelay', 'id', 'payload', 'handle');
  const rootTriggerProps = merge(() => {
    const model = store();
    return model.state.mounted && model.state.activeTriggerId === id()
      ? model.state.activeTriggerProps : model.state.inactiveTriggerProps;
  });
  return createRenderElement('a', props, {
    state,
    get ref() { return [props.ref, forwarding.registerTrigger]; },
    props: [hover, focus.reference, rootTriggerProps, inlineProps, { get id() { return id(); } }, elementProps],
    stateAttributesMapping: triggerOpenStateMapping,
  });
}

export interface PreviewCardTriggerState { open: boolean }
export interface PreviewCardTriggerProps<Payload = unknown> extends BaseUIComponentProps<'a', PreviewCardTriggerState, ComponentProps<'a'>> {
  handle?: PreviewCardHandle<Payload>;
  payload?: Payload;
  /** Pointer rest / focus delay, in milliseconds. @default 600 */
  delay?: number;
  /** Close delay, in milliseconds. @default 300 */
  closeDelay?: number;
}
export namespace PreviewCardTrigger {
  export type State = PreviewCardTriggerState;
  export type Props<Payload = unknown> = PreviewCardTriggerProps<Payload>;
}
