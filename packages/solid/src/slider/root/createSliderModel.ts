import { createMemo } from 'solid-js';
import { createControlled } from '../../utils/createControlled';
import { clamp } from '../../utils/clamp';
import type { SliderRootProps, SliderRootChangeEventDetails } from './SliderRoot';

export function areValuesEqual(a: number | readonly number[], b: unknown) {
  return a === b || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => value === b[index]));
}

/** Slider-specific normalization and proposal validation. Controlled ownership,
 * callback ordering and cancellation remain the shared state's responsibility. */
export function createSliderModel<Value extends number | readonly number[]>(props: Pick<SliderRootProps<Value>, 'value' | 'defaultValue' | 'onValueChange' | 'min' | 'max'>) {
  const min = () => props.min ?? 0;
  const max = () => props.max ?? 100;
  const controlled = createControlled<number | readonly number[], SliderRootChangeEventDetails>({
    value: () => props.value,
    get defaultValue() { return props.defaultValue ?? min(); },
    onChange: () => (value, details) => props.onValueChange?.(value as Value extends number ? number : Value, details),
    name: 'Slider',
  });
  const values = createMemo(() => {
    const raw = controlled.value();
    return (typeof raw === 'number' ? [raw] : raw.slice()).map((value) => clamp(value, min(), max())).sort((a, b) => a - b);
  });
  const range = () => Array.isArray(controlled.value());
  return {
    value: controlled.value, values, min, max, range,
    fieldValue: () => range() ? values() : values()[0],
    request(next: number | number[], details: SliderRootChangeEventDetails, previous: number | readonly number[] = controlled.value()) {
      if ((typeof next === 'number' ? Number.isNaN(next) : next.some(Number.isNaN)) || areValuesEqual(next, previous)) return false;
      return controlled.request(next, details).accepted;
    },
  };
}
