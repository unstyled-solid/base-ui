import { describe, expect, it } from 'vitest';
import { getSliderValue } from './getSliderValue';
import { roundValueToStep } from './roundValueToStep';
import { getPushedThumbValues } from './getPushedThumbValues';
import { resolveThumbCollision } from './resolveThumbCollision';
import { validateMinimumDistance } from './validateMinimumDistance';

// Source: slider/utils/{getSliderValue,roundValueToStep,getPushedThumbValues,
// resolveThumbCollision}.test.ts @19511bb. Pure algorithm assertions are retained.
describe('Slider math — canonical utility suites', () => {
  it.each([[150, 100], [-10, 0]])('clamps scalar %s', (value, expected) => {
    expect(getSliderValue(value, 0, 0, 100, false, [50])).toBe(expected);
  });
  it.each([
    [5, 0, -10, 10, [-10, 0], [0, 0]], [-5, 1, -10, 10, [0, 10], [0, 0]],
    [50, 1, 0, 100, [20, 40, 80], [20, 50, 80]], [90, 1, 0, 100, [20, 40, 80], [20, 80, 80]],
    [10, 1, 0, 100, [20, 40, 80], [20, 20, 80]], [-30, 0, -50, 50, [-20, 0], [-30, 0]],
    [40, 1, -50, 50, [-20, 0], [-20, 40]],
  ] as const)('bounds %s between real neighbors', (value, index, min, max, values, expected) => {
    expect(getSliderValue(value, index, min, max, true, Object.freeze(values))).toEqual(expected);
  });
  it.each([[0.35, 0.1, 0.25, 0.35], [13.2, 1.5, 10.2, 13.2], [0.00000008, 0.00000001, 0, 0.00000008]])('rounds %s using origin precision', (value, step, min, expected) => {
    expect(roundValueToStep(value, step, min)).toBe(expected);
  });
  it.each([
    [[20, 40], 0, 70, 0, [70, 70]], [[20, 40], 0, 60, 5, [60, 65]],
    [[20, 40], 1, -10, 0, [0, 0]], [[10, 50, 90], 1, 95, 5, [10, 95, 100]],
  ] as const)('pushes %j at index %s', (values, index, next, distance, expected) => {
    expect(getPushedThumbValues(Object.freeze(values), index, next, 0, 100, 1, distance)).toEqual(expected);
  });
  it('pushes fractional minimum distances', () => {
    expect(getPushedThumbValues([0, 1], 0, 1.4, 0, 10, 1, 0.4)).toEqual([1.4, 1.8]);
  });
  it('restores toward gesture-start values only when a baseline is supplied', () => {
    const initial = [30, 50];
    const pushed = getPushedThumbValues(initial, 1, 20, 0, 100, 1, 0, initial);
    expect(pushed).toEqual([20, 20]);
    expect(getPushedThumbValues(pushed, 1, 35, 0, 100, 1, 0, initial)).toEqual([30, 35]);
  });
  it.each([
    ['none', 70, [40, 40], 0, false], ['push', 70, [70, 70], 0, false], ['swap', 65, [40, 65], 1, true],
  ] as const)('%s collision policy', (behavior, next, expected, index, swapped) => {
    expect(resolveThumbCollision(behavior, [20, 40], undefined, undefined, 0, next, 0, 100, 1, 0))
      .toEqual({ value: expected, thumbIndex: index, didSwap: swapped });
  });
  it('push does not cling when the pointer returns', () => {
    const first = resolveThumbCollision('push', [20, 40], [20, 40], [20, 40], 0, 70, 0, 100, 1, 0);
    expect(first.value).toEqual([70, 70]);
    expect(resolveThumbCollision('push', first.value as number[], first.value as number[], [20, 40], 0, 30, 0, 100, 1, 0))
      .toEqual({ value: [30, 70], thumbIndex: 0, didSwap: false });
  });
  it('swap continuity uses explicit accepted values before publication', () => {
    const first = resolveThumbCollision('swap', [20, 80], [20, 80], [20, 80], 0, 85, 0, 100, 1, 10);
    expect(first).toEqual({ value: [70, 85], thumbIndex: 1, didSwap: true });
    expect(resolveThumbCollision('swap', [20, 80], first.value as number[], [20, 80], first.thumbIndex, 95, 0, 100, 1, 10))
      .toEqual({ value: [70, 95], thumbIndex: 1, didSwap: false });
  });
  it.each([
    [[40, 45], 0, 44, [40, 45], 0, false], [[40, 45], 0, 45, [40, 45], 1, true],
    [[25, 40], 1, 29, [25, 30], 1, false], [[25, 40], 1, 25, [25, 30], 0, true],
    [[40, 45], 0, 46, [40, 46], 1, true],
  ] as const)('swap neighbor threshold %j/%s/%s', (current, pressed, next, expected, index, swapped) => {
    expect(resolveThumbCollision('swap', [25, 45], current, [25, 45], pressed, next, 0, 100, 1, 5))
      .toEqual({ value: expected, thumbIndex: index, didSwap: swapped });
  });
  it('uses resized live arrays', () => {
    expect(resolveThumbCollision('swap', [20, 40], [20, 40, 60], [20, 40], 1, 70, 0, 100, 1, 0))
      .toEqual({ value: [20, 60, 70], thumbIndex: 2, didSwap: true });
    expect(resolveThumbCollision('push', [20, 40], [20], [20, 40], 0, 30, 0, 100, 1, 0))
      .toEqual({ value: 30, thumbIndex: 0, didSwap: false });
  });
  it('rejects impossible distances and NaN array candidates', () => {
    expect(validateMinimumDistance([20, 40], 1, 50)).toBe(false);
    expect(validateMinimumDistance([20, NaN], 1, 0)).toBe(false);
    expect(validateMinimumDistance([0.25, 0.75], 0.1, 5)).toBe(true);
  });
  it('swap across a clamped neighbor uses accepted values in both current arguments', () => {
    expect(resolveThumbCollision('swap', [40, 45], [40, 45], [25, 45], 0, 46, 0, 100, 1, 5))
      .toEqual({ value: [40, 46], thumbIndex: 1, didSwap: true });
  });
});
