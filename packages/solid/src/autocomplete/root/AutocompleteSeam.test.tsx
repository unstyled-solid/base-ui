import { createSignal, flush, untrack, type Accessor } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, waitFor } from '../../../test';
import { Autocomplete } from '../index';
import { AutocompleteFixture, type FixtureProps } from '../test/AutocompleteFixture';
import { useComboboxInputValueContext } from '../../combobox/root/ComboboxRootContext';
import type { AriaComboboxInputValue } from '../../combobox/root/AriaCombobox';
import { Field } from '../../field';

// React Root.tsx 60-64, 78, 94-104 and Value.tsx 17-23 define the
// controlled retirement, public notification, and raw/string display lanes.
describe('Autocomplete/Combobox source completion and input-domain seam', () => {
  const { render, renderProps } = createRenderer();
  function Capture(props: { capture(read: Accessor<AriaComboboxInputValue>): void }) {
    const read = useComboboxInputValueContext();
    untrack(() => props.capture(read));
    return null;
  }

  it.each([0, 12, ['one', 'two'] as const])('preserves raw default input %j while serializing its native display', async (value) => {
    let read!: Accessor<AriaComboboxInputValue>;
    const view = await render(() => <form><Autocomplete.Root defaultValue={value} name="search">
      <Autocomplete.Input /><Capture capture={(current) => { read = current; }} />
      <output data-testid="raw"><Autocomplete.Value /></output>
      <output data-testid="text"><Autocomplete.Value>{(text) => text}</Autocomplete.Value></output>
    </Autocomplete.Root></form>);
    expect(untrack(read)).toBe(value);
    expect(view.getByRole('combobox')).toHaveValue(String(value));
    expect(view.getByTestId('raw').textContent).toBe(Array.isArray(value) ? value.join('') : String(value));
    expect(view.getByTestId('text').textContent).toBe(String(value));
    expect(new FormData(view.container.querySelector('form')!).getAll('search')).toEqual([String(value)]);
  });

  it('retires completion across raw controlled domains even when their query strings are equal', async () => {
    const highlights = vi.fn(); let actions!: Autocomplete.Root.Actions;
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />, {
      value: 12, items: ['12alpha', '12beta'], inline: true, open: true, mode: 'both',
      onItemHighlighted: highlights, actionsRef: (current) => { if (current) actions = current; },
    });
    const input = view.getByTestId('input'); actions.highlightItem('first'); flush();
    expect(input).toHaveValue('12alpha');
    await view.setProps({ value: ['12'] as const }); expect(input).toHaveValue('12');
    await view.setProps({ value: 12 }); expect(input).toHaveValue('12');
    actions.highlightItem('first'); flush(); expect(input).toHaveValue('12alpha');
    expect(highlights.mock.calls.every((args) => args.length === 2)).toBe(true);
    expect(view.getByTestId('input')).toBe(input);
  });

  it.each(['inline', 'both'] as const)('mode=%s retires readOnly round trips but still permits new explicit completion', async (mode) => {
    let actions!: Autocomplete.Root.Actions; const highlighted = vi.fn();
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />, {
      mode, value: 'a', inline: true, open: true, onItemHighlighted: highlighted,
      actionsRef: (current) => { if (current) actions = current; },
    });
    const input = view.getByTestId('input'); actions.highlightItem('first'); flush(); expect(input).toHaveValue('alpha');
    await view.setProps({ readOnly: true }); expect(input).toHaveValue('a'); expect(input).toHaveAttribute('aria-autocomplete', 'none');
    actions.highlightItem('last'); flush(); expect(input).toHaveValue('a');
    await view.setProps({ readOnly: false }); expect(input).toHaveValue('a');
    actions.highlightItem('first'); flush(); expect(input).toHaveValue('alpha');
    expect(highlighted.mock.calls.every((args) => args.length === 2)).toBe(true);
  });

  it('allows later asynchronous candidates to complete after an external scope transition', async () => {
    const highlighted = vi.fn();
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />, {
      value: 'a', items: [], inline: true, open: true, mode: 'both', autoHighlight: 'always', onItemHighlighted: highlighted,
    });
    await view.setProps({ value: 'be' }); expect(view.getByTestId('input')).toHaveValue('be');
    await view.setProps({ items: ['beta'] });
    await waitFor(() => expect(view.getByTestId('input')).toHaveValue('beta'));
    expect(highlighted).toHaveBeenLastCalledWith('beta', expect.objectContaining({ reason: 'none', index: 0 }));
    expect(highlighted.mock.calls.every((args) => args.length === 2)).toBe(true);
  });

  it('reports scope-transition highlights publicly without completing the externally supplied text', async () => {
    const highlighted = vi.fn(); let actions!: Autocomplete.Root.Actions;
    const view = await renderProps<FixtureProps>((props) => <AutocompleteFixture {...props} />, {
      value: 'a', mode: 'both', inline: true, open: true, onItemHighlighted: highlighted,
      actionsRef: (current) => { if (current) actions = current; },
    });
    actions.highlightItem('first'); flush(); highlighted.mockClear();
    await view.setProps({ value: 'be' });
    expect(highlighted).toHaveBeenLastCalledWith('beta', expect.objectContaining({ reason: 'none', index: 0 }));
    expect(view.getByTestId('input')).toHaveValue('be');
    await view.setProps({ value: 'a' });
    expect(highlighted).toHaveBeenLastCalledWith('alpha', expect.objectContaining({ reason: 'none', index: 0 }));
    expect(view.getByTestId('input')).toHaveValue('a');
    expect(highlighted.mock.calls.every((args) => args.length === 2)).toBe(true);
  });

  it.each(['ignore', 'accept', 'transform', 'cancel'] as const)('submits only the committed controlled value on item press: %s', async (policy) => {
    const submitted = vi.fn();
    const view = await render(() => {
      const [value, setValue] = createSignal('a');
      return <form onSubmit={(event) => { event.preventDefault(); submitted(new FormData(event.currentTarget).getAll('search')); }}>
        <AutocompleteFixture value={value()} defaultOpen name="search" submitOnItemClick onValueChange={(next, details) => {
          if (policy === 'cancel') details.cancel();
          else if (policy !== 'ignore') setValue(policy === 'transform' ? next.toUpperCase() : next);
        }} />
      </form>;
    });
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    expect(submitted).toHaveBeenCalledExactlyOnceWith([policy === 'accept' ? 'alpha' : policy === 'transform' ? 'ALPHA' : 'a']);
  });

  it('does not run queued native reset or autofill proposals after root disposal', async () => {
    const changed = vi.fn();
    const view = await render(() => <form><AutocompleteFixture defaultValue="a" name="search" onValueChange={changed} /></form>);
    const hidden = view.getByRole('textbox', { hidden: true });
    fireEvent.input(hidden, { target: { value: 'beta' }, inputType: 'insertReplacementText' });
    view.container.querySelector('form')!.reset(); view.unmount();
    const callsBeforeDisposal = changed.mock.calls.length;
    await Promise.resolve(); flush(); await Promise.resolve();
    expect(changed).toHaveBeenCalledTimes(callsBeforeDisposal);
  });

  it.each([0, ['one', 'two'] as const])('native reset restores the raw lifetime default %j and pristine field projection', async (value) => {
    const changed = vi.fn(); let read!: Accessor<AriaComboboxInputValue>;
    const view = await render(() => <form><Field.Root name="search"><Autocomplete.Root defaultValue={value} onValueChange={changed}>
      <Autocomplete.Input /><Capture capture={(current) => { read = current; }} />
    </Autocomplete.Root></Field.Root><button type="reset">Reset</button></form>);
    const input = view.getByRole('combobox');
    fireEvent.input(input, { target: { value: 'edited' }, inputType: 'insertText' }); flush();
    expect(input).toHaveAttribute('data-dirty'); changed.mockClear();
    await view.user.click(view.getByText('Reset'));
    expect(untrack(read)).toBe(value); expect(input).not.toHaveAttribute('data-dirty');
    expect(new FormData(view.container.querySelector('form')!).getAll('search')).toEqual([String(value)]);
    expect(changed).toHaveBeenCalledExactlyOnceWith(String(value), expect.objectContaining({ reason: 'none', event: expect.objectContaining({ type: 'reset' }) }));
  });
});
