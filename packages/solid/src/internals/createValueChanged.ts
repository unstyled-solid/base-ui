import { createEffect, untrack, type Accessor } from 'solid-js';

/** Observe committed values; callback replacement alone is not a value change. */
export function createValueChanged<T>(value: Accessor<T>, onChange: (previousValue: T) => void): void {
  let previous = untrack(value);
  createEffect(value, (current) => {
    if (previous !== current) untrack(() => onChange(previous));
    previous = current;
  });
}
export { createValueChanged as useValueChanged };
