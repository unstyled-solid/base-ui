import { createEffect, createMemo, onCleanup, runWithOwner, untrack, type Accessor } from 'solid-js';
import { isServer, type JSX } from '@solidjs/web';
import type { MutableCell } from '../internals/contracts/core';

/** Native assignment refs are compiled to callbacks; cells are internal only. */
export type InputRef<T extends Element> = JSX.Ref<T> | MutableCell<T | null> | null;
export type MergedRef<T extends Element> = ((element: T | null) => void) & { readonly current: T | null };

function flatten<T extends Element>(refs: readonly InputRef<T>[]): InputRef<T>[] {
  return refs.flatMap((ref) => Array.isArray(ref) ? flatten<T>(ref) : ref == null ? [] : [ref]);
}

/** Create during setup. The returned callback is safe in an ownerless renderer ref.
 * Callback returns follow RC13 (ignored). Composed callbacks must tolerate a null
 * detach notification, supplied by this owner because the renderer does not send it.
 */
export function createMergedRefsN<T extends Element>(refs: readonly InputRef<T>[] | Accessor<readonly InputRef<T>[]>): MergedRef<T> {
  if (isServer) {
    const callback: MergedRef<T> = Object.assign((_element: T | null): void => {}, { current: null });
    return callback;
  }
  const read = () => [...new Set(flatten(typeof refs === 'function' ? refs() : refs))];
  let current: T | null = null;
  let attached: InputRef<T>[] = [];
  let disposed = false;
  function apply(ref: InputRef<T>, element: T | null) {
    // Every path (settled replacement and teardown included) follows native
    // RC13 refs: untracked and ownerless, callback return deliberately ignored.
    untrack(() => runWithOwner(null, () => {
      if (typeof ref === 'function') (ref as (value: T | null) => void)(element);
      else if (ref != null && typeof ref === 'object' && 'current' in ref) ref.current = element;
    }));
  }
  function detach() {
    const previous = attached;
    attached = [];
    for (const ref of previous) apply(ref, null);
  }
  function attach(next: InputRef<T>[]) {
    if (current === null) return;
    attached = next;
    for (const ref of attached) apply(ref, current);
  }
  onCleanup(() => { disposed = true; detach(); current = null; });
  const sameRefs = (a: InputRef<T>[], b: InputRef<T>[]) => a.length === b.length && a.every((ref, i) => ref === b[i]);
  // Ref functions/nodes are client imperative data, never serialized hydration values.
  const inputs = createMemo(read, { equals: sameRefs, transparent: true });
  createEffect(inputs, (next) => {
    if (!sameRefs(next, attached)) { detach(); attach(next); }
    // Replacement is reconciled above; owner disposal is handled by onCleanup.
    // An effect cleanup here would detach a ref that was already delivered by
    // the native ref before the first settled effect, then attach it again.
  }, { transparent: true });
  const callback = (element: T | null) => {
    if (disposed || element === current) return;
    detach();
    current = element;
    attach(untrack(read));
  };
  return Object.defineProperty(callback, 'current', { get: () => current }) as MergedRef<T>;
}
export function createMergedRefs<T extends Element>(...refs: InputRef<T>[]): MergedRef<T> {
  return createMergedRefsN(refs);
}
export { createMergedRefs as useMergedRefs, createMergedRefsN as useMergedRefsN };
