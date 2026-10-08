import { createEffect, onCleanup, untrack } from 'solid-js';
import type { Part, ScrollAreaRootContextValue } from '../root/ScrollAreaRootContext';

/** Ref callbacks only report; setup owns registration, replacement and disposal. */
export function registerPart(context: ScrollAreaRootContextValue, part: () => Part, enabled: () => boolean = () => true) {
  let node: HTMLDivElement | null = null;
  let key = untrack(part);
  function detach() {
    if (node && context.nodes[key] === node) context.register(key, null);
  }
  createEffect(() => ({ part: part(), enabled: enabled() }), (next) => {
    if (next.part !== key) { detach(); key = next.part; }
    // RC13 does not send a null ref when an enabled host disappears. The part's
    // setup can outlive that host, so explicitly remove its registration here.
    if (!next.enabled) detach();
    else if (node?.isConnected) context.register(key, node);
  });
  onCleanup(detach);
  return (next: HTMLDivElement | null) => {
    if (node === next) return;
    detach();
    node = next;
    if (node && untrack(enabled)) context.register(key, node);
  };
}
