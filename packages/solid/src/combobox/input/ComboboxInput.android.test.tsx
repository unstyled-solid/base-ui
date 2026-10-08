import { describe, it, expect, vi } from 'vitest';
import { createRenderer, fireEvent } from '../../../test';
import { ComboboxRoot } from '../root/ComboboxRoot';
import { ComboboxInput } from './ComboboxInput';
vi.mock('../../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, os: { ...actual.platform.os, android: true } } };
});
describe('Combobox.Input Android (canonical platform suite)', () => {
  it('propagates changes during Android composition', async () => {
    const changed = vi.fn();
    const view = await createRenderer().render(() => <ComboboxRoot onInputValueChange={changed}><ComboboxInput /></ComboboxRoot>);
    const input = view.getByRole('combobox'); fireEvent.compositionStart(input);
    fireEvent.input(input, { target: { value: 'a' }, inputType: 'insertCompositionText' });
    expect(changed).toHaveBeenCalledWith('a', expect.objectContaining({ reason: 'input-change' }));
  });
});
