import { createSignal, flush, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer } from '../../../test';
import { createFilterDropdownCloseQuery } from './useFilterDropdownCloseQuery';
import { TestRoot, Item, List } from '../test/host';
import { FilterDropdownInput as Input } from '../input/FilterDropdownInput';
import { FilterDropdownClear as Clear } from '../clear/FilterDropdownClear';

describe('FilterDropdown close query transition', () => {
  const { render } = createRenderer();
  for (const cancel of [false, true]) {
    it(`retains exit query and releases on reopen/unmount (cancel=${cancel})`, async () => {
      let transition!: (open: boolean, mounted: boolean) => void;
      const changed = vi.fn();
      const view = await render(() => {
        const [open, setOpen] = createSignal(true);
        const [mounted, setMounted] = createSignal(true);
        const [value, setValue] = createSignal('can');
        const close = createFilterDropdownCloseQuery({
          get open() { return open(); }, get mounted() { return mounted(); }, get value() { return value(); },
          onValueChange(next, details) { changed(next, details); if (cancel) details.cancel(); if (!details.isCanceled) setValue(next); },
        });
        transition = (nextOpen, nextMounted) => { close.transition(nextOpen, nextMounted); setOpen(nextOpen); setMounted(nextMounted); };
        return <><output data-testid="query">{close.query()}</output><output data-testid="value">{value()}</output></>;
      });
      untrack(() => transition(false, true)); flush();
      expect(view.getByTestId('query')).toHaveTextContent('can');
      expect(view.getByTestId('value').textContent).toBe(cancel ? 'can' : '');
      expect(changed).toHaveBeenCalledExactlyOnceWith('', expect.objectContaining({ reason: 'popup-close' }));
      untrack(() => transition(false, false)); flush();
      expect(view.getByTestId('query').textContent).toBe(cancel ? 'can' : '');
      untrack(() => transition(true, true)); flush();
      expect(view.getByTestId('query').textContent).toBe(cancel ? 'can' : '');
      expect(changed).toHaveBeenCalledTimes(1);
    });
  }
  it('retains the displayed query, controls and matching DOM through exit, then releases on reopen', async () => {
    let transition!: (open: boolean, mounted: boolean) => void;
    const changed = vi.fn();
    const view = await render(() => {
      const [open, setOpen] = createSignal(true);
      const [mounted, setMounted] = createSignal(true);
      const [value, setValue] = createSignal('can');
      const close = createFilterDropdownCloseQuery({
        get open() { return open(); }, get mounted() { return mounted(); }, get value() { return value(); },
        onValueChange(next, details) { changed(next, details); if (!details.isCanceled) setValue(next); },
      });
      transition = (nextOpen, nextMounted) => { close.transition(nextOpen, nextMounted); setOpen(nextOpen); setMounted(nextMounted); };
      return <TestRoot open={open()} value={value()} query={close.query()}><Input /><Clear aria-label="Clear" /><List><Item>Canada</Item><Item>Mexico</Item></List></TestRoot>;
    });
    const input = view.getByRole('searchbox');
    const canada = view.getByRole('menuitem');
    untrack(() => transition(false, true)); flush();
    expect(input).toHaveValue('can');
    expect(view.getByRole('menuitem')).toBe(canada);
    expect(view.getByLabelText('Clear')).toBeInTheDocument();
    expect(changed).toHaveBeenCalledExactlyOnceWith('', expect.objectContaining({ reason: 'popup-close' }));
    untrack(() => transition(true, true)); flush();
    expect(input).toHaveValue('');
    expect(view.getByText('Canada')).toBe(canada);
    expect(view.getAllByRole('menuitem')).toHaveLength(2);
    expect(view.queryByLabelText('Clear')).toBeNull();
  });
});
