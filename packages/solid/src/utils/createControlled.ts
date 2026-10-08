import type { ControlledOptions, ControlledState } from '../internals/contracts/state';
import type { ChangeEventDetails } from '../internals/contracts/events';
import { createEffect, createSignal, untrack } from 'solid-js';
import { error } from './error';
/** FROZEN seam: options are live accessors; request calls current onChange before cancellation/commit. */
export type DefaultlessControlledOptions<T, D extends ChangeEventDetails = ChangeEventDetails> = Omit<ControlledOptions<T | undefined, D>, 'defaultValue'> & { defaultValue?: T | undefined };
export function createControlled<T, D extends ChangeEventDetails = ChangeEventDetails>(options: ControlledOptions<T, D>): ControlledState<T, D>;
export function createControlled<T, D extends ChangeEventDetails = ChangeEventDetails>(options: DefaultlessControlledOptions<T, D>): ControlledState<T | undefined, D>;
export function createControlled<T, D extends ChangeEventDetails = ChangeEventDetails>(options: ControlledOptions<T, D> | DefaultlessControlledOptions<T, D>): ControlledState<T | undefined, D> {
  const initial = untrack(() => ({ controlled: options.value() !== undefined, defaultValue: options.defaultValue }));
  const [local, setLocal] = createSignal<T | undefined>(() => initial.defaultValue);
  if (process.env.NODE_ENV !== 'production') {
    createEffect(() => ({ value: options.value(), name: options.name, state: options.state ?? 'value' }),
      ({ value, name, state }) => {
        if (initial.controlled !== (value !== undefined)) {
          error(`A component is changing the ${initial.controlled ? '' : 'un'}controlled ${state} state of ${name} to be ${initial.controlled ? 'un' : ''}controlled.\nElements should not switch from uncontrolled to controlled (or vice versa).\nDecide between using a controlled or uncontrolled ${name} element for the lifetime of the component.\nThe nature of the state is determined during the first render. It's considered controlled if the value is not \`undefined\`.\nMore info: https://fb.me/react-controlled-components`);
        }
      });
    createEffect(() => ({ value: options.defaultValue, state: options.state ?? 'value', name: options.name }), ({ value, state, name }) => {
      if (!initial.controlled && serializeDefault(initial.defaultValue) !== serializeDefault(value)) {
        error(`A component is changing the default ${state} state of an uncontrolled ${name} after being initialized. To suppress this warning opt to use a controlled ${name}.`);
      }
    });
  }
  return {
    controlled: initial.controlled,
    value: () => {
      const external = options.value();
      return initial.controlled && external !== undefined ? external : local();
    },
    request(nextValue, details) {
      // The defined-default overload never supplies undefined; the defaultless
      // overload's callback accepts it. Keep that distinction at this boundary.
      const callback = untrack(() => options.onChange?.()) as ((nextValue: T | undefined, details: D) => void) | undefined;
      untrack(() => callback?.(nextValue, details));
      if (details.isCanceled) return { accepted: false, nextValue };
      if (!initial.controlled) setLocal(() => nextValue);
      return { accepted: true, nextValue, controlled: initial.controlled };
    },
    reset(nextValue = initial.defaultValue) {
      if (!initial.controlled) setLocal(() => nextValue);
    },
  };
}
export { createControlled as useControlled };

/** Same comparison as upstream, including cyclic objects and bigint defaults. */
function serializeDefault(input: unknown): string {
  let nextId = 0;
  const seen = new WeakMap<object, number>();
  try {
    return JSON.stringify(input, function (key, value) {
      if (key === '_owner' && this != null && typeof this === 'object' && '$$typeof' in this) return undefined;
      if (typeof value === 'bigint') return `__bigint__:${value}`;
      if (value !== null && typeof value === 'object') {
        const id = seen.get(value);
        if (id !== undefined) return `__object__:${id}`;
        seen.set(value, nextId++);
      }
      return value;
    }) ?? `__top__:${typeof input}`;
  } catch { return '__unserializable__'; }
}
