// Adapted from Base UI, MIT, 19511bb171f3b360b006c94cf6d07e53cb446505.
import { clamp } from '../../utils/clamp';
import { asc } from './asc';
export function getSliderValue(valueInput: number, index: number, min: number, max: number, range: boolean, values: readonly number[]) {
  const clamped = clamp(valueInput, min, max);
  if (!range) return clamped;
  const output = values.slice();
  output[index] = clamp(clamped, values[index - 1] ?? -Infinity, values[index + 1] ?? Infinity);
  return output.sort(asc);
}
