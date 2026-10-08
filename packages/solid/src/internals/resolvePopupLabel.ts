import { createEffect, createSignal, type Accessor } from 'solid-js';
import { isServer } from '@solidjs/web';
import { ownerWindow } from '../utils/owner';

interface PopupLabelProps {
  'aria-label'?: string | false | undefined;
  'aria-labelledby'?: string | false | undefined;
  render?: unknown;
}

/** Canonical label precedence, with opaque Solid render callbacks. */
export function resolvePopupLabel(props: PopupLabelProps, activeTriggerElement: Element | null, activeTriggerId: string | null): string | undefined {
  const labelledBy = props['aria-labelledby'];
  if (typeof labelledBy === 'string') return labelledBy;
  if (labelledBy === false || props['aria-label']) return undefined;
  return activeTriggerElement ? activeTriggerElement.id || undefined : activeTriggerId || undefined;
}

/** Observe callback-authored labels on the real host; no JSX introspection.
 * Spread props into the renderer pipeline and compose ref with the popup ref. */
export function createPopupLabel(props: PopupLabelProps, activeTriggerElement: Accessor<Element | null>, activeTriggerId: Accessor<string | null>) {
  const [element, setElement] = createSignal<HTMLElement | null>(null, { ownedWrite: true });
  const [renderedLabel, setRenderedLabel] = createSignal(false);
  if (!isServer) createEffect(element, (node) => {
    if (!node) { setRenderedLabel(false); return; }
    const update = () => setRenderedLabel(!!node.getAttribute('aria-label'));
    update();
    const Observer = ownerWindow(node).MutationObserver;
    const observer = new Observer(update);
    observer.observe(node, { attributes: true, attributeFilter: ['aria-label'] });
    return () => observer.disconnect();
  }, { transparent: true });
  return {
    ref(node: HTMLElement | null) { setElement(node); },
    props: { get 'aria-labelledby'() {
      const explicit = props['aria-labelledby'];
      if (explicit !== undefined) return typeof explicit === 'string' ? explicit : undefined;
      return renderedLabel() ? undefined : resolvePopupLabel(props, activeTriggerElement(), activeTriggerId());
    } },
  };
}
