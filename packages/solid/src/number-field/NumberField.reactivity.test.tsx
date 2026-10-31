import { expect, it } from 'vitest';
import { attribution } from 'solid-js/attribution';
import { createRenderer } from '../../test';
import { NumberField } from './index';

it('does not reproject stepper host props while their disabled state is unchanged', async () => {
  const reads = { increment: 0, decrement: 0 };
  const incrementProps = { get 'data-probe'() { reads.increment++; return 'increment'; } };
  const decrementProps = { get 'data-probe'() { reads.decrement++; return 'decrement'; } };
  const view = await createRenderer().renderProps((props: { value: number; disabled: boolean; readOnly: boolean }) => (
    <NumberField.Root value={props.value} min={0} max={10} disabled={props.disabled} readOnly={props.readOnly}>
      <NumberField.Group>
        <NumberField.Decrement {...decrementProps} />
        <NumberField.Input />
        <NumberField.Increment {...incrementProps} />
      </NumberField.Group>
    </NumberField.Root>
  ), { value: 1, disabled: false, readOnly: false });
  const increment = view.getByRole('button', { name: 'Increase' });
  const decrement = view.getByRole('button', { name: 'Decrease' });
  const initialReads = { ...reads };
  expect(initialReads.increment).toBeGreaterThan(0);
  expect(initialReads.decrement).toBeGreaterThan(0);
  for (const value of [2, 3, 4, 5]) await view.setProps({ value });
  expect(reads).toEqual(initialReads);
  expect(view.getByRole('button', { name: 'Increase' })).toBe(increment);
  expect(view.getByRole('button', { name: 'Decrease' })).toBe(decrement);
  expect(view.getByRole('textbox')).toHaveValue('5');
  await view.setProps({ value: 10 });
  expect(increment).toHaveAttribute('aria-disabled', 'true');
  expect(decrement).toHaveAttribute('aria-disabled', 'false');
  await view.setProps({ value: 0 });
  expect(increment).toHaveAttribute('aria-disabled', 'false');
  expect(decrement).toHaveAttribute('aria-disabled', 'true');
  await view.setProps({ value: 5, disabled: true });
  expect(increment).toHaveAttribute('aria-disabled', 'true');
  expect(decrement).toHaveAttribute('aria-disabled', 'true');
  await view.setProps({ disabled: false, readOnly: true });
  expect(increment).toHaveAttribute('aria-disabled', 'true');
  expect(decrement).toHaveAttribute('aria-disabled', 'true');
  await view.setProps({ readOnly: false });
  expect(increment).toHaveAttribute('aria-disabled', 'false');
  expect(decrement).toHaveAttribute('aria-disabled', 'false');
});

it('retains controls and live state callbacks through repeated steps, typing and boundary changes without attribution warnings', async () => {
  const release = attribution.enable({ log: false });
  const refs: (HTMLElement | null)[] = [];
  try {
    const view = await createRenderer().render(() => <NumberField.Root defaultValue={1} min={0} max={20}
      class={state => `value-${state.value}`} ref={node => { refs.push(node); }}>
      <NumberField.Group><NumberField.Decrement /><NumberField.Input /><NumberField.Increment /></NumberField.Group>
    </NumberField.Root>);
    try {
      const input = view.getByRole('textbox') as HTMLInputElement;
      const increment = view.getByRole('button', { name: 'Increase' });
      const decrement = view.getByRole('button', { name: 'Decrease' });
      for (let index = 0; index < 6; index++) {
        await view.user.click(increment);
        expect(input.value).toBe(String(index + 2));
      }
      await view.user.click(decrement);
      expect(input.value).toBe('6');
      expect(refs[0]).toHaveClass('value-6');
      await view.user.clear(input);
      await view.user.type(input, '20');
      expect(increment).toHaveAttribute('aria-disabled', 'true');
      await view.user.click(increment);
      expect(input.value).toBe('20');
      await view.user.click(decrement);
      expect(input.value).toBe('19');
      expect(increment).toHaveAttribute('aria-disabled', 'false');
      expect(view.getByRole('textbox')).toBe(input);
      expect(view.getByRole('button', { name: 'Increase' })).toBe(increment);
      expect(refs).toHaveLength(1);
    } finally { view.unmount(); }
    expect(refs[1]).toBeNull();
  } finally { release(); }
});
