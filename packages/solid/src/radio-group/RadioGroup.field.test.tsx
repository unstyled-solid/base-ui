import { describe, expect, it, vi } from 'vitest';
import { Portal } from '@solidjs/web';
import { Show } from 'solid-js';
import { createRenderer, browserCase, fireEvent } from '../../test';
import { RadioGroup } from './RadioGroup';
import { Radio } from '../radio';
import { Field } from '../field';
import { Form } from '../form';
import { Fieldset } from '../fieldset';
import { useFieldRootContext } from '../internals/field-root-context';

function FieldObservation() {
  const field = useFieldRootContext();
  return <output data-testid="field-state" data-dirty={field?.state.dirty ? '' : undefined}
    data-filled={field?.state.filled ? '' : undefined}>{JSON.stringify(field?.validityData.initialValue)}</output>;
}

// Deliberately use real public wrappers: fixtures cannot establish field/form parity.
describe('RadioGroup field integration', () => {
  const { render, renderProps } = createRenderer();

  it('unregisters every native input without losing inputless custom validation', async () => {
    const submit = vi.fn();
    const validate = vi.fn(() => 'always invalid');
    const view = await renderProps((props: { mounted: boolean }) => <Form onFormSubmit={submit}>
      <Field.Root name="choice" validate={validate}>
        <RadioGroup required>{props.mounted && <Radio.Root value="a" />}</RadioGroup>
        <Field.Error data-testid="error" />
      </Field.Root><button type="submit">Submit</button>
    </Form>, { mounted: true });
    await view.setProps({ mounted: false });
    await view.user.click(view.getByRole('button'));
    expect(submit).not.toHaveBeenCalled();
    expect(validate).toHaveBeenCalled();
    expect(view.getByTestId('error')).toHaveTextContent('always invalid');
  });

  it('unblocks required validation after all radios unmount', async () => {
    const submit = vi.fn();
    const view = await renderProps((props: { mounted: boolean }) => <Form onFormSubmit={submit}>
      <Field.Root name="choice"><RadioGroup required>
        {props.mounted && <Radio.Root value="a" />}
      </RadioGroup></Field.Root><button type="submit">Submit</button>
    </Form>, { mounted: true });
    await view.user.click(view.getByRole('button'));
    expect(submit).not.toHaveBeenCalled();
    await view.setProps({ mounted: false });
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: null });
  });

  it('projects only successful selected inputs while retaining a disabled checked required group', async () => {
    const submit = vi.fn();
    const view = await renderProps((props: { disabled: boolean }) => <Form onFormSubmit={submit}>
      <Field.Root name="choice"><RadioGroup name="ignored" required defaultValue="a">
        <Radio.Root value="a" disabled={props.disabled} aria-label="A" /><Radio.Root value="b" />
      </RadioGroup></Field.Root><button type="submit">Submit</button>
    </Form>, { disabled: false });
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: 'a' });
    await view.setProps({ disabled: true });
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: null });
    await view.setProps({ disabled: false });
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: 'a' });
  });

  it.each(['root', 'input', 'arrow'] as const)('does not touch, dirty, or fill the field for canceled %s activation', async (activation) => {
    const view = await render(() => <Field.Root data-testid="field">
      <RadioGroup onValueChange={(_value, details) => details.cancel()}>
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" />
      </RadioGroup>
    </Field.Root>);
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    if (activation === 'arrow') { a.focus(); await view.user.keyboard('{ArrowDown}'); expect(b).toHaveFocus(); }
    else await view.user.click(activation === 'root' ? b : b.nextElementSibling!);
    expect(a).toHaveAttribute('aria-checked', 'false');
    expect(b).toHaveAttribute('aria-checked', 'false');
    expect(a.nextElementSibling).not.toBeChecked();
    expect(b.nextElementSibling).not.toBeChecked();
    const group = view.getByRole('radiogroup');
    expect(group).not.toHaveAttribute('data-touched');
    expect(group).not.toHaveAttribute('data-dirty');
    expect(group).not.toHaveAttribute('data-filled');
    const field = view.getByTestId('field');
    expect(field).not.toHaveAttribute('data-touched');
    expect(field).not.toHaveAttribute('data-dirty');
    expect(field).not.toHaveAttribute('data-filled');
  });

  it('does not reacquire disabled focus and reacquires on arrow navigation to an enabled sibling', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Field.Root data-testid="field"><RadioGroup>
      <Radio.Root value="a" disabled={props.disabled} aria-label="A" /><Radio.Root value="b" aria-label="B" />
    </RadioGroup></Field.Root>, { disabled: false });
    const a = view.getByRole('radio', { name: 'A' });
    a.focus();
    await view.user.keyboard('{Shift}');
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
    await view.setProps({ disabled: true });
    expect(a).toHaveFocus();
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
    a.blur();
    a.focus();
    await view.user.keyboard('{Shift}');
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
    await view.user.keyboard('{ArrowDown}');
    expect(view.getByRole('radio', { name: 'B' })).toHaveFocus();
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  });

  it('owns focused state across disable, re-enable, sibling focus and removal without blur', async () => {
    const view = await renderProps((props: { disabled: boolean; mounted: boolean }) => <Field.Root data-testid="field">
      <RadioGroup>
        {props.mounted && <Radio.Root value="a" aria-label="A" disabled={props.disabled} />}
        <Radio.Root value="b" aria-label="B" />
      </RadioGroup>
    </Field.Root>, { disabled: false, mounted: true });
    view.getByRole('radio', { name: 'A' }).focus();
    await view.user.keyboard('{Shift}');
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
    await view.setProps({ disabled: true });
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
    await view.setProps({ disabled: false });
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
    view.getByRole('radio', { name: 'B' }).focus();
    await view.setProps({ mounted: false });
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  });

  it('validates on group exit, not sibling focus, and associates item labels/descriptions', async () => {
    const validate = vi.fn((_value: unknown) => null);
    const view = await render(() => <>
      <Field.Root validationMode="onBlur" validate={validate}>
        <RadioGroup defaultValue="a">
          <Field.Item><Field.Label>A</Field.Label><Radio.Root value="a" /><Field.Description>Description A</Field.Description></Field.Item>
          <Field.Item><Field.Label>B</Field.Label><Radio.Root value="b" /></Field.Item>
        </RadioGroup>
      </Field.Root><button>Outside</button>
    </>);
    const a = view.getByRole('radio', { name: 'A' });
    expect(a).toHaveAccessibleDescription('Description A');
    a.focus();
    await view.user.keyboard('{ArrowDown}');
    expect(validate).not.toHaveBeenCalled();
    await view.user.tab();
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.lastCall?.[0]).toBe('b');
  });

  it('commits the controlled value only on focus leaving the group', async () => {
    const validate = vi.fn((value: unknown) => value === 'a' ? 'error' : null);
    const view = await render(() => <>
      <Field.Root validationMode="onBlur" validate={validate}>
        <RadioGroup defaultValue="a"><Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" /></RadioGroup>
      </Field.Root><button>Outside</button>
    </>);
    const group = view.getByRole('radiogroup');
    fireEvent.focusOut(group, { relatedTarget: view.getByRole('radio', { name: 'B' }) });
    expect(validate).not.toHaveBeenCalled();
    fireEvent.focusOut(group, { relatedTarget: view.getByRole('button') });
    await view.user.keyboard('{Shift}');
    expect(validate).toHaveBeenCalledExactlyOnceWith('a', expect.anything());
    expect(group).toHaveAttribute('aria-invalid', 'true');
  });

  it('revalidates external controlled changes exactly once and clears dirty on return to the initial value', async () => {
    const validate = vi.fn((value: unknown) => value === 'b' ? 'error' : null);
    const view = await renderProps((props: { value: string }) => <Field.Root name="choice" validationMode="onChange" validate={validate}>
      <RadioGroup value={props.value}><Radio.Root value="a" /><Radio.Root value="b" /></RadioGroup>
      <Field.Error data-testid="error" />
      <FieldObservation />
    </Field.Root>, { value: 'a' });
    const group = view.getByRole('radiogroup');
    const initialCalls = validate.mock.calls.length;
    await view.setProps({ value: 'b' });
    expect(validate).toHaveBeenCalledTimes(initialCalls + 1);
    expect(validate.mock.lastCall?.[0]).toBe('b');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('data-dirty');
    expect(view.getByTestId('field-state')).toHaveAttribute('data-dirty');
    expect(view.getByTestId('field-state')).toHaveAttribute('data-filled');
    expect(view.getByTestId('field-state').textContent).toBe('"a"');
    expect(view.getByTestId('error')).toHaveTextContent('error');
    await view.setProps({ value: 'a' });
    expect(group).not.toHaveAttribute('aria-invalid');
    expect(group).not.toHaveAttribute('data-dirty');
    expect(view.getByTestId('field-state')).not.toHaveAttribute('data-dirty');
    expect(validate).toHaveBeenCalledTimes(initialCalls + 2);
    expect(view.getByRole('radiogroup')).toBe(group);
    await view.setProps({ value: 'b' });
    expect(group).toHaveAttribute('data-dirty');
    expect(view.getByTestId('field-state').textContent).toBe('"a"');
    expect(validate).toHaveBeenCalledTimes(initialCalls + 3);
    expect(view.getByRole('radiogroup')).toBe(group);
  });

  it('keeps a null initial baseline dirty when controlled selection returns to its first picked value', async () => {
    const view = await renderProps<{ value: string | null }>((props) => <Field.Root>
      <RadioGroup value={props.value}><Radio.Root value="a" /><Radio.Root value="b" /></RadioGroup>
      <FieldObservation />
    </Field.Root>, { value: null });
    const group = view.getByRole('radiogroup');
    expect(group).not.toHaveAttribute('data-dirty');
    for (const value of ['a', 'b', 'a']) {
      await view.setProps({ value });
      expect(group).toHaveAttribute('data-dirty');
      expect(view.getByTestId('field-state')).toHaveAttribute('data-dirty');
      expect(view.getByTestId('field-state')).toHaveTextContent('null');
      expect(view.getByRole('radiogroup')).toBe(group);
    }
  });

  it('validates on submit and revalidates selection after submit', async () => {
    const submit = vi.fn();
    const view = await render(() => <Form onFormSubmit={submit}>
      <Field.Root name="choice" validate={(value) => value === 'a' || value === 'c' ? 'custom error' : null}>
        <RadioGroup><Radio.Root value="a" aria-label="A" /><Radio.Root value="b" aria-label="B" /><Radio.Root value="c" aria-label="C" /></RadioGroup>
        <Field.Error data-testid="error" />
      </Field.Root><button type="submit">Submit</button>
    </Form>);
    const group = view.getByRole('radiogroup');
    await view.user.click(view.getByRole('radio', { name: 'A' }));
    expect(group).not.toHaveAttribute('aria-invalid');
    await view.user.click(view.getByRole('radio', { name: 'C' }));
    expect(group).not.toHaveAttribute('aria-invalid');
    await view.user.click(view.getByRole('button'));
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(view.getByTestId('error')).toHaveTextContent('custom error');
    expect(submit).not.toHaveBeenCalled();
    await view.user.click(view.getByRole('radio', { name: 'B' }));
    expect(group).not.toHaveAttribute('aria-invalid');
    expect(view.queryByTestId('error')).toBeNull();
  });

  it('clears required validation and error descriptions when an eligible value is selected', async () => {
    const inputRef = vi.fn();
    const view = await render(() => <Form>
      <Field.Root name="choice"><RadioGroup required inputRef={inputRef}>
        <Field.Item><Radio.Root value="a" aria-label="A" /><Field.Description>Description A</Field.Description></Field.Item>
        <Field.Item><Radio.Root value="b" aria-label="B" /></Field.Item>
      </RadioGroup><Field.Error match="valueMissing" data-testid="error">required</Field.Error></Field.Root>
      <button type="submit">Submit</button>
    </Form>);
    expect(view.queryByTestId('error')).toBeNull();
    await view.user.click(view.getByRole('button'));
    const error = view.getByTestId('error');
    const group = view.getByRole('radiogroup');
    const a = view.getByRole('radio', { name: 'A' });
    const b = view.getByRole('radio', { name: 'B' });
    expect(error).toHaveTextContent('required');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(a).toHaveAttribute('aria-invalid', 'true');
    expect(b).toHaveAttribute('aria-invalid', 'true');
    expect(a.getAttribute('aria-describedby')?.split(' ')).toContain(error.id);
    expect(a).toHaveAccessibleDescription('required Description A');
    expect(inputRef).toHaveBeenLastCalledWith(a.nextElementSibling);
    await view.user.click(b);
    expect(view.queryByTestId('error')).toBeNull();
    for (const element of [group, a, b]) expect(element).not.toHaveAttribute('aria-invalid', 'true');
    expect(a).toHaveAccessibleDescription('Description A');
  });

  it('focuses the first enabled input after all initially disabled radios are enabled', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Form>
      <Field.Root name="choice"><RadioGroup required>
        <Radio.Root value="a" aria-label="A" disabled={props.disabled} /><Radio.Root value="b" disabled={props.disabled} />
      </RadioGroup></Field.Root><button type="submit">Submit</button>
    </Form>, { disabled: true });
    await view.setProps({ disabled: false });
    await view.user.click(view.getByRole('button'));
    expect(view.getByRole('radio', { name: 'A' })).toHaveFocus();
  });

  it('submits null without selection and clears external errors on selection', async () => {
    const submit = vi.fn();
    const view = await renderProps((props: { errors?: { choice: string } }) => <Form onFormSubmit={submit} errors={props.errors}>
      <Field.Root name="choice"><RadioGroup><Radio.Root value="a" aria-label="A" /><Radio.Root value="b" /></RadioGroup>
        <Field.Error data-testid="error" />
      </Field.Root><button type="submit">Submit</button>
    </Form>, {});
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: null });
    await view.setProps({ errors: { choice: 'external' } });
    expect(view.getByTestId('error')).toHaveTextContent('external');
    await view.user.click(view.getByRole('radio', { name: 'A' }));
    expect(view.queryByTestId('error')).toBeNull();
    expect(view.getByRole('radiogroup')).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('inherits live Field name/disabled and Field.Item disabled without acquiring focused state', async () => {
    const view = await renderProps((props: { name: string; disabled: boolean; itemDisabled: boolean }) => <Field.Root name={props.name} disabled={props.disabled} data-testid="field">
      <RadioGroup name="ignored"><Field.Item disabled={props.itemDisabled}><Radio.Root value="a" aria-label="A" /></Field.Item><Radio.Root value="b" /></RadioGroup>
    </Field.Root>, { name: 'choice', disabled: true, itemDisabled: false });
    const a = view.getByRole('radio', { name: 'A' });
    const group = view.getByRole('radiogroup');
    expect(view.getByRole('radiogroup')).toHaveAttribute('aria-disabled', 'true');
    expect(a.nextElementSibling).toHaveAttribute('name', 'choice');
    await view.setProps({ name: 'replacement' });
    expect(view.getByRole('radiogroup')).toBe(group);
    expect(view.getByRole('radio', { name: 'A' })).toBe(a);
    expect(a.nextElementSibling).toHaveAttribute('name', 'replacement');
    await view.setProps({ disabled: false, itemDisabled: true });
    expect(view.getByRole('radio', { name: 'A' })).toBe(a);
    expect(a).toHaveAttribute('aria-disabled', 'true');
    a.focus();
    await view.user.keyboard('{Shift}');
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
    await view.setProps({ itemDisabled: false });
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
  });

  it('keeps focused radios, native inputs and selection when the Field name changes', async () => {
    const changed = vi.fn();
    const view = await renderProps<{ name: string }>((props) => <Field.Root name={props.name}>
      <RadioGroup defaultValue="a" onValueChange={changed}>
        <Field.Item><Field.Label>Apple</Field.Label><Radio.Root value="a" /></Field.Item>
        <Field.Item><Field.Label>Banana</Field.Label><Radio.Root value="b" /></Field.Item>
      </RadioGroup>
    </Field.Root>, { name: 'choice' });
    const group = view.getByRole('radiogroup');
    const a = view.getByRole('radio', { name: 'Apple' });
    const b = view.getByRole('radio', { name: 'Banana' });
    const nativeA = a.nextElementSibling as HTMLInputElement;
    const nativeB = b.nextElementSibling as HTMLInputElement;
    await view.user.click(b);
    expect(b).toHaveFocus();
    expect(nativeB.checked).toBe(true);
    await view.setProps({ name: 'renamed' });
    expect(view.getByRole('radiogroup')).toBe(group);
    expect(view.getByRole('radio', { name: 'Apple' })).toBe(a);
    expect(view.getByRole('radio', { name: 'Banana' })).toBe(b);
    expect(a.nextElementSibling).toBe(nativeA);
    expect(b.nextElementSibling).toBe(nativeB);
    expect(b).toHaveFocus();
    expect(nativeA.name).toBe('renamed');
    expect(nativeB.name).toBe('renamed');
    expect(nativeA.checked).toBe(false);
    expect(nativeB.checked).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it.each(['group-disable', 'group-remove', 'radio-remove'] as const)('clears focused ownership without blur on %s', async (scenario) => {
    const view = await renderProps((props: { changed: boolean }) => <Field.Root data-testid="field">
      {!(props.changed && scenario === 'group-remove') && <RadioGroup disabled={props.changed && scenario === 'group-disable'}>
        {!(props.changed && scenario === 'radio-remove') && <Radio.Root value="a" aria-label="A" />}
        <Radio.Root value="b" />
      </RadioGroup>}
    </Field.Root>, { changed: false });
    view.getByRole('radio', { name: 'A' }).focus();
    await view.user.keyboard('{Shift}');
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
    await view.setProps({ changed: true });
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
  });

  it('does not acquire disabled standalone focus but does acquire readOnly focus', async () => {
    const view = await renderProps((props: { disabled: boolean }) => <Field.Root data-testid="field">
      <Radio.Root value="a" disabled={props.disabled} readOnly />
    </Field.Root>, { disabled: true });
    const radio = view.getByRole('radio');
    radio.focus();
    await view.user.keyboard('{Shift}');
    expect(radio).toHaveFocus();
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
    await view.setProps({ disabled: false });
    expect(view.getByTestId('field')).toHaveAttribute('data-focused');
    await view.user.tab();
    expect(view.getByTestId('field')).not.toHaveAttribute('data-focused');
  });

  it('associates implicit Field labels and combines group/item descriptions with external ids', async () => {
    const view = await render(() => <Field.Root name="choice"><RadioGroup aria-describedby="external-description">
      <Field.Description data-testid="group-description">Group description</Field.Description>
      <Field.Item><Field.Label><Radio.Root value="a" aria-describedby="radio-description" />Apple</Field.Label></Field.Item>
      <Field.Item><Field.Label><Radio.Root value="b" />Banana</Field.Label></Field.Item>
    </RadioGroup></Field.Root>);
    const description = view.getByTestId('group-description');
    expect(view.getByRole('radiogroup')).toHaveAttribute('aria-describedby', `external-description ${description.id}`);
    const a = view.getByRole('radio', { name: 'Apple' });
    expect(a).toHaveAttribute('aria-describedby', `radio-description ${description.id}`);
    await view.user.click(view.getByText('Banana'));
    expect(view.getByRole('radio', { name: 'Banana' })).toHaveAttribute('aria-checked', 'true');
  });

  it('updates explicit/Field/legend label precedence through replacement and removal on the same host', async () => {
    type Props = { explicit: boolean; fieldLabel: boolean; legend: boolean; fieldId: string; legendId: string };
    const view = await renderProps((props: Props) => <Field.Root name="choice">
      <Show keyed when={props.fieldLabel ? props.fieldId : false}>{(id) => <Field.Label<HTMLSpanElement> id={id} nativeLabel={false} render={(labelProps) => <span {...labelProps} />}>Field label</Field.Label>}</Show>
      <Fieldset.Root>
        {props.legend && <Fieldset.Legend id={props.legendId}>Legend</Fieldset.Legend>}
        <RadioGroup {...(props.explicit ? { 'aria-labelledby': 'explicit' } : {})}><Radio.Root value="a" /></RadioGroup>
      </Fieldset.Root>
    </Field.Root>, { explicit: true, fieldLabel: true, legend: true, fieldId: 'field-a', legendId: 'legend-a' });
    const group = view.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-labelledby', 'explicit');
    await view.setProps({ explicit: false });
    expect(group).toHaveAttribute('aria-labelledby', 'field-a');
    await view.setProps({ fieldId: 'field-b' });
    expect(group).toHaveAttribute('aria-labelledby', 'field-b');
    await view.setProps({ fieldLabel: false });
    expect(group).toHaveAttribute('aria-labelledby', 'legend-a');
    await view.setProps({ legendId: 'legend-b' });
    expect(group).toHaveAttribute('aria-labelledby', 'legend-b');
    await view.setProps({ legend: false });
    expect(group).not.toHaveAttribute('aria-labelledby');
    expect(view.getByRole('radiogroup')).toBe(group);
  });

  it('labels a real RadioGroup used as the Fieldset render host from its legend', async () => {
    const view = await render(() => <Field.Root name="choice">
      <Fieldset.Root render={(props) => <RadioGroup {...props} />}>
        <Fieldset.Legend>Legend</Fieldset.Legend><Field.Item><Radio.Root value="a" /></Field.Item>
      </Fieldset.Root>
    </Field.Root>);
    expect(view.getByRole('radiogroup')).toHaveAttribute('aria-labelledby', view.getByText('Legend').id);
  });

  it('projects a fully context-portaled group outside the native form', async () => {
    const submit = vi.fn();
    const view = await render(() => <Form onFormSubmit={submit}>
      <Portal><Field.Root name="choice"><RadioGroup defaultValue="a"><Radio.Root value="a" /></RadioGroup></Field.Root></Portal>
      <button type="submit">Submit</button>
    </Form>);
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: 'a' });
  });

  browserCase({ source: 'packages/react/src/radio-group/RadioGroup.test.tsx', case: 'native fieldset disabled projection, enable and validation focus', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const submit = vi.fn();
    const view = await renderProps<{ disabled: boolean; value: string | null }>((props) => <Form onFormSubmit={submit}>
      <fieldset disabled={props.disabled}><Field.Root name="choice"><RadioGroup required value={props.value}>
        <Radio.Root value="a" aria-label="A" /><Radio.Root value="b" />
      </RadioGroup><Field.Error match="valueMissing">required</Field.Error></Field.Root></fieldset>
      <button type="submit">Submit</button>
    </Form>, { disabled: true, value: 'a' });
    const form = view.container.querySelector('form')!;
    expect(new FormData(form).getAll('choice')).toEqual([]);
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: null });
    await view.setProps({ disabled: false });
    expect(new FormData(form).getAll('choice')).toEqual(['a']);
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: 'a' });
    await view.setProps({ value: null });
    submit.mockClear();
    await view.user.click(view.getByRole('button'));
    expect(view.getByText('required')).toBeVisible();
    expect(view.getByRole('radio', { name: 'A' })).toHaveFocus();
    expect(submit).not.toHaveBeenCalled();
  });

  browserCase({ source: 'packages/react/src/radio-group/RadioGroup.test.tsx', case: 'external form exclusion and context-portaled radio projection', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const submit = vi.fn();
    const view = await renderProps((props: { external: boolean }) => <>
      <form id="external-choice" /><Form onFormSubmit={submit}>
        <Field.Root name="choice"><RadioGroup defaultValue="a" form={props.external ? 'external-choice' : undefined}>
          <Portal><Radio.Root value="a" /></Portal>
        </RadioGroup></Field.Root><button type="submit">Submit</button>
      </Form>
    </>, { external: true });
    const form = view.container.querySelectorAll('form')[1];
    expect(new FormData(form).getAll('choice')).toEqual([]);
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: null });
    await view.setProps({ external: false });
    expect(new FormData(form).getAll('choice')).toEqual([]);
    await view.user.click(view.getByRole('button'));
    expect(submit.mock.lastCall?.[0]).toEqual({ choice: 'a' });
  });
});
