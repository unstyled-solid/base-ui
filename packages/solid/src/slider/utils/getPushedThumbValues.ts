// Adapted from Base UI, MIT, 19511bb171f3b360b006c94cf6d07e53cb446505.
import { clamp } from '../../utils/clamp';
export function getPushedThumbValues(values: readonly number[], index: number, nextValue: number, min: number, max: number, step: number, minStepsBetweenValues: number, initialValues?: readonly number[]) {
  const nextValues = values.slice();
  const distance = step * minStepsBetweenValues;
  const last = nextValues.length - 1;
  const initial = initialValues ?? values;
  nextValues[index] = clamp(nextValue, min + index * distance, max - (last - index) * distance);
  for (let i = index + 1; i <= last; i += 1) {
    const lower = nextValues[i - 1] + distance;
    const upper = max - (last - i) * distance;
    let candidate = Math.max(nextValues[i], lower);
    if (initial[i] < candidate) candidate = Math.max(initial[i], lower);
    nextValues[i] = clamp(candidate, lower, upper);
  }
  for (let i = index - 1; i >= 0; i -= 1) {
    const upper = nextValues[i + 1] - distance;
    const lower = min + i * distance;
    let candidate = Math.min(nextValues[i], upper);
    if (initial[i] > candidate) candidate = Math.min(initial[i], upper);
    nextValues[i] = clamp(candidate, lower, upper);
  }
  return nextValues.map((value) => Number(value.toFixed(12)));
}
