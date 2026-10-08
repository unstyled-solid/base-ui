import { describe, expect, it, vi } from 'vitest';
import { flush, untrack } from 'solid-js';
import { createRenderer, expectDiagnostic } from '../../test';
import { createControlled } from './createControlled';
import { createChangeEventDetails } from '../internals/createBaseUIEventDetails';
import type { ControlledState } from '../internals/contracts/state';

describe('createControlled', () => {
  const { renderProps, render } = createRenderer();
  it('calls current callback, cancels before staging and carries same-turn proposals', async () => {
    let state!: ControlledState<number>;
    const calls: number[] = [];
    const view = await render(() => {
      state = createControlled({ name: 'Test', value: () => undefined, defaultValue: 0,
        onChange: () => (next, details) => { calls.push(next); if (next === 2) details.cancel(); } });
      return <output>{state.value()}</output>;
    });
    expect(state.request(1, createChangeEventDetails('none')).accepted).toBe(true);
    expect(untrack(state.value)).toBe(0);
    expect(state.request(2, createChangeEventDetails('none')).accepted).toBe(false);
    state.request(3, createChangeEventDetails('none'));
    flush();
    expect(view.getByRole('status')).toHaveTextContent('3');
    expect(calls).toEqual([1, 2, 3]);
    state.reset();
    flush();
    expect(view.getByRole('status')).toHaveTextContent('0');
    expect(calls).toEqual([1, 2, 3]);
  });
  it('does not acknowledge controlled requests or reset and reads replaced callbacks', async () => {
    let state!: ControlledState<number>;
    const first = vi.fn();
    const second = vi.fn();
    const view = await renderProps((props: { value: number; change: typeof first }) => {
      state = createControlled({ name: 'Test', value: () => props.value, defaultValue: 0, onChange: () => props.change });
      return <output>{state.value()}</output>;
    }, { value: 4, change: first });
    state.request(5, createChangeEventDetails('none'));
    flush();
    expect(view.getByRole('status')).toHaveTextContent('4');
    expect(first).toHaveBeenCalledTimes(1);
    await view.setProps({ value: 6, change: second });
    state.request(7, createChangeEventDetails('none'));
    state.reset(0);
    flush();
    expect(second).toHaveBeenCalledTimes(1);
    expect(view.getByRole('status')).toHaveTextContent('6');
  });
  it('retains the initial default and emits the source default-change warning only once', async () => {
    const view = await renderProps((props: { defaultValue: number }) => {
      const state = createControlled({ name: 'ReviewedDefault', value: () => undefined, get defaultValue() { return props.defaultValue; } });
      return <output>{state.value()}</output>;
    }, { defaultValue: 0 });
    await expectDiagnostic({ message: /changing the default value state of an uncontrolled ReviewedDefault/ }, () => view.setProps({ defaultValue: 1 }));
    await expectDiagnostic({ message: /ReviewedDefault/, count: 0 }, () => view.setProps({ defaultValue: 2 }));
    expect(view.getByRole('status')).toHaveTextContent('0');
  });
});
