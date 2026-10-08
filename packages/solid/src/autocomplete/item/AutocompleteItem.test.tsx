import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../../test';
import { AutocompleteFixture } from '../test/AutocompleteFixture';

describe('Autocomplete.Item', () => {
  const { render } = createRenderer();
  it.each(['pointer', 'keyboard'])('calls onClick once through %s activation', async (activation) => {
    const click = vi.fn();
    const view = await render(() => <AutocompleteFixture itemClick={click} openOnInputClick />);
    await view.user.click(view.getByTestId('input'));
    if (activation === 'pointer') await view.user.click(view.getByRole('option', { name: 'alpine' }));
    else await view.user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
  });
  it('never exposes data-selected after committing and reopening', async () => {
    const view = await render(() => <AutocompleteFixture openOnInputClick />);
    const input = view.getByTestId('input');
    await view.user.click(input);
    await view.user.click(view.getByRole('option', { name: 'alpine' }));
    await view.user.click(input);
    expect(view.getByRole('option', { name: 'alpine' })).not.toHaveAttribute('data-selected');
  });
});
