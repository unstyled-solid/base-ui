// Adapted from Base UI, MIT, 19511bb171f3b360b006c94cf6d07e53cb446505.
import { clamp } from '../../utils/clamp';
import { getPushedThumbValues } from './getPushedThumbValues';
export interface ResolveThumbCollisionResult { value: number | number[]; thumbIndex: number; didSwap: boolean }
export function resolveThumbCollision(behavior: 'push' | 'swap' | 'none', values: readonly number[], currentValues: readonly number[] | null | undefined, initialValues: readonly number[] | null | undefined, pressedIndex: number, nextValue: number, min: number, max: number, step: number, minStepsBetweenValues: number): ResolveThumbCollisionResult {
  const active = currentValues ?? values;
  const baseline = initialValues ?? values;
  if (active.length <= 1) return { value: nextValue, thumbIndex: 0, didSwap: false };
  const distance = step * minStepsBetweenValues;
  if (behavior === 'push') return { value: getPushedThumbValues(active, pressedIndex, nextValue, min, max, step, minStepsBetweenValues), thumbIndex: pressedIndex, didSwap: false };
  const candidate = active.slice();
  const previous = candidate[pressedIndex - 1];
  const next = candidate[pressedIndex + 1];
  const clamped = Number(clamp(nextValue, previous != null ? previous + distance : min, next != null ? next - distance : max).toFixed(12));
  candidate[pressedIndex] = clamped;
  if (behavior === 'swap') {
    const forward = nextValue > active[pressedIndex] && next != null && nextValue >= next - 1e-7;
    const backward = nextValue < active[pressedIndex] && previous != null && nextValue <= previous + 1e-7;
    if (forward || backward) {
      const target = forward ? pressedIndex + 1 : pressedIndex - 1;
      const initial = candidate.map((_, i) => i === pressedIndex ? clamped : (baseline[i] ?? active[i]));
      const targetValue = forward ? Math.max(nextValue, candidate[target]) : Math.min(nextValue, candidate[target]);
      const adjusted = getPushedThumbValues(candidate, target, targetValue, min, max, step, minStepsBetweenValues, initial);
      const neighbor = forward ? target - 1 : target + 1;
      const lower = Math.max(adjusted[neighbor - 1] != null ? adjusted[neighbor - 1] + distance : min, min + neighbor * distance);
      const upper = Math.min(adjusted[neighbor + 1] != null ? adjusted[neighbor + 1] - distance : max, max - (adjusted.length - 1 - neighbor) * distance);
      adjusted[neighbor] = Number(clamp(clamped, lower, upper).toFixed(12));
      return { value: adjusted, thumbIndex: target, didSwap: true };
    }
  }
  return { value: candidate, thumbIndex: pressedIndex, didSwap: false };
}
