import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { InteractionProps } from './createDismiss';
import { createEffect, type Accessor } from 'solid-js';
import { createAnimationFrame } from '../../utils/createAnimationFrame';
import { createTimeout } from '../../utils/createTimeout';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { isMouseLikePointerType, isVirtualPointerEvent } from '../utils/event';
import { getTarget, isTypeableElement } from '../utils/element';
export interface ClickOptions { enabled?: boolean | undefined; event?: 'click' | 'mousedown' | 'mousedown-only' | undefined; toggle?: boolean | undefined; ignoreMouse?: boolean | undefined; keyboardHandlers?: boolean | undefined; stickIfOpen?: boolean | undefined; touchOpenDelay?: number | undefined; reason?: 'trigger-press' | 'input-press' | undefined }
export function createClick(input: FloatingRootContext | Accessor<FloatingRootContext>, options: ClickOptions = {}): InteractionProps {
  const context = () => typeof input === 'function' ? input() : input;
  const frame = createAnimationFrame(), timeout = createTimeout();
  let pointer: string | undefined;
  createEffect(() => ({ root: context(), enabled: options.enabled ?? true }), () => () => { frame.cancel(); timeout.clear(); });
  const nextOpen = (target: EventTarget | null, types: string[]) => {
    const root = context();
    if (!root.state.open || root.state.domReferenceElement !== target || options.toggle === false) return true;
    const event = root.data.openEvent;
    return !!(event && options.stickIfOpen !== false && !types.includes(event.type));
  };
  const open = (next: boolean, event: MouseEvent, target: Element, type: string | undefined) => {
    const root = context();
    const details = createChangeEventDetails(options.reason ?? 'trigger-press', event, target);
    if (next && type === 'touch' && (options.touchOpenDelay ?? 0) > 0) timeout.start(options.touchOpenDelay!, () => { if (options.enabled !== false && context() === root) root.setOpen(true, details); });
    else root.setOpen(next, details);
  };
  const reference: NonNullable<InteractionProps['reference']> = {
    onPointerDown(event) { if (options.enabled === false) return; pointer = isMouseLikePointerType(event.pointerType, true) && isVirtualPointerEvent(event) ? 'virtual' : event.pointerType; },
    onMouseDown(event) {
      if (options.enabled === false || event.button !== 0 || (options.event ?? 'click') === 'click' || (options.ignoreMouse && isMouseLikePointerType(pointer, true))) return;
      const next = nextOpen(event.currentTarget, ['click', 'mousedown']), target = getTarget(event);
      const current = event.currentTarget;
      if (isTypeableElement(target) || pointer === 'virtual') open(next, event, isTypeableElement(target) ? target as Element : current, pointer);
      else { const type = pointer; frame.request(() => { if (options.enabled !== false) open(next, event, current, type); }); }
    },
    onClick(event) {
      if (options.enabled === false || options.event === 'mousedown-only') return;
      const type = pointer;
      if (options.event === 'mousedown' && type) { pointer = undefined; return; }
      if (options.ignoreMouse && isMouseLikePointerType(type, true)) return;
      open(nextOpen(event.currentTarget, ['click', 'mousedown', 'keydown', 'keyup']), event, event.currentTarget, type);
    },
    onKeyDown() { pointer = undefined; },
  };
  return { get reference() { return options.enabled === false ? undefined : reference; } };
}
