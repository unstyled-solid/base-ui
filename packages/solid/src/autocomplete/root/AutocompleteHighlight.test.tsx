import { describe, expect, it, vi } from 'vitest';
import { createMemo, createSignal, flush, Loading } from 'solid-js';
import { createRenderer, fireEvent, flushMicrotasks, waitFor } from '../../../test';
import { Autocomplete } from '../index';
import { AutocompleteFixture, type FixtureProps } from '../test/AutocompleteFixture';

// Source: Root.test.tsx autoHighlight (including every asynchronous variant),
// keepHighlight and actionsRef:highlightItem. Candidate scheduling stays in Combobox.
describe('Autocomplete highlight', () => {
  const { render, renderProps } = createRenderer();
  const moveOverOption = (element: HTMLElement) => {
    // The source stationary-WebKit guard intentionally ignores zero deltas.
    // Both testing-library hover and Playwright WebKit hover report zero even
    // for a new target; model a deliberate move rather than bypassing the guard.
    const move = new MouseEvent('mousemove', { bubbles: true });
    Object.defineProperty(move, 'movementX', { value: 1 });
    fireEvent(element, move);
  };

  it.each([false, true, 'always'] as const)('autoHighlight=%s opening, typing and filtering', async (autoHighlight) => {
    const callback = vi.fn();
    const view = await render(() => <AutocompleteFixture items={['feature', 'fix']}
      openOnInputClick autoHighlight={autoHighlight} onItemHighlighted={callback} />);
    const input = view.getByTestId('input');
    await view.user.click(input);
    expect(input.hasAttribute('aria-activedescendant')).toBe(autoHighlight === 'always');
    await view.user.type(input, 'f');
    expect(view.getByRole('option', { name: 'feature' }).hasAttribute('data-highlighted')).toBe(Boolean(autoHighlight));
    if (autoHighlight) {
      expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: 'feature' }).id);
      expect(callback).toHaveBeenLastCalledWith('feature', expect.objectContaining({ reason: 'none' }));
    }
    await view.user.type(input, 'i');
    const fix = view.getByRole('option', { name: 'fix' });
    if (autoHighlight) {
      expect(input).toHaveAttribute('aria-activedescendant', fix.id);
      expect(callback).toHaveBeenLastCalledWith('fix', expect.objectContaining({ reason: 'none' }));
    } else expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it.each([false, true])('ArrowDown opening with autoHighlight=%s', async (autoHighlight) => {
    const view = await render(() => <AutocompleteFixture autoHighlight={autoHighlight} />);
    const input = view.getByTestId('input');
    await view.user.click(input);
    await view.user.keyboard('{ArrowDown}');
    expect(input.hasAttribute('aria-activedescendant')).toBe(autoHighlight);
    if (!autoHighlight) await view.user.keyboard('{ArrowDown}');
    expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
    expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: 'alpha' }).id);
  });

  it('retains a highlight while clearing typed input and after trailing whitespace', async () => {
    // Source retains an empty query only with openOnInputClick enabled.
    const view = await render(() => <AutocompleteFixture autoHighlight openOnInputClick />);
    const input = view.getByTestId('input');
    await view.user.type(input, 'beta');
    const id = input.getAttribute('aria-activedescendant');
    expect(id).not.toBe(null);
    expect(view.getByRole('listbox')).toBeInTheDocument();
    await view.user.type(input, ' ');
    expect(input).toHaveAttribute('aria-activedescendant', id!);
    await view.user.clear(input);
    expect(view.getByRole('listbox')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-activedescendant', id!);
  });

  it.each([false, true])('highlights asynchronous results while focused, inline=%s', async (inline) => {
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { items: [], autoHighlight: true, inline, defaultOpen: inline, filter: null });
    const input = view.getByTestId('input');
    await view.user.type(input, '32');
    await view.setProps({ items: ['32', '320'] });
    const option = view.getByRole('option', { name: '32' });
    expect(option).toHaveAttribute('data-highlighted');
    expect(input).toHaveAttribute('aria-activedescendant', option.id);
    await view.user.keyboard('{Enter}');
    expect(input).toHaveValue('32');
  });

  it('keeps the settled input during host Loading and highlights only committed async candidates', async () => {
    let resolve!: (items: readonly string[]) => void;
    let request!: () => void;
    const pending = new Promise<readonly string[]>((done) => { resolve = done; });
    const view = await render(() => {
      const [loading, setLoading] = createSignal(false);
      const items = createMemo<readonly string[]>(() => loading() ? pending : []);
      request = () => { setLoading(true); };
      return <Loading fallback={<span>Loading suggestions</span>}>
        <Autocomplete.Root items={items()} mode="both" inline open autoHighlight filter={null}>
          <Autocomplete.Input data-testid="input" />
          <Autocomplete.List>{(item: string) => <Autocomplete.Item value={item}>{item}</Autocomplete.Item>}</Autocomplete.List>
        </Autocomplete.Root>
      </Loading>;
    });
    const input = view.getByTestId('input');
    await view.user.type(input, '32');
    request();
    await flushMicrotasks();
    expect(view.getByTestId('input')).toBe(input);
    expect(input).toHaveValue('32');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(view.queryByText('Loading suggestions')).toBe(null);
    resolve(['32', '320']);
    await waitFor(() => expect(view.getByRole('option', { name: '32' })).toHaveAttribute('data-highlighted'));
    expect(view.getByTestId('input')).toBe(input);
    expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: '32' }).id);
  });

  it.each([true, 'always'] as const)('asynchronous inline results after blur with autoHighlight=%s', async (autoHighlight) => {
    const view = await renderProps<FixtureProps>((props) => <><AutocompleteFixture {...props} /><button>Blur target</button></>,
      { items: [], autoHighlight, inline: true, defaultOpen: true });
    const input = view.getByTestId('input');
    await view.user.type(input, '32');
    await view.user.click(view.getByText('Blur target'));
    await view.setProps({ items: ['32'] });
    const option = view.getByRole('option');
    expect(option.hasAttribute('data-highlighted')).toBe(autoHighlight === 'always');
    expect(input.getAttribute('aria-activedescendant')).toBe(autoHighlight === 'always' ? option.id : null);
  });

  it('discards the pending highlight request when Clear empties the query', async () => {
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { items: [], autoHighlight: true, filter: null });
    const input = view.getByTestId('input');
    await view.user.type(input, '32');
    await view.user.click(view.getByTestId('clear'));
    await view.setProps({ items: ['32'] });
    expect(input).toHaveValue('');
    expect(view.getByRole('option')).not.toHaveAttribute('data-highlighted');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it.each([false, true])('discards the pending request on close/reopen with keepMounted=%s', async (keepMounted) => {
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { items: [], autoHighlight: true, filter: null, keepMounted });
    const input = view.getByTestId('input');
    await view.user.type(input, '32');
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
    await view.user.click(view.getByTestId('trigger'));
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'true'));
    await view.setProps({ items: ['32'] });
    expect(input).toHaveValue('32');
    expect(view.getByRole('option')).not.toHaveAttribute('data-highlighted');
    expect(input).not.toHaveAttribute('aria-activedescendant');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('discards the request when a controlled popup closes', async () => {
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />,
      { items: [], autoHighlight: true, filter: null, open: true });
    const input = view.getByTestId('input');
    await view.user.type(input, '32');
    await view.setProps({ open: false });
    await view.setProps({ open: true });
    await view.setProps({ items: ['32'] });
    expect(input).toHaveValue('32');
    expect(view.getByRole('option')).not.toHaveAttribute('data-highlighted');
  });

  it('keeps pointer highlight on leave and continues keyboard navigation from it', async () => {
    const view = await render(() => <AutocompleteFixture autoHighlight keepHighlight />);
    const input = view.getByTestId('input');
    await view.user.type(input, 'a');
    const alpine = view.getByRole('option', { name: 'alpine' });
    await view.user.hover(alpine);
    moveOverOption(alpine);
    await waitFor(() => expect(alpine).toHaveAttribute('data-highlighted'));
    await view.user.unhover(alpine);
    expect(alpine).toHaveAttribute('data-highlighted');
    await view.user.keyboard('{ArrowDown}');
    expect(view.getByRole('option', { name: 'beta' })).toHaveAttribute('data-highlighted');
  });

  it('always keeps the latest pointer highlight after outside blur', async () => {
    const view = await render(() => <><AutocompleteFixture inline open autoHighlight="always" keepHighlight />
      <button>Outside</button></>);
    await view.user.click(view.getByTestId('input'));
    const alpine = view.getByRole('option', { name: 'alpine' });
    await view.user.hover(alpine);
    moveOverOption(alpine);
    await waitFor(() => expect(alpine).toHaveAttribute('data-highlighted'));
    expect(alpine).toHaveAttribute('data-highlighted');
    expect(view.getByTestId('input')).toHaveAttribute('aria-activedescendant', alpine.id);
    await view.user.click(view.getByText('Outside'));
    expect(alpine).toHaveAttribute('data-highlighted');
    expect(view.getByTestId('input')).toHaveAttribute('aria-activedescendant', alpine.id);
    expect(view.getByRole('option', { name: 'alpha' })).not.toHaveAttribute('data-highlighted');
  });

  it('imperative inline navigation clears its cursor and reports imperative-action', async () => {
    let actions!: Autocomplete.Root.Actions;
    const highlighted = vi.fn();
    const view = await render(() => <AutocompleteFixture inline actionsRef={(value) => { if (value) actions = value; }}
      onItemHighlighted={highlighted} />);
    for (const [target, label] of [['next', 'alpha'], ['next', 'alpine'], ['none', undefined], ['next', 'alpha']] as const) {
      actions.highlightItem(target);
      flush();
      if (label) {
        const option = view.getByRole('option', { name: label });
        expect(option).toHaveAttribute('data-highlighted');
        expect(view.getByTestId('input')).toHaveAttribute('aria-activedescendant', option.id);
      }
      else expect(view.getByTestId('input')).not.toHaveAttribute('aria-activedescendant');
      expect(highlighted).toHaveBeenLastCalledWith(label, expect.objectContaining({ reason: 'imperative-action' }));
    }
  });

  it('none is a no-op under autoHighlight=always, without transient callbacks', async () => {
    let actions!: Autocomplete.Root.Actions;
    const highlighted = vi.fn();
    const view = await render(() => <AutocompleteFixture inline autoHighlight="always"
      actionsRef={(value) => { if (value) actions = value; }} onItemHighlighted={highlighted} />);
    await waitFor(() => expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted'));
    highlighted.mockClear();
    actions.highlightItem('none');
    flush();
    expect(highlighted).not.toHaveBeenCalled();
    expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
    expect(view.getByTestId('input')).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: 'alpha' }).id);
  });

  it.each([['n', 'p'], ['j', 'k']])('supports custom Ctrl+%s / Ctrl+%s bindings and Enter commits', async (next, previous) => {
    let actions!: Autocomplete.Root.Actions;
    const view = await render(() => <Autocomplete.Root items={['alpha', 'beta']} open
      actionsRef={(value) => { if (value) actions = value; }}>
      <Autocomplete.Input onKeyDown={(event) => {
        if (!event.ctrlKey || event.altKey || event.metaKey) return;
        if (event.key !== next && event.key !== previous) return;
        event.preventDefault();
        actions.highlightItem(event.key === next ? 'next' : 'previous');
      }} />
      <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup><Autocomplete.List>
        {(item: string) => <Autocomplete.Item value={item}>{item}</Autocomplete.Item>}
      </Autocomplete.List></Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
    </Autocomplete.Root>);
    const input = view.getByRole('combobox');
    await view.user.click(input);
    await view.user.keyboard(`{Control>}${previous}{/Control}`);
    expect(view.getByRole('option', { name: 'beta' })).toHaveAttribute('data-highlighted');
    expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: 'beta' }).id);
    await view.user.keyboard(`{Control>}${next}{/Control}`);
    expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
    expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: 'alpha' }).id);
    await view.user.keyboard('{Enter}');
    expect(input).toHaveValue('alpha');
  });

  it('always highlights immediately on defaultOpen without an input interaction', async () => {
    const view = await render(() => <AutocompleteFixture autoHighlight="always" defaultOpen />);
    const first = view.getByRole('option', { name: 'alpha' });
    expect(first).toHaveAttribute('data-highlighted');
    expect(view.getByTestId('input')).toHaveAttribute('aria-activedescendant', first.id);
  });

  it('typing opens and notifies the auto-highlight before any trigger interaction', async () => {
    const highlighted = vi.fn();
    const view = await render(() => <AutocompleteFixture autoHighlight onItemHighlighted={highlighted} />);
    await view.user.type(view.getByTestId('input'), 'a');
    expect(highlighted.mock.calls.length).toBeGreaterThan(0);
    expect(highlighted).toHaveBeenLastCalledWith('alpha', expect.objectContaining({ reason: 'none' }));
    expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
  });

  it('keeps an automatic highlight on pointer leave without first hovering an item', async () => {
    const view = await render(() => <AutocompleteFixture items={['apple', 'banana']} autoHighlight keepHighlight />);
    const input = view.getByTestId('input');
    await view.user.type(input, 'ap');
    const apple = view.getByRole('option', { name: 'apple' });
    expect(apple).toHaveAttribute('data-highlighted');
    apple.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: input }));
    // Observe the native leave handler after its staged writes commit.
    await Promise.resolve();
    expect(apple).toHaveAttribute('data-highlighted');
  });

  it('keyboard inline navigation clears both the highlight and relative action cursor', async () => {
    let actions!: Autocomplete.Root.Actions;
    const view = await render(() => <AutocompleteFixture inline actionsRef={(value) => { if (value) actions = value; }} />);
    const input = view.getByTestId('input');
    await view.user.click(input);
    await view.user.keyboard('{ArrowDown}{ArrowDown}');
    const second = view.getByRole('option', { name: 'alpine' });
    expect(second).toHaveAttribute('data-highlighted');
    actions.highlightItem('none');
    await waitFor(() => expect(second).not.toHaveAttribute('data-highlighted'));
    actions.highlightItem('next');
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: 'alpha' }).id));
  });

  it('static items retain the first highlight and ARIA link through trailing whitespace', async () => {
    const view = await render(() => <Autocomplete.Root autoHighlight>
      <Autocomplete.Input />
      <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup><Autocomplete.List>
        <Autocomplete.Item value="new york">new york</Autocomplete.Item>
        <Autocomplete.Item value="new york city">new york city</Autocomplete.Item>
        <Autocomplete.Item value="newcastle">newcastle</Autocomplete.Item>
      </Autocomplete.List></Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
    </Autocomplete.Root>);
    const input = view.getByRole('combobox');
    await view.user.type(input, 'new');
    const first = view.getByRole('option', { name: 'new york' });
    expect(first).toHaveAttribute('data-highlighted');
    expect(input).toHaveAttribute('aria-activedescendant', first.id);
    await view.user.type(input, ' ');
    expect(first).toHaveAttribute('data-highlighted');
    expect(input).toHaveAttribute('aria-activedescendant', first.id);
  });

  it('Ctrl+N twice then Ctrl+P follows the same three-item cursor as arrow navigation', async () => {
    let actions!: Autocomplete.Root.Actions;
    const view = await render(() => <Autocomplete.Root items={['Apple', 'Banana', 'Cherry']} open
      actionsRef={(value) => { if (value) actions = value; }}>
      <Autocomplete.Input onKeyDown={(event) => {
        if (!event.ctrlKey || event.altKey || event.metaKey || !['n', 'p'].includes(event.key)) return;
        event.preventDefault();
        actions.highlightItem(event.key === 'n' ? 'next' : 'previous');
      }} />
      <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup><Autocomplete.List>
        {(item: string) => <Autocomplete.Item value={item}>{item}</Autocomplete.Item>}
      </Autocomplete.List></Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
    </Autocomplete.Root>);
    const input = view.getByRole('combobox');
    await view.user.click(input);
    for (const [key, label] of [['n', 'Apple'], ['n', 'Banana'], ['p', 'Apple']]) {
      await view.user.keyboard(`{Control>}${key}{/Control}`);
      expect(input).toHaveAttribute('aria-activedescendant', view.getByRole('option', { name: label }).id);
    }
    await view.user.keyboard('{Enter}');
    expect(input).toHaveValue('Apple');
  });
});
