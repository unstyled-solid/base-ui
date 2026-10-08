// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { createSignal, untrack } from 'solid-js';
import type { BaseUIChangeEventDetails } from '../internals/createBaseUIEventDetails';
import type { MutableCell } from '../internals/contracts/core';

type Details = BaseUIChangeEventDetails<'none'>;
type CheckedChange = (checked: boolean, details: Details) => void;
export interface UseCheckboxGroupParentParameters {
  allValues?: readonly string[] | undefined;
  value: readonly string[];
  /** Component transaction adapter; rendered state still derives from value. */
  getRequestValue?: (() => readonly string[]) | undefined;
  onValueChange?: ((value: string[], details: Details) => void) | undefined;
}
export interface UseCheckboxGroupParentReturnValue {
  disabledStatesRef: MutableCell<Map<string, boolean>>;
  registerChildId(value: string, id: string): () => void;
  registerDisabled(value: string, disabled: boolean): () => void;
  reset(value: readonly string[]): void;
  getParentProps(): {
    checked: boolean;
    indeterminate: boolean;
    'aria-controls': string | undefined;
    onCheckedChange: CheckedChange;
  };
  getChildProps(value: string): { checked: boolean; onCheckedChange: CheckedChange };
}

/** Live parameters; the restore snapshot/status advance only after every veto point. */
export function createCheckboxGroupParent(params: UseCheckboxGroupParentParameters): UseCheckboxGroupParentReturnValue {
  let snapshot = untrack(() => params.value.slice());
  let status: 'mixed' | 'on' | 'off' = 'mixed';
  const disabledStatesRef = { current: new Map<string, boolean>() };
  const disabledRegistrations = new Map<string, Map<symbol, boolean>>();
  const childIds = new Map<string, Map<symbol, string>>();
  const [revision, setRevision] = createSignal(0);
  const allValues = () => params.allValues ?? [];
  const requestValue = () => params.getRequestValue?.() ?? params.value;

  return {
    disabledStatesRef,
    reset(value) { snapshot = value.slice(); status = 'mixed'; },
    registerChildId(value, id) {
      const token = Symbol();
      const ids = childIds.get(value) ?? new Map<symbol, string>();
      childIds.set(value, ids);
      ids.set(token, id);
      setRevision((n) => n + 1);
      return () => {
        if (!ids.delete(token)) return;
        if (!ids.size) childIds.delete(value);
        setRevision((n) => n + 1);
      };
    },
    registerDisabled(value, disabled) {
      const token = Symbol();
      const entries = disabledRegistrations.get(value) ?? new Map<symbol, boolean>();
      disabledRegistrations.set(value, entries);
      entries.set(token, disabled);
      disabledStatesRef.current.set(value, disabled);
      return () => {
        if (!entries.delete(token)) return;
        if (!entries.size) {
          disabledRegistrations.delete(value);
          disabledStatesRef.current.delete(value);
        } else {
          // A departing duplicate cannot delete the surviving child's registration.
          disabledStatesRef.current.set(value, [...entries.values()].at(-1)!);
        }
      };
    },
    getParentProps() {
      return {
        get checked() { return params.value.length === allValues().length; },
        get indeterminate() { return params.value.length > 0 && params.value.length !== allValues().length; },
        get 'aria-controls'() {
          revision();
          return allValues().flatMap((value) => [...(childIds.get(value)?.values() ?? [])]).join(' ') || undefined;
        },
        onCheckedChange(_, details) {
          const none = allValues().filter((v) => disabledStatesRef.current.get(v) && snapshot.includes(v));
          const all = allValues().filter((v) => !disabledStatesRef.current.get(v) || snapshot.includes(v));
          if (snapshot.length === all.length || snapshot.length === 0) {
            params.onValueChange?.(requestValue().length === all.length ? none : all, details);
            return;
          }
          const nextStatus = status === 'mixed' ? 'on' : status === 'on' ? 'off' : 'mixed';
          // Source restores the accepted array itself. Callback edits to that
          // candidate must remain part of the snapshot for later restore cycles.
          const nextValue = nextStatus === 'on' ? all : nextStatus === 'off' ? none : snapshot;
          params.onValueChange?.(nextValue, details);
          if (!details.isCanceled) status = nextStatus;
        },
      };
    },
    getChildProps(childValue) {
      return {
        get checked() { return params.value.includes(childValue); },
        onCheckedChange(nextChecked, details) {
          const nextValue = requestValue().slice();
          if (nextChecked) nextValue.push(childValue);
          else nextValue.splice(nextValue.indexOf(childValue), 1);
          params.onValueChange?.(nextValue, details);
          if (!details.isCanceled) {
            snapshot = nextValue;
            status = 'mixed';
          }
        },
      };
    },
  };
}
export { createCheckboxGroupParent as useCheckboxGroupParent };
