import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, waitFor } from '../../../test';
import type { ComponentProps, JSX } from '@solidjs/web';
import { Autocomplete } from '../index';
import { Field } from '../../field/index';
import { Form } from '../../form/index';
import { Input } from '../../input/index';
import { Switch } from '../../switch/index';
import { AutocompleteFixture, type FixtureProps } from '../test/AutocompleteFixture';

// Pinned AutocompleteRoot.test.tsx: Form, Field, submitOnItemClick and autofill.
// All naming/validation/submission/reset work is performed by the real shared engine.
describe('Autocomplete forms', () => {
  const { render, renderProps } = createRenderer();

  it.each(['root', 'field', 'inline'] as const)('submits typed text once with %s naming', async (kind) => {
    const submitted = vi.fn();
    const view = await render(() => <Form onSubmit={(event) => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget).getAll('query'));
    }}>
      <Field.Root name={kind === 'field' ? 'query' : undefined}>
        <AutocompleteFixture name={kind !== 'field' ? 'query' : undefined} inline={kind === 'inline'} />
      </Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    const input = view.getByTestId('input');
    expect(input).toHaveAttribute('name', 'query');
    expect(view.getByRole('textbox', { hidden: true })).not.toHaveAttribute('name');
    await view.user.type(input, 'appl');
    expect(input).toHaveValue('appl');
    await view.user.click(view.getByText('Submit'));
    expect(submitted).toHaveBeenLastCalledWith(['appl']);
  });

  it('submits a default popup value before opening, then transfers field-aware input edits to the hidden control', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onSubmit={(event) => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget).getAll('search'));
    }}><Field.Root name="search">
      <Autocomplete.Root items={['alpha', 'alpine']} defaultValue="alpha">
        <Autocomplete.Trigger data-testid="trigger"><Autocomplete.Value /></Autocomplete.Trigger>
        <Autocomplete.Portal><Autocomplete.Positioner><Autocomplete.Popup>
          <Autocomplete.Input render={(props) => <Input {...props as ComponentProps<typeof Input>} data-testid="input" />} />
          <Autocomplete.List>{(item: string) => <Autocomplete.Item value={item}>{item}</Autocomplete.Item>}</Autocomplete.List>
        </Autocomplete.Popup></Autocomplete.Positioner></Autocomplete.Portal>
      </Autocomplete.Root>
    </Field.Root><button type="submit">Submit</button></Form>);
    await view.user.click(view.getByText('Submit'));
    expect(submitted).toHaveBeenLastCalledWith(['alpha']);
    await view.user.click(view.getByTestId('trigger'));
    const input = await view.findByTestId('input');
    expect(input).not.toHaveAttribute('name');
    await view.user.clear(input);
    await view.user.type(input, 'al');
    await view.user.click(view.getByRole('option', { name: 'alpine' }));
    expect(view.getByTestId('trigger')).toHaveTextContent('alpine');
    await view.user.click(view.getByText('Submit'));
    expect(submitted).toHaveBeenLastCalledWith(['alpine']);
  });

  it.each([false, true])('submitOnItemClick=%s controls highlighted Enter submission', async (submitOnItemClick) => {
    const submitted = vi.fn();
    const view = await render(() => <form onSubmit={(event) => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget).getAll('q'));
    }}><AutocompleteFixture name="q" submitOnItemClick={submitOnItemClick} autoHighlight />
      <button type="submit">Submit</button></form>);
    await view.user.type(view.getByTestId('input'), 'al');
    await view.user.keyboard('{Enter}');
    expect(submitted).toHaveBeenCalledTimes(submitOnItemClick ? 1 : 0);
    if (submitOnItemClick) expect(submitted).toHaveBeenCalledWith(['alpha']);
  });

  it.each(['pointer', 'list', 'enter'] as const)('submits the committed value through %s activation', async (activation) => {
    const submitted = vi.fn();
    const view = await render(() => <form onSubmit={(event) => {
      event.preventDefault();
      submitted(new FormData(event.currentTarget).get('q'));
    }}><AutocompleteFixture name="q" submitOnItemClick /></form>);
    const input = view.getByTestId('input');
    await view.user.type(input, 'al');
    if (activation === 'pointer') await view.user.click(view.getByRole('option', { name: 'alpha' }));
    else {
      await view.user.keyboard('{ArrowDown}');
      expect(view.getByRole('option', { name: 'alpha' })).toHaveAttribute('data-highlighted');
      if (activation === 'list') view.getByRole('listbox').focus();
      await waitFor(() => expect(input).toHaveFocus());
      await view.user.keyboard('{Enter}');
    }
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted).toHaveBeenCalledWith('alpha');
  });

  it('uses the actual input form when another field-aware control owns validation refs', async () => {
    const submit = vi.fn();
    const view = await render(() => <><form onSubmit={(event) => { event.preventDefault(); submit(); }}>
      <AutocompleteFixture submitOnItemClick />
    </form><Switch.Root aria-label="Unrelated switch" /></>);
    await view.user.type(view.getByTestId('input'), 'a');
    await view.user.click(view.getByRole('option', { name: 'alpha' }));
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('unhighlighted Enter retains native submission, submitOnItemClick=%s', async (submitOnItemClick) => {
    const submit = vi.fn();
    const view = await render(() => <form onSubmit={(event) => {
      event.preventDefault(); submit(new FormData(event.currentTarget).get('q'));
    }}><AutocompleteFixture name="q" submitOnItemClick={submitOnItemClick} />
      <button type="submit">Submit</button></form>);
    await view.user.type(view.getByTestId('input'), 'xyz');
    await view.user.keyboard('{Enter}');
    expect(submit).toHaveBeenCalledExactlyOnceWith('xyz');
  });

  it.each(['normal', 'readOnly', 'disabled'] as const)('hidden autofill respects %s state', async (state) => {
    const callback = vi.fn();
    const view = await render(() => <Field.Root name="auto"><AutocompleteFixture
      readOnly={state === 'readOnly'} disabled={state === 'disabled'} onValueChange={callback} />
    </Field.Root>);
    // React's synthetic onChange maps to native input in Solid, including autofill.
    fireEvent.input(view.getByRole('textbox', { hidden: true }), {
      target: { value: 'beta' }, inputType: 'insertReplacementText',
    });
    if (state === 'normal') await waitFor(() => expect(view.getByTestId('input')).toHaveValue('beta'));
    else {
      await Promise.resolve();
      expect(view.getByTestId('input')).toHaveValue('');
      expect(callback).not.toHaveBeenCalled();
    }
  });

  it('keeps browser autoComplete on the visible input only', async () => {
    const view = await render(() => <Autocomplete.Root name="search">
      <Autocomplete.Input autocomplete="on" />
    </Autocomplete.Root>);
    expect(view.getByRole('combobox')).toHaveAttribute('autocomplete', 'on');
    expect(view.getByRole('combobox')).toHaveAttribute('name', 'search');
    expect(view.getByRole('textbox', { hidden: true })).not.toHaveAttribute('name');
    expect(view.getByRole('textbox', { hidden: true })).not.toHaveAttribute('autocomplete');
    expect(view.getByRole('textbox', { hidden: true })).toHaveAttribute('id');
  });

  it('resets uncontrolled typed text to its lifetime default', async () => {
    const view = await render(() => <form><AutocompleteFixture name="q" defaultValue="alpha" />
      <button type="reset">Reset</button></form>);
    const input = view.getByTestId('input');
    await view.user.clear(input);
    await view.user.type(input, 'beta');
    await view.user.click(view.getByText('Reset'));
    await waitFor(() => expect(input).toHaveValue('alpha'));
  });

  it('required empty submission reports native Field validation', async () => {
    const view = await render(() => <Form><Field.Root name="q">
      <Autocomplete.Root required><Autocomplete.Input /></Autocomplete.Root>
      <Field.Error match="valueMissing">Required</Field.Error>
    </Field.Root><button type="submit">Submit</button></Form>);
    expect(view.getByRole('combobox')).toHaveAttribute('required');
    expect(view.queryByText('Required')).toBe(null);
    await view.user.click(view.getByText('Submit'));
    expect(view.getByText('Required')).toBeInTheDocument();
  });

  it('clears external errors when input changes', async () => {
    const view = await render(() => <Form errors={{ q: 'Server error' }}><Field.Root name="q">
      <AutocompleteFixture /><Field.Error />
    </Field.Root></Form>);
    expect(view.getByText('Server error')).toBeInTheDocument();
    expect(view.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
    await view.user.type(view.getByTestId('input'), 'new');
    await waitFor(() => expect(view.queryByText('Server error')).toBe(null));
    expect(view.getByTestId('input')).not.toHaveAttribute('aria-invalid');
  });

  it('tracks focused, touched, dirty and filled state using input text', async () => {
    const view = await render(() => <><Field.Root><AutocompleteFixture /></Field.Root><button>Outside</button></>);
    const input = view.getByTestId('input');
    for (const attribute of ['focused', 'touched', 'dirty', 'filled']) expect(input).not.toHaveAttribute(`data-${attribute}`);
    await view.user.click(input);
    expect(input).toHaveAttribute('data-focused', '');
    await view.user.type(input, 'test');
    expect(input).toHaveAttribute('data-dirty', '');
    expect(input).toHaveAttribute('data-filled', '');
    await view.user.click(view.getByText('Outside'));
    expect(input).toHaveAttribute('data-touched', '');
    expect(input).not.toHaveAttribute('data-focused');
  });

  it('marks a default value filled and mirrors externally invalid state', async () => {
    const view = await render(() => <Field.Root invalid><AutocompleteFixture defaultValue="initial" /></Field.Root>);
    expect(view.getByTestId('input')).toHaveAttribute('data-filled');
    expect(view.getByTestId('input')).toHaveAttribute('data-invalid', '');
  });

  it.each(['onChange', 'onBlur', 'onSubmit'] as const)('validates input text with validationMode=%s', async (validationMode) => {
    const view = await render(() => <Form><Field.Root validationMode={validationMode}
      validate={(value) => value === 'invalid' ? 'Error' : null}>
      <AutocompleteFixture required /><Field.Error />
    </Field.Root><button type="submit">Submit</button></Form>);
    const input = view.getByTestId('input');
    expect(input).not.toHaveAttribute('aria-invalid');
    await view.user.type(input, 'invalid');
    if (validationMode === 'onBlur') {
      expect(input).not.toHaveAttribute('data-valid');
      expect(input).not.toHaveAttribute('data-invalid');
    }
    if (validationMode === 'onBlur') { input.blur(); }
    if (validationMode === 'onSubmit') await view.user.click(view.getByText('Submit'));
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
    await view.user.clear(input);
    await view.user.type(input, 'valid');
    input.blur();
    await waitFor(() => expect(input).not.toHaveAttribute('aria-invalid'));
    expect(input).toHaveAttribute('data-valid');
  });

  it('links the input with a non-native Field.Label and Field.Description', async () => {
    const view = await render(() => <Field.Root><AutocompleteFixture />
      <Field.Label nativeLabel={false} render={(props) => <span {...props as JSX.HTMLAttributes<HTMLSpanElement>} />} data-testid="label">Search</Field.Label>
      <Field.Description data-testid="description">Suggestions</Field.Description>
    </Field.Root>);
    expect(view.getByTestId('input')).toHaveAttribute('aria-labelledby', view.getByTestId('label').id);
    expect(view.getByTestId('input')).toHaveAttribute('aria-describedby', view.getByTestId('description').id);
  });

  it('reads replacement controlled callbacks and cancellation through the real input', async () => {
    const first = vi.fn();
    const second = vi.fn((_value, details) => details.cancel());
    const view = await renderProps((props: FixtureProps) => <AutocompleteFixture {...props} />,
      { value: 'a', onValueChange: first });
    await view.setProps({ onValueChange: second });
    await view.user.type(view.getByTestId('input'), 'b');
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
    expect(view.getByTestId('input')).toHaveValue('a');
  });

  it('onSubmit validation revalidates every edit after the first empty submission', async () => {
    const view = await render(() => <Form><Field.Root validate={(value) => value === 'one' ? 'error' : null}>
      <AutocompleteFixture required items={['one', 'two']} />
    </Field.Root><button type="submit">submit</button></Form>);
    const input = view.getByTestId('input');
    expect(input).not.toHaveAttribute('aria-invalid');
    await view.user.click(view.getByText('submit'));
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await view.user.type(input, 'two');
    expect(input).not.toHaveAttribute('aria-invalid');
    await view.user.clear(input);
    await view.user.type(input, 'one');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await view.user.clear(input);
    await view.user.type(input, 'three');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('onBlur validation invokes a constant validator for empty input', async () => {
    const view = await render(() => <Field.Root validationMode="onBlur" validate={() => 'error'}>
      <Autocomplete.Root><Autocomplete.Input /></Autocomplete.Root>
    </Field.Root>);
    const input = view.getByRole('combobox');
    expect(input).not.toHaveAttribute('aria-invalid');
    input.focus();
    input.blur();
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'));
  });

  it('first successful required blur marks valid without an earlier invalid cycle', async () => {
    const view = await render(() => <Field.Root validationMode="onBlur"><AutocompleteFixture required /></Field.Root>);
    const input = view.getByTestId('input');
    expect(input).not.toHaveAttribute('data-valid');
    expect(input).not.toHaveAttribute('data-invalid');
    await view.user.type(input, 'ok');
    input.blur();
    await waitFor(() => expect(input).toHaveAttribute('data-valid', ''));
    expect(input).not.toHaveAttribute('data-invalid');
  });

  it('Enter submits an open list with no highlighted item', async () => {
    const submitted = vi.fn();
    const view = await render(() => <Form onSubmit={(event) => { event.preventDefault(); submitted(); }}>
      <Field.Root name="search"><AutocompleteFixture openOnInputClick /></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    const input = view.getByTestId('input');
    await view.user.click(input);
    expect(view.getByRole('listbox')).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-activedescendant');
    await view.user.keyboard('{Enter}');
    expect(submitted).toHaveBeenCalledTimes(1);
  });
});
