import { expect, it } from 'vitest';
import { attribution } from 'solid-js/attribution';
import { createRenderer } from '../../test';
import { NumberField } from './index';

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
