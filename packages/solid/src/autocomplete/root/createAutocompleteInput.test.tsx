import { describe, expect, it, vi } from 'vitest';
import { createEffect, flush, untrack } from 'solid-js';
import { createRenderer } from '../../../test';
import { createChangeEventDetails, createGenericEventDetails } from '../../internals/createBaseUIEventDetails';
import { createAutocompleteInput } from './createAutocompleteInput';
import type { AutocompleteRootProps } from './AutocompleteRoot';

// Independent wrapper evidence, not a substitute for the real Combobox integration suites.
// Source: AutocompleteRoot.tsx and Root.test.tsx mode/filter/readOnly/value sections.
describe('Autocomplete typed/display adapter', () => {
  const { renderProps } = createRenderer();
  async function mount<Item = string>(initial: AutocompleteRootProps<Item> = {}) {
    let input!: ReturnType<typeof createAutocompleteInput<Item>>;
    const view = await renderProps((props: AutocompleteRootProps<Item>) => {
      input = createAutocompleteInput(props);
      return <><output data-testid="display">{input.inputValue()}</output>
        <output data-testid="query">{input.filterQuery()}</output></>;
    }, initial);
    const highlight = (item: Item | undefined, reason: 'keyboard' | 'pointer' | 'none' | 'imperative-action' = 'keyboard') => {
      untrack(() => {
        const details = createGenericEventDetails(reason, undefined, { index: item === undefined ? -1 : 0 });
        input.onItemHighlighted(item, details);
        input.onInlineCompletion(item, details);
      });
      flush();
    };
    const type = (value: string) => {
      const details = createChangeEventDetails('input-change', new InputEvent('input'));
      untrack(() => input.onInputValueChange(value, details));
      flush();
      return details;
    };
    return { ...view, input, highlight, type, display: () => view.getByTestId('display').textContent };
  }

  it.each(['list', 'both', 'inline', 'none'] as const)('mode=%s keeps typed and temporary text distinct', async (mode) => {
    const view = await mount({ mode });
    view.type(' a ');
    view.highlight('apple');
    expect(view.display()).toBe(mode === 'both' || mode === 'inline' ? 'apple' : ' a ');
    expect(untrack(view.input.filterQuery)).toBe(mode === 'both' ? 'a' : undefined);
    expect(untrack(view.input.filter) === null).toBe(mode === 'inline' || mode === 'none');
    view.highlight(undefined);
    expect(view.display()).toBe(' a ');
  });

  it('isolates multiple display readers from unchanged completion and scope bookkeeping', async () => {
    let input!: ReturnType<typeof createAutocompleteInput<string>>;
    const highlighted = vi.fn();
    const visibleRead = vi.fn(() => input.inputValue());
    const hiddenRead = vi.fn(() => input.inputValue());
    const view = await renderProps((props: AutocompleteRootProps<string>) => {
      input = createAutocompleteInput(props);
      // Count tracked compute runs, not effect callbacks (which can themselves
      // skip equal outputs), to prove the display dependency boundary.
      createEffect(visibleRead, () => {});
      createEffect(hiddenRead, () => {});
      return <output data-testid="display">{input.inputValue()}</output>;
    }, { mode: 'both', value: 'al', onItemHighlighted: highlighted });
    const highlight = (label: string) => {
      untrack(() => {
        const details = createGenericEventDetails('keyboard', undefined, { index: 0 });
        input.onItemHighlighted(label, details);
        input.onInlineCompletion(label, details);
      });
      flush();
    };
    highlight('alpha');
    expect(view.getByTestId('display').textContent).toBe('alpha');
    visibleRead.mockClear(); hiddenRead.mockClear(); highlighted.mockClear();

    highlight('alpha');
    highlight('alpha');
    expect(visibleRead).not.toHaveBeenCalled();
    expect(hiddenRead).not.toHaveBeenCalled();
    expect(highlighted).toHaveBeenCalledTimes(2);
    expect(untrack(input.filterQuery)).toBe('al');

    highlight('alpine');
    expect(visibleRead).toHaveBeenCalledTimes(1);
    expect(hiddenRead).toHaveBeenCalledTimes(1);
    expect(visibleRead.mock.results[0].value).toBe('alpine');
    expect(hiddenRead.mock.results[0].value).toBe('alpine');
    visibleRead.mockClear(); hiddenRead.mockClear();

    const scope = untrack(input.completionScope);
    await view.setProps({ value: 'alpine' });
    expect(untrack(input.completionScope)).not.toBe(scope);
    expect(visibleRead).not.toHaveBeenCalled();
    expect(hiddenRead).not.toHaveBeenCalled();
    expect(untrack(input.filterQuery)).toBe('alpine');
    await view.setProps({ value: 'al' });
    expect(view.getByTestId('display').textContent).toBe('al');
    expect(visibleRead).toHaveBeenCalledTimes(1);
    expect(hiddenRead).toHaveBeenCalledTimes(1);
  });

  it('pointer highlights preserve the temporary value and forward the original details', async () => {
    const callback = vi.fn();
    const view = await mount({ mode: 'both', defaultValue: 'al', onItemHighlighted: callback });
    view.highlight('alpha');
    const event = new MouseEvent('mousemove');
    const details = { reason: 'pointer' as const, event, index: 1 };
    untrack(() => { view.input.onItemHighlighted('alpine', details); view.input.onInlineCompletion('alpine', details); });
    flush();
    expect(view.display()).toBe('alpha');
    expect(callback).toHaveBeenLastCalledWith('alpine', details);
    expect(callback.mock.lastCall?.[1].event).toBe(event);
  });

  it('drops a completion permanently across readOnly and mode changes', async () => {
    const view = await mount({ mode: 'both', defaultValue: 'a' });
    view.highlight('apple');
    await view.setProps({ readOnly: true });
    expect(view.display()).toBe('a');
    await view.setProps({ readOnly: false });
    expect(view.display()).toBe('a');
    view.highlight('apple');
    await view.setProps({ mode: 'none' });
    await view.setProps({ mode: 'both' });
    expect(view.display()).toBe('a');
  });

  it('external controlled updates replace the overlay without reviving it when the value returns', async () => {
    const view = await mount({ mode: 'both', value: 'a' });
    view.highlight('apple');
    expect(view.display()).toBe('apple');
    await view.setProps({ value: 'ba' });
    expect(view.display()).toBe('ba');
    await view.setProps({ value: 'a' });
    expect(view.display()).toBe('a');
  });

  it('normalizes a controlled null to empty text and query', async () => {
    const view = await mount({ mode: 'both', value: null as never });
    expect(view.display()).toBe('');
    expect(untrack(view.input.filterQuery)).toBe('');
    view.type('ignored');
    expect(view.display()).toBe('');
  });

  it('uses current callbacks and honors cancellation before writing either value', async () => {
    const first = vi.fn();
    const view = await mount({ mode: 'both', defaultValue: 'a', onValueChange: first });
    view.highlight('apple');
    const canceled = vi.fn((_value, details) => details.cancel());
    await view.setProps({ onValueChange: canceled });
    expect(view.type('b').isCanceled).toBe(true);
    expect(view.display()).toBe('apple');
    expect(untrack(view.input.filterQuery)).toBe('a');
    expect(first).not.toHaveBeenCalled();
    await view.setProps({ onValueChange: first });
    view.type('b');
    expect(view.display()).toBe('b');
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('does not acknowledge controlled input proposals', async () => {
    const callback = vi.fn();
    const view = await mount({ value: 'a', mode: 'both', onValueChange: callback });
    view.highlight('apple');
    view.type('b');
    expect(view.display()).toBe('a');
    expect(callback).toHaveBeenCalledWith('b', expect.objectContaining({ reason: 'input-change' }));
  });

  it('takes defaultValue only once and carries same-turn proposals explicitly', async () => {
    const view = await mount({ defaultValue: 'initial', mode: 'both' });
    await view.setProps({ defaultValue: 'replacement' });
    expect(view.display()).toBe('initial');
    untrack(() => {
      view.input.onInputValueChange('a', createChangeEventDetails('none'));
      view.input.onInputValueChange('ab', createChangeEventDetails('none'));
    });
    flush();
    expect(view.display()).toBe('ab');
  });

  it('updates locale and custom filters live; null and static modes bypass filtering', async () => {
    const view = await mount({ locale: 'tr' });
    expect(untrack(() => view.input.filter()?.('Isparta', 'i'))).toBe(false);
    await view.setProps({ locale: 'en' });
    expect(untrack(() => view.input.filter()?.('Isparta', 'i'))).toBe(true);
    const custom = vi.fn(() => false);
    await view.setProps({ filter: custom });
    expect(untrack(view.input.filter)).toBe(custom);
    await view.setProps({ filter: null });
    expect(untrack(view.input.filter)).toBe(null);
    await view.setProps({ filter: custom, mode: 'inline' });
    expect(untrack(view.input.filter)).toBe(null);
    expect(custom).not.toHaveBeenCalled();
  });

  it('uses object labels and the current itemToStringValue for completion', async () => {
    const view = await mount<{ label: string; value: string }>({ mode: 'both' });
    const item = { label: 'Canada', value: 'CA' };
    view.highlight(item);
    expect(view.display()).toBe('Canada');
    await view.setProps({ itemToStringValue: (value) => value.value });
    view.highlight(item, 'imperative-action');
    expect(view.display()).toBe('CA');
  });
});
