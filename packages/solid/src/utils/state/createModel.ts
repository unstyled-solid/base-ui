import { createSignal, type Accessor } from 'solid-js';
import type { ReadableModel } from '../../internals/contracts/state';
export function createModel<S extends object>(initial: S): ReadableModel<S> & { value: Accessor<S>; update(next: S | ((previous: S) => S)): void } {
  const [value, setValue] = createSignal<S>(() => initial);
  return { value, get state() { return value(); }, select: (selector) => selector(value()), update(next) { setValue((previous) => typeof next === 'function' ? (next as (previous: S) => S)(previous) : next); } };
}
