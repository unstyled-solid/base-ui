import { createEffect, onCleanup, untrack, type Accessor } from 'solid-js';
import { useFieldRootContext } from './FieldRootContext';
import type { MutableCell } from '../contracts/core';
/** Allocate once in an input-less group root when it is outside Field.Root. */
export function createFieldFocusScope(): MutableCell<unknown> { return { current: undefined }; }
const standaloneScopes = new WeakMap<(focused: boolean) => void, { scope: MutableCell<unknown>; users: number }>();
export function createSetFieldFocused(disabled: Accessor<boolean | undefined>, element: Accessor<Element | null>, onFocusedChange?: (focused: boolean) => void, scope?: MutableCell<unknown>): (focused: boolean) => void {
  const field = useFieldRootContext();
  let shared: { scope: MutableCell<unknown>; users: number } | undefined;
  if (!field && !scope && onFocusedChange) {
    // A root's stable setter identifies its standalone group, just as a Field
    // context identifies a group. This is never a mutable absence/default scope.
    shared = standaloneScopes.get(onFocusedChange);
    if (!shared) { shared = { scope: createFieldFocusScope(), users: 0 }; standaloneScopes.set(onFocusedChange, shared); }
    shared.users++;
    const registration = shared;
    onCleanup(() => { if (--registration.users === 0 && standaloneScopes.get(onFocusedChange) === registration) standaloneScopes.delete(onFocusedChange); });
  }
  const owner = field?.focusOwnerRef ?? scope ?? shared?.scope ?? createFieldFocusScope();
  const set = (focused: boolean) => {
    if (focused ? !untrack(disabled) : owner.current === set) {
      owner.current = focused && set;
      onFocusedChange?.(focused);
      field?.setFocused(focused);
    }
  };
  createEffect(() => ({ disabled: disabled(), node: element() }), (next) => {
    const root = next.node?.getRootNode() as Document | ShadowRoot | undefined;
    if (!next.disabled && root?.activeElement === next.node) set(true);
    return () => set(false);
  });
  return set;
}
export { createSetFieldFocused as useSetFieldFocused };
