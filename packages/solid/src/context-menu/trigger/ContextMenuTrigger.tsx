import { createEffect, createSignal, omit, onCleanup } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import { createRenderElement } from '../../internals/createRenderElement';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { REASONS } from '../../internals/reasons';
import { createTimeout } from '../../utils/createTimeout';
import { ownerDocument, ownerWindow } from '../../utils/owner';
import { contains, getTarget } from '../../utils/shadowDom';
import { stopEvent } from '../../floating-ui-react/utils/event';
import { useContextMenuRootContext } from '../root/ContextMenuRootContext';
import { useMenuRootContext } from '../../menu/root/MenuRootContext';
import { findRootOwnerId } from '../../menu/utils/findRootOwnerId';
import * as attributes from './ContextMenuTriggerDataAttributes';

const LONG_PRESS_DELAY = 500;
const stateAttributesMapping = {
  open: (open: boolean) => open ? { [attributes.popupOpen]: '', [attributes.pressed]: '' } : null,
};

/** An area that opens the menu on right click or long press. Renders a div. */
export function ContextMenuTrigger(componentProps: ContextMenuTriggerProps) {
  const host = useContextMenuRootContext(false);
  const { store } = useMenuRootContext(false);
  const [trigger, setTrigger] = createSignal<HTMLDivElement | null>(null);
  // Ref writes are staged in RC13. A native gesture can arrive from the
  // forwarded ref before the signal commits, so keep the raw host for realms.
  let triggerElement: HTMLDivElement | null = null;
  function attachTrigger(element: HTMLDivElement | null) {
    triggerElement = element;
    setTrigger(element);
  }
  let touchPosition: { x: number; y: number } | null = null;
  let allowMouseUp = false;
  let mouseUpController: AbortController | undefined;
  const longPressTimeout = createTimeout();
  const allowMouseUpTimeout = createTimeout();

  function handleLongPress(x: number, y: number, event: MouseEvent | TouchEvent) {
    const size = event.type.startsWith('touch') ? 10 : 0;
    const win = ownerWindow(triggerElement);
    host.initialCursorPointRef.current = { x, y };
    host.setAnchor({
      getBoundingClientRect: () => win.DOMRect.fromRect({ x, y, width: size, height: size }),
    });
    allowMouseUp = false;
    host.actionsRef.current?.setOpen(true, createChangeEventDetails(REASONS.triggerPress, event));
    allowMouseUpTimeout.start(LONG_PRESS_DELAY, () => { allowMouseUp = true; });
  }

  function handleContextMenu(event: MouseEvent) {
    if (store.state.disabled) return;
    host.allowMouseUpTriggerRef.current = true;
    stopEvent(event);
    handleLongPress(event.clientX, event.clientY, event);
    const doc = ownerDocument(triggerElement);
    mouseUpController?.abort();
    mouseUpController = new (ownerWindow(triggerElement).AbortController)();
    doc.addEventListener('mouseup', (mouseEvent) => {
      host.allowMouseUpTriggerRef.current = false;
      if (!allowMouseUp) return;
      allowMouseUpTimeout.clear();
      allowMouseUp = false;
      const target = getTarget(mouseEvent) as Element | null;
      if (contains(host.positionerRef.current, target)) return;
      if (host.rootId && target && findRootOwnerId(target) === host.rootId) return;
      host.actionsRef.current?.setOpen(false, createChangeEventDetails(REASONS.cancelOpen, mouseEvent));
    }, { once: true, signal: mouseUpController.signal });
  }

  function cancelLongPress() {
    longPressTimeout.clear();
    touchPosition = null;
  }

  function handleTouchStart(event: TouchEvent) {
    if (store.state.disabled) { cancelLongPress(); return; }
    host.allowMouseUpTriggerRef.current = false;
    if (event.touches.length !== 1) { cancelLongPress(); return; }
    event.stopPropagation();
    const touch = event.touches[0];
    const point = { x: touch.clientX, y: touch.clientY };
    touchPosition = point;
    longPressTimeout.start(LONG_PRESS_DELAY, () => handleLongPress(point.x, point.y, event));
  }

  function handleTouchMove(event: TouchEvent) {
    if (event.touches.length !== 1) { cancelLongPress(); return; }
    if (longPressTimeout.isStarted() && touchPosition) {
      const touch = event.touches[0];
      if (Math.abs(touch.clientX - touchPosition.x) > 10 || Math.abs(touch.clientY - touchPosition.y) > 10) {
        cancelLongPress();
      }
    }
  }

  onCleanup(() => mouseUpController?.abort());
  createEffect(() => trigger(), (element) => {
    if (!element) return;
    const doc = ownerDocument(element);
    function preventNativeMenu(event: MouseEvent) {
      if (store.state.disabled) return;
      const target = getTarget(event) as Element | null;
      if (contains(element, target) || contains(host.internalBackdropRef.current, target) ||
          contains(host.backdropRef.current, target)) event.preventDefault();
    }
    doc.addEventListener('contextmenu', preventNativeMenu);
    return () => doc.removeEventListener('contextmenu', preventNativeMenu);
  });

  const elementProps = omit(componentProps, 'render', 'class', 'style', 'ref');
  return createRenderElement('div', componentProps, {
    state: { get open() { return store.state.open; } },
    get ref() { return [attachTrigger, componentProps.ref]; },
    props: [{
      onContextMenu: handleContextMenu,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: cancelLongPress,
      onTouchCancel: cancelLongPress,
      style: { '-webkit-touch-callout': 'none' },
    }, elementProps],
    stateAttributesMapping,
  });
}

export interface ContextMenuTriggerState { open: boolean }
export interface ContextMenuTriggerProps extends BaseUIComponentProps<'div', ContextMenuTriggerState> {}
export namespace ContextMenuTrigger {
  export type State = ContextMenuTriggerState;
  export type Props = ContextMenuTriggerProps;
}
