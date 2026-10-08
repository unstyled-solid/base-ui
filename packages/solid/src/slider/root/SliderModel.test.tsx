import { describe, expect, it, vi } from 'vitest';
import { flush, untrack } from 'solid-js';
import { createRenderer } from '../../../test';
import { createSliderModel } from './createSliderModel';
import { createChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import type { SliderRootProps } from './SliderRoot';

const { renderProps } = createRenderer();
type Model = ReturnType<typeof createSliderModel>;
async function mount(props: SliderRootProps) {
  let model!: Model;
  const view = await renderProps<SliderRootProps>((live) => {
    model = createSliderModel(live);
    return <output>{model.values().join(' – ')}</output>;
  }, props);
  return { ...view, get model() { return model; } };
}
describe('Slider root model with real controlled foundation', () => {
  it.each([undefined, 17])('defaults to min=%s while preserving scalar shape', async (min) => {
    const view = await mount({ min });
    expect(untrack(view.model.fieldValue)).toBe(min ?? 0);
  });
  it('retains frozen single-element array shape and derives clamped sorted copies', async () => {
    const original = Object.freeze([120, -20]);
    const view = await mount({ value: original });
    expect(untrack(view.model.values)).toEqual([0, 100]);
    expect(original).toEqual([120, -20]);
    await view.setProps({ value: Object.freeze([25]) });
    expect(untrack(view.model.fieldValue)).toEqual([25]);
  });
  it('reports normalized proposals even when an unsorted controlled display is unchanged', async () => {
    const original = Object.freeze([2, 1]); const change = vi.fn();
    const view = await mount({ value: original, min: 0, max: 5, onValueChange: change });
    expect(untrack(view.model.values)).toEqual([1, 2]);
    expect(untrack(() => view.model.request([1, 2], createChangeEventDetails('none', undefined, undefined, { activeThumbIndex: 1 })))).toBe(true);
    expect(change.mock.calls[0][0]).toEqual([1, 2]);
    expect(change.mock.calls[0][0]).not.toBe(original);
    expect(original).toEqual([2, 1]);
  });
  it('requests an explicit candidate before staged publication and calls the current callback', async () => {
    const old = vi.fn(); const next = vi.fn();
    const view = await mount({ defaultValue: 20, onValueChange: old });
    await view.setProps({ onValueChange: next });
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    const details = createChangeEventDetails('keyboard', event, undefined, { activeThumbIndex: 0 });
    expect(untrack(() => view.model.request(21, details))).toBe(true);
    expect(untrack(view.model.value)).toBe(20);
    expect(untrack(() => view.model.request(22, details, 21))).toBe(true);
    flush();
    expect(untrack(view.model.value)).toBe(22);
    expect(old).not.toHaveBeenCalled();
    expect(next.mock.calls.map((call) => call[0])).toEqual([21, 22]);
    expect(next.mock.calls[0][1].event).toBe(event);
  });
  it('cancels before uncontrolled publication and rejects scalar/array no-ops and NaN', async () => {
    const change = vi.fn((_value, details) => details.cancel());
    const view = await mount({ defaultValue: [20, 40], onValueChange: change });
    const detail = () => createChangeEventDetails('none', undefined, undefined, { activeThumbIndex: 0 });
    expect(untrack(() => view.model.request([20, 40], detail()))).toBe(false);
    expect(untrack(() => view.model.request([NaN, 40], detail()))).toBe(false);
    expect(untrack(() => view.model.request([30, 40], detail()))).toBe(false);
    flush();
    expect(change).toHaveBeenCalledTimes(1);
    expect(untrack(view.model.fieldValue)).toEqual([20, 40]);
  });
  it('does not treat a controlled accepted request as an acknowledgment', async () => {
    const change = vi.fn(); const view = await mount({ value: 20, onValueChange: change });
    expect(untrack(() => view.model.request(30, createChangeEventDetails('none', undefined, undefined, { activeThumbIndex: 0 })))).toBe(true);
    flush();
    expect(untrack(view.model.fieldValue)).toBe(20);
    await view.setProps({ value: 30 });
    expect(untrack(view.model.fieldValue)).toBe(30);
  });
  it('uses source clamping with invalid bounds without inventing a fallback range', async () => {
    const view = await mount({ min: 10, max: 10, value: 50 });
    expect(untrack(view.model.values)).toEqual([10]);
    await view.setProps({ min: 20, max: 10 });
    expect(untrack(view.model.values)).toEqual([20]);
  });
});
