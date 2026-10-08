import type { FloatingRootContext } from '../../internals/contracts/floating';
import type { InteractionProps } from './createDismiss';
import { createEffect, createMemo, onCleanup, untrack, type Accessor } from 'solid-js';
import { createTimeout } from '../../utils/createTimeout';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { activeElement, contains, getTarget, isTypeableElement, matchesFocusVisible, isTargetInsideEnabledTrigger } from '../utils/element';
import { platform } from '../../utils/platform';
export interface FocusOptions { enabled?: boolean | undefined; visibleOnly?: boolean | undefined; delay?: number | undefined }
export function createFocus(input: FloatingRootContext | Accessor<FloatingRootContext>, options: FocusOptions = {}): InteractionProps {
  const context = () => typeof input === 'function' ? input() : input;
  const timeout = createTimeout();
  let blocked: Element | null = null;
  let keyboard = true;
  let disposed = false;
  onCleanup(() => { disposed = true; timeout.clear(); });
  // Listener lifetime is the root/window, not the active reference node. A
  // staged reference publication must not cancel an already queued blur.
  const subscription = createMemo(() => ({ root: context(),
    win: context().state.domReferenceElement?.ownerDocument.defaultView ?? (typeof window !== 'undefined' ? window : null),
    enabled: options.enabled ?? true,
  }), { equals: (a, b) => a.root === b.root && a.win === b.win && a.enabled === b.enabled });
  createEffect(subscription, (next) => {
    if (!next.enabled) return;
    const win = next.win;
    if (!win) return;
    const blur = () => { const root = context(); const reference = root.state.domReferenceElement; if (!root.state.open && reference && reference === activeElement(reference.ownerDocument)) blocked = reference; };
    const key = () => { keyboard = true; }, pointer = () => { keyboard = false; };
    const change = (details: import('../../internals/contracts/events').FloatingUIOpenChangeDetails) => untrack(() => {
      if (details.reason === 'trigger-press' || details.reason === 'escape-key') blocked = context().state.domReferenceElement;
    });
    win.addEventListener('blur', blur); win.addEventListener('keydown', key, true); win.addEventListener('pointerdown', pointer, true);
    next.root.events.on('openchange', change);
    return () => { timeout.clear(); win.removeEventListener('blur', blur); win.removeEventListener('keydown', key, true); win.removeEventListener('pointerdown', pointer, true); next.root.events.off('openchange', change); };
  });
  const reference: NonNullable<InteractionProps['reference']> = {
    onMouseLeave() { blocked = null; },
    onFocusIn(event) {
      if (disposed || options.enabled === false) return;
      const current = event.currentTarget;
      if (blocked === current) return;
      blocked = null;
      const target = getTarget(event);
      if (target && options.visibleOnly !== false) {
        if (platform.os.mac && platform.engine.webkit && !event.relatedTarget) { if (!keyboard && !isTypeableElement(target)) return; }
        else if (!matchesFocusVisible(target as Element)) return;
      }
      const root = context();
      const request = () => { if (!blocked && options.enabled !== false && context() === root) root.setOpen(true, createChangeEventDetails('trigger-focus', event, current)); };
      if ((root.state.open && isTargetInsideEnabledTrigger(event.relatedTarget, root.triggerElements)) || !options.delay) request();
      else timeout.start(options.delay, request);
    },
    onFocusOut(event) {
      if (disposed || options.enabled === false) return;
      blocked = null;
      const related = event.relatedTarget as Element | null;
      const guard = related?.hasAttribute?.('data-base-ui-focus-guard') && related.getAttribute('data-type') === 'outside';
      const root = context();
      timeout.start(0, () => {
        if (context() !== root || options.enabled === false) return;
        const dom = root.state.domReferenceElement;
        const active = activeElement(dom?.ownerDocument ?? document);
        if (!related && active === dom) return;
        if (contains(root.state.floatingElement, active) || contains(dom, active) || guard || isTargetInsideEnabledTrigger(related ?? active, root.triggerElements)) return;
        root.setOpen(false, createChangeEventDetails('trigger-focus', event));
      });
    },
  };
  return { get reference() { return options.enabled === false ? undefined : reference; }, get trigger() { return options.enabled === false ? undefined : reference; } };
}
