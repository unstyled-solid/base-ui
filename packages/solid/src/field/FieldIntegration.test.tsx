// Actual cross-family translations of pinned FieldRoot.test.tsx and FieldItem.test.tsx,
// SHA 19511bb171f3b360b006c94cf6d07e53cb446505. No registration stand-ins.
import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { advanceTimers, createRenderer, fireEvent, flushMicrotasks, screen } from '../../test';
import { Field } from './index';
import { Form } from '../form/Form';
import { Checkbox } from '../checkbox';
import { CheckboxGroup } from '../checkbox-group';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';
import { NumberField } from '../number-field';
import { Select } from '../select';
import { Slider } from '../slider';
import { Switch } from '../switch';

const { render, renderProps } = createRenderer();

describe('Field actual control integration', () => {
  it('source CheckboxGroup is excluded from submission when its Field name is removed', async () => {
    const submitted = vi.fn();
    const view = await render(() => {
      const [name, setName] = createSignal<string | undefined>('fruits');
      return <Form onFormSubmit={submitted}>
        <Field.Root name={name()}><CheckboxGroup defaultValue={['apple']}>
          <Field.Item><Checkbox.Root value="apple" /></Field.Item>
          <Field.Item><Checkbox.Root value="banana" /></Field.Item>
        </CheckboxGroup></Field.Root>
        <button type="button" onClick={() => setName(undefined)}>Clear name</button>
        <button type="submit">submit</button>
      </Form>;
    });
    await view.user.click(screen.getByText('submit'));
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.lastCall?.[0]).toEqual({ fruits: ['apple'] });
    await view.user.click(screen.getByText('Clear name'));
    await view.user.click(screen.getByText('submit'));
    expect(submitted).toHaveBeenCalledTimes(2);
    expect(submitted.mock.lastCall?.[0]).toEqual({});
  });

  it('source NumberField name fallback updates quantity to amount and then disappears', async () => {
    const submitted = vi.fn();
    const view = await render(() => {
      const [name, setName] = createSignal<string | undefined>('quantity');
      return <Form onFormSubmit={submitted}>
        <Field.Root><NumberField.Root name={name()} defaultValue={13}><NumberField.Input /></NumberField.Root></Field.Root>
        <button type="button" onClick={() => setName('amount')}>Change name</button>
        <button type="button" onClick={() => setName(undefined)}>Clear name</button>
        <button type="submit">submit</button>
      </Form>;
    });
    await view.user.click(screen.getByText('submit'));
    expect(submitted.mock.lastCall?.[0]).toEqual({ quantity: 13 });
    await view.user.click(screen.getByText('Change name'));
    await view.user.click(screen.getByText('submit'));
    expect(submitted.mock.lastCall?.[0]).toEqual({ amount: 13 });
    await view.user.click(screen.getByText('Clear name'));
    await view.user.click(screen.getByText('submit'));
    expect(submitted.mock.lastCall?.[0]).toEqual({});
  });

  it('source RadioGroup retains foreign custom validity on its other native input', async () => {
    const actions: { current: Field.Root.Actions | null } = { current: null };
    const view = await render(() => <>
      <Field.Root actionsRef={(value) => { actions.current = value; }} validationMode="onBlur" validate={(value) => value === 'cats' ? 'custom error' : null}>
        <RadioGroup defaultValue="cats"><Radio.Root value="cats" data-testid="cats" /><Radio.Root value="dogs" data-testid="dogs" /></RadioGroup>
        <Field.Validity>{(state) => <output>{JSON.stringify({ customError: state.validity.customError, errors: state.errors })}</output>}</Field.Validity>
      </Field.Root>
      <button type="button" onClick={() => actions.current!.validate()}>validate</button>
    </>);
    const [cats, dogs] = Array.from(view.container.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
    await view.user.click(screen.getByText('validate'));
    expect(cats.validationMessage).toBe('custom error');
    dogs.setCustomValidity('external error');
    await view.user.click(screen.getByTestId('dogs'));
    expect(cats.validationMessage).toBe('');
    expect(dogs.validationMessage).toBe('external error');
    expect(screen.getByRole('status').textContent).toBe(JSON.stringify({ customError: true, errors: ['external error'] }));
  });

  for (const family of ['checkbox', 'radio-group'] as const) {
    it(`source 100ms debounce validates actual ${family} only after 99+1ms`, async () => {
      vi.useFakeTimers();
      try {
        const validate = vi.fn((value: unknown) => value === (family === 'checkbox' ? true : 'b') ? 'error' : null);
        const view = await render(() => <Field.Root validationDebounceTime={100} validationMode="onChange" validate={validate}>
          {family === 'checkbox' ? <Checkbox.Root /> : <RadioGroup>
            <Radio.Root value="a" data-testid="item-a" /><Radio.Root value="b" data-testid="item-b" />
          </RadioGroup>}
          <Field.Error />
        </Field.Root>);
        const control = screen.getByRole(family === 'checkbox' ? 'checkbox' : 'radiogroup');
        fireEvent.click(family === 'checkbox' ? control : screen.getByTestId('item-b'));
        // Commit the native control proposal before starting the debounce clock.
        await flushMicrotasks();
        expect(validate).not.toHaveBeenCalled();
        expect(control).not.toHaveAttribute('aria-invalid');
        await advanceTimers(99);
        expect(validate).not.toHaveBeenCalled();
        expect(control).not.toHaveAttribute('aria-invalid');
        await advanceTimers(1);
        expect(validate).toHaveBeenCalledTimes(1);
        expect(validate.mock.lastCall?.[0]).toBe(family === 'checkbox' ? true : 'b');
        expect(control).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('error')).toBeInTheDocument();
        view.unmount();
      } finally { vi.useRealTimers(); }
    });
  }

  it('source pending validation is dropped when a real Switch takes control ownership', async () => {
    vi.useFakeTimers();
    try {
      const validate = vi.fn(() => 'error');
      const view = await render(() => {
        const [showSwitch, setShowSwitch] = createSignal(false);
        return <>
          <Field.Root data-testid="root" validationDebounceTime={100} validationMode="onChange" validate={validate}>
            <Field.Control data-testid="control" />
            {showSwitch() && <Switch.Root />}
            <Field.Error data-testid="error" />
          </Field.Root>
          <button type="button" onClick={() => setShowSwitch(true)}>add switch</button>
        </>;
      });
      fireEvent.input(screen.getByTestId('control'), { target: { value: 'abc' } });
      await flushMicrotasks();
      await advanceTimers(99);
      fireEvent.click(screen.getByText('add switch'));
      await flushMicrotasks();
      await advanceTimers(100);
      expect(validate).not.toHaveBeenCalled();
      expect(screen.queryByTestId('error')).toBeNull();
      expect(screen.getByTestId('root')).not.toHaveAttribute('data-invalid');
      view.unmount();
    } finally { vi.useRealTimers(); }
  });

  for (const family of ['checkbox', 'radio'] as const) {
    it(`Field.Item disables a wrapped ${family} without disabling its sibling`, async () => {
      const changed = vi.fn();
      const view = await render(() => <Field.Root name="apple">{family === 'checkbox'
        ? <CheckboxGroup defaultValue={[]} onValueChange={changed}>
          <Field.Item disabled><Checkbox.Root value="fuji" aria-label="disabled" /></Field.Item>
          <Field.Item><Checkbox.Root value="gala" aria-label="enabled" /></Field.Item>
        </CheckboxGroup>
        : <RadioGroup defaultValue="" onValueChange={changed}>
          <Field.Item disabled><Radio.Root value="fuji" aria-label="disabled" /></Field.Item>
          <Field.Item><Radio.Root value="gala" aria-label="enabled" /></Field.Item>
        </RadioGroup>}
      </Field.Root>);
      await view.user.click(screen.getByRole(family, { name: 'disabled' }));
      expect(changed).not.toHaveBeenCalled();
      await view.user.click(screen.getByRole(family, { name: 'enabled' }));
      expect(changed).toHaveBeenCalledTimes(1);
    });
  }

  it('associates an Item label with the actual parent checkbox', async () => {
    const view = await render(() => <Field.Root><CheckboxGroup allValues={['a', 'b']}>
      <Field.Item><Field.Label><Checkbox.Root parent data-testid="parent" />Toggle all</Field.Label></Field.Item>
      <Checkbox.Root value="a" data-testid="a" /><Checkbox.Root value="b" data-testid="b" />
    </CheckboxGroup></Field.Root>);
    const label = screen.getByText('Toggle all').closest('label')!;
    expect(label).toHaveAttribute('for');
    expect(label.control).toHaveAttribute('type', 'checkbox');
    await view.user.click(label);
    for (const id of ['parent', 'a', 'b']) expect(screen.getByTestId(id)).toHaveAttribute('aria-checked', 'true');
  });

  it('projects all actual field-aware values into Form submit and validator arguments', async () => {
    const validate = vi.fn((_value: unknown, _values: Record<string, unknown>) => null);
    const submitted = vi.fn();
    await render(() => <Form data-testid="form" onFormSubmit={submitted}>
      <Field.Root name="checkbox"><Checkbox.Root defaultChecked /></Field.Root>
      <Field.Root name="checkbox-group"><CheckboxGroup defaultValue={['apple', 'banana']}>
        <Field.Item><Checkbox.Root value="apple" /></Field.Item><Field.Item><Checkbox.Root value="banana" /></Field.Item>
      </CheckboxGroup></Field.Root>
      <Field.Root name="input" validate={validate}><Field.Control type="url" defaultValue="https://base-ui.com" /></Field.Root>
      <Field.Root name="number-field"><NumberField.Root defaultValue={13}><NumberField.Input /></NumberField.Root></Field.Root>
      <Field.Root name="radio-group"><RadioGroup defaultValue="cats"><Radio.Root value="cats" /></RadioGroup></Field.Root>
      <Field.Root name="select"><Select.Root defaultValue="sans"><Select.Trigger />
        <Select.Portal><Select.Positioner><Select.Popup><Select.Item value="sans" /></Select.Popup></Select.Positioner></Select.Portal>
      </Select.Root></Field.Root>
      <Field.Root name="slider"><Slider.Root defaultValue={12}><Slider.Control /></Slider.Root></Field.Root>
      <Field.Root name="range-slider"><Slider.Root defaultValue={[25, 70]}><Slider.Control /></Slider.Root></Field.Root>
      <Field.Root name="switch"><Switch.Root defaultChecked={false} /></Field.Root>
    </Form>);
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    const expected = { checkbox: true, 'checkbox-group': ['apple', 'banana'], input: 'https://base-ui.com',
      'number-field': 13, 'radio-group': 'cats', select: 'sans', slider: 12, 'range-slider': [25, 70], switch: false };
    expect(validate).toHaveBeenCalledTimes(1);
    expect(validate.mock.lastCall?.[1]).toEqual(expected);
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(submitted.mock.lastCall?.[0]).toEqual(expected);
  });

  it('restores a native label association when a CheckboxGroup is replaced with Control', async () => {
    const view = await renderProps<{ group: boolean }>((p) => <Field.Root><Field.Label>Answer</Field.Label>
      {p.group ? <CheckboxGroup allValues={['a']}><Checkbox.Root value="a" /></CheckboxGroup> : <Field.Control />}
    </Field.Root>, { group: true });
    expect(screen.getByText('Answer')).not.toHaveAttribute('for');
    await view.setProps({ group: false });
    expect(screen.getByText('Answer')).toHaveAttribute('for', screen.getByRole('textbox').id);
  });

  it('submits the actual replacement Slider value after retiring Select registration', async () => {
    const submitted = vi.fn();
    const view = await renderProps<{ slider: boolean }>((p) => <Form data-testid="form" onFormSubmit={submitted}>
      <Field.Root name="value">{p.slider
        ? <Slider.Root defaultValue={12}><Slider.Control /></Slider.Root>
        : <Select.Root defaultValue="sans"><Select.Trigger /></Select.Root>}
      </Field.Root>
    </Form>, { slider: false });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ value: 'sans' });
    expect(submitted).toHaveBeenCalledTimes(1);
    await view.setProps({ slider: true });
    fireEvent.submit(screen.getByTestId('form'));
    await flushMicrotasks();
    expect(submitted.mock.lastCall?.[0]).toEqual({ value: 12 });
    expect(submitted).toHaveBeenCalledTimes(2);
  });

  it('retains a null logical baseline when NumberField is replaced with a native text Control', async () => {
    const view = await renderProps<{ text: boolean }>((p) => <Field.Root data-testid="root">{p.text
      ? <Field.Control defaultValue="" />
      : <NumberField.Root><NumberField.Input /></NumberField.Root>}
    </Field.Root>, { text: false });
    await view.setProps({ text: true });
    const control = screen.getByRole('textbox');
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
    fireEvent.input(control, { target: { value: 'x' } });
    await flushMicrotasks();
    expect(screen.getByTestId('root')).toHaveAttribute('data-dirty');
    fireEvent.input(control, { target: { value: '' } });
    await flushMicrotasks();
    expect(screen.getByTestId('root')).not.toHaveAttribute('data-dirty');
  });
});
