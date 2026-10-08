import { describe, expect, it, vi } from 'vitest';
import { createRenderer, screen } from '../../test';
import { NumberFieldRoot } from './root/NumberFieldRoot';
import { NumberFieldInput } from './input/NumberFieldInput';
vi.mock('../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, os: { ...actual.platform.os, ios: true, apple: true } } };
});
describe('NumberField source iOS keyboard policy', () => {
  const { render } = createRenderer();
  it.each([[0, 'decimal'], [-5, 'text'], [undefined, 'text']] as const)('minimum %s gives %s keyboard', async (min, mode) => {
    await render(() => <NumberFieldRoot min={min}><NumberFieldInput /></NumberFieldRoot>);
    expect(screen.getByRole('textbox')).toHaveAttribute('inputmode', mode);
  });
});
