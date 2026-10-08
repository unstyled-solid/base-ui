import { describe, it, expect, vi } from 'vitest';
import { advanceTimers, createRenderer } from '../../../test';
import { ComboboxStatus } from './ComboboxStatus';
import { INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY } from '../../internals/createInitialLiveRegionTextMutation';
vi.mock('../../utils/platform', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../utils/platform')>();
  return { ...actual, platform: { ...actual.platform, os: { ...actual.platform.os, ios: true, apple: true } } };
});
describe('Combobox.Status iOS (canonical platform suite)', () => {
  it('skips the initial text mutation and preserves the polite region', async () => {
    vi.useFakeTimers();
    const view = await createRenderer().render(() => <ComboboxStatus>Searching…</ComboboxStatus>);
    const status = view.getByRole('status');
    expect(status.textContent).toBe('Searching…'); expect(status).toHaveAttribute('aria-live', 'polite'); expect(status).toHaveAttribute('aria-atomic', 'true');
    await advanceTimers(INITIAL_LIVE_REGION_TEXT_MUTATION_RESET_DELAY);
    expect(view.getByRole('status')).toBe(status);
    expect(status.textContent).toBe('Searching…');
    view.unmount();
    vi.useRealTimers();
  });
});
