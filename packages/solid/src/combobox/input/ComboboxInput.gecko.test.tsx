import { describe, it, expect, vi } from 'vitest';
import { createRenderer } from '../../../test';
import { DirectionContext } from '../../internals/direction-context/DirectionContext';
import { ComboboxRoot } from '../root/ComboboxRoot';
import { ComboboxInput } from './ComboboxInput';
vi.mock('../../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, engine: { ...actual.platform.engine, gecko: true } } };
});
describe('Combobox.Input Gecko RTL (canonical platform suite)', () => {
  it('uses Gecko RTL caret positions for Home and End', async () => {
    const view = await createRenderer().render(() => <DirectionContext value={() => 'rtl'}><ComboboxRoot defaultInputValue="apple"><ComboboxInput /></ComboboxRoot></DirectionContext>);
    const input = view.getByRole('combobox') as HTMLInputElement; input.focus();
    await view.user.keyboard('{Home}'); expect(input.selectionStart).toBe(input.value.length);
    await view.user.keyboard('{End}'); expect(input.selectionStart).toBe(0);
  });
});
