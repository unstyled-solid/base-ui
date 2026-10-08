import type { FieldRootState } from '../../internals/field-root-context';

/** Preserve the original getter receiver while overriding part-local disabled state. */
export function fieldState(state: () => FieldRootState | undefined, disabled: () => boolean): FieldRootState {
  return {
    get disabled() { return disabled(); },
    get touched() { return state()?.touched ?? false; },
    get dirty() { return state()?.dirty ?? false; },
    get valid() { return state()?.valid ?? null; },
    get filled() { return state()?.filled ?? false; },
    get focused() { return state()?.focused ?? false; },
  };
}
