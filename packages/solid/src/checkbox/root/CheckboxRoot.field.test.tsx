import { flush, untrack } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, waitFor } from '../../../test';
import { CheckboxRoot, type CheckboxRootProps } from './CheckboxRoot';
import { CheckboxGroup } from '../../checkbox-group/CheckboxGroup';
import { CoreField, CoreForm, CoreLabel, CoreDescription, CoreItem } from '../../checkbox-group/test/CoreFixture';
import type { FieldRootContextValue } from '../../internals/field-root-context';

// Core-native adaptations of the complete Field/Form outcomes in CheckboxRoot.test.tsx.
// Public wrappers and native SSR label handoff replay in bsolid-integration/bsolid-hydration.
describe('CheckboxRoot field core', () => {
  const { render, renderProps } = createRenderer();
  it('receives field disabled and name and registers native required validation', async () => {
    let engine!: FieldRootContextValue;
    const view = await renderProps((props: { disabled: boolean }) => <CoreForm><CoreField name="terms" disabled={props.disabled} expose={(field) => { engine = field; }}>
      <CheckboxRoot required />
    </CoreField><button type="submit">Submit</button></CoreForm>, { disabled: true });
    const root = view.getByRole('checkbox'); const input = view.container.querySelector('input')!;
    expect(root).toHaveAttribute('aria-disabled', 'true'); expect(input.name).toBe('terms');
    await view.setProps({ disabled: false });
    await view.user.click(view.getByText('Submit'));
    expect(untrack(() => engine.validityData.state.valueMissing)).toBe(true);
    expect(root).toHaveAttribute('aria-invalid', 'true');
    await view.user.click(root); expect(root).not.toHaveAttribute('aria-invalid');
    await view.user.click(root); expect(root).toHaveAttribute('aria-invalid', 'true');
  });
  it('touched/focused/dirty/filled style hooks follow interaction and return to initial state', async () => {
    const view = await render(() => <CoreField><CheckboxRoot /></CoreField>);
    const root = view.getByRole('checkbox');
    for (const attr of ['data-dirty', 'data-focused', 'data-filled', 'data-touched']) expect(root).not.toHaveAttribute(attr);
    root.focus(); flush(); expect(root).toHaveAttribute('data-focused');
    root.blur(); flush(); expect(root).not.toHaveAttribute('data-focused'); expect(root).toHaveAttribute('data-touched');
    await view.user.click(root); expect(root).toHaveAttribute('data-filled'); expect(root).toHaveAttribute('data-dirty');
    await view.user.click(root); expect(root).not.toHaveAttribute('data-filled'); expect(root).not.toHaveAttribute('data-dirty');
  });
  it('initially filled checkbox clears filled when unchecked', async () => {
    const view = await render(() => <CoreField><CheckboxRoot defaultChecked /></CoreField>);
    const root = view.getByRole('checkbox'); expect(root).toHaveAttribute('data-filled');
    await view.user.click(root); expect(root).not.toHaveAttribute('data-filled');
  });
  it('controlled unchecked remount clears filled', async () => {
    const view = await renderProps((props: { replace: boolean }) => <CoreField>
      {props.replace ? <CheckboxRoot checked={false} /> : <CheckboxRoot checked />}
    </CoreField>, { replace: false });
    expect(view.getByRole('checkbox')).toHaveAttribute('data-filled');
    await view.setProps({ replace: true }); expect(view.getByRole('checkbox')).not.toHaveAttribute('data-filled');
  });
  it('group owns filled across all children', async () => {
    const view = await render(() => <CoreField><CheckboxGroup defaultValue={['1', '2']}>
      <CheckboxRoot name="1" /><CheckboxRoot name="2" />
    </CheckboxGroup></CoreField>);
    const [first, second] = view.getAllByRole('checkbox');
    await view.user.click(first); expect(first).toHaveAttribute('data-filled'); expect(second).toHaveAttribute('data-filled');
    await view.user.click(second); expect(first).not.toHaveAttribute('data-filled'); expect(second).not.toHaveAttribute('data-filled');
  });
  it.each(['disabled', 'unmounted'] as const)('cleans up field focus when %s without a blur event', async (action) => {
    let engine!: FieldRootContextValue;
    const view = await renderProps((props: { change: boolean }) => <CoreField expose={(field) => { engine = field; }}>
      {!(action === 'unmounted' && props.change) && <CheckboxRoot disabled={action === 'disabled' && props.change} />}
    </CoreField>, { change: false });
    view.getByRole('checkbox').focus(); flush();
    expect(untrack(() => engine.state.focused)).toBe(true);
    await view.setProps({ change: true }); expect(untrack(() => engine.state.focused)).toBe(false);
  });
  it('disabled focus never claims the field', async () => {
    const view = await render(() => <CoreField><CheckboxRoot disabled /></CoreField>);
    fireEvent.focus(view.getByRole('checkbox')); flush();
    expect(view.getByRole('checkbox')).not.toHaveAttribute('data-focused');
  });
  it('invalid and valid field state are projected to the root', async () => {
    const view = await renderProps((props: { invalid: boolean }) => <CoreField invalid={props.invalid} validationMode="onBlur"><CheckboxRoot required /></CoreField>, { invalid: true });
    const root = view.getByRole('checkbox'); expect(root).toHaveAttribute('data-invalid');
    await view.setProps({ invalid: false }); await view.user.click(root); root.focus(); root.blur(); flush();
    await waitFor(() => expect(root).toHaveAttribute('data-valid'));
  });
  it.each(['onChange', 'onBlur'] as const)('calls current validator with boolean values (%s)', async (mode) => {
    const validate = vi.fn((value: unknown) => value ? 'error' : null);
    const view = await render(() => <CoreField name="terms" validationMode={mode} validate={validate}><CheckboxRoot /></CoreField>);
    const root = view.getByRole('checkbox'); validate.mockClear();
    await view.user.click(root);
    if (mode === 'onBlur') { expect(validate).not.toHaveBeenCalled(); root.blur(); flush(); }
    expect(validate).toHaveBeenCalledTimes(1); expect(validate.mock.lastCall?.[0]).toBe(true);
    expect(root).toHaveAttribute('aria-invalid', 'true');
  });
  it('controlled external changes validate once', async () => {
    const validate = vi.fn((value: unknown) => value ? 'error' : null);
    const view = await renderProps((props: CheckboxRootProps) => <CoreField name="terms" validationMode="onChange" validate={validate}><CheckboxRoot {...props} /></CoreField>, { checked: false });
    validate.mockClear(); await view.setProps({ checked: true });
    expect(validate).toHaveBeenCalledTimes(1); expect(validate.mock.lastCall?.[0]).toBe(true);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });
  it.each([undefined, '', 'explicit'])('field label associates native hidden input (id=%s)', async (id) => {
    const view = await render(() => <CoreField><CoreLabel>Label</CoreLabel><CheckboxRoot id={id} /></CoreField>);
    const label = view.getByText('Label'); const input = view.container.querySelector('input')!;
    expect(input.id).not.toBe(''); expect(label).toHaveAttribute('for', input.id);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-labelledby', label.id);
    await view.user.click(label); expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
  });
  it('shared field group labels the group and assigns unique child IDs', async () => {
    const view = await render(() => <CoreField name="fruits"><CoreLabel>Fruits</CoreLabel><CheckboxGroup allValues={['a', 'b']}>
      <CheckboxRoot parent data-testid="parent" /><CheckboxRoot value="a" /><CheckboxRoot value="b" />
    </CheckboxGroup></CoreField>);
    const label = view.getByText('Fruits'); expect(label).not.toHaveAttribute('for');
    expect(view.getByRole('group')).toHaveAttribute('aria-labelledby', label.id);
    const ids = [...view.container.querySelectorAll('[id]')].map((node) => node.id);
    expect(ids).toHaveLength(7); expect(new Set(ids).size).toBe(7);
    expect(view.getByTestId('parent')).toHaveAttribute('aria-controls', view.getAllByRole('checkbox').slice(1).map((node) => node.id).join(' '));
  });
  it('item disabled state reaches a checkbox without disabling its sibling', async () => {
    const view = await render(() => <CoreField><CheckboxGroup><CoreItem disabled><CheckboxRoot value="a" /></CoreItem><CoreItem><CheckboxRoot value="b" /></CoreItem></CheckboxGroup></CoreField>);
    expect(view.getAllByRole('checkbox')[0]).toHaveAttribute('aria-disabled', 'true');
    expect(view.getAllByRole('checkbox')[1]).not.toHaveAttribute('aria-disabled');
  });
  it('item descriptions compose with external and group descriptions', async () => {
    const view = await render(() => <CoreField><CheckboxGroup aria-describedby="external-group">
      <CoreDescription>Group description</CoreDescription>
      <CoreItem><CoreLabel>Apple</CoreLabel><CoreDescription>Item description</CoreDescription><CheckboxRoot value="a" aria-describedby="external-item" /></CoreItem>
    </CheckboxGroup></CoreField>);
    const groupId = view.getByText('Group description').id;
    const itemId = view.getByText('Item description').id;
    expect(view.getByRole('group')).toHaveAttribute('aria-describedby', `external-group ${groupId}`);
    expect(view.getByRole('checkbox').getAttribute('aria-describedby')).toContain(itemId);
    expect(view.getByRole('checkbox').getAttribute('aria-describedby')).toContain(groupId);
    expect(view.getByRole('checkbox').getAttribute('aria-describedby')).toContain('external-item');
  });
});
