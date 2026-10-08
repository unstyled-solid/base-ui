import { createSignal, flush, untrack } from 'solid-js';
import { Portal, type JSX } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, describeConformance, waitFor, browserCase, expectDiagnostic } from '../../test';
import type { ConformantComponentProps } from '../../test/describeConformance';
import { CheckboxGroup, type CheckboxGroupProps, type CheckboxGroupState } from './CheckboxGroup';
import { CheckboxRoot, type CheckboxRootProps } from '../checkbox/root/CheckboxRoot';
import type { HTMLProps } from '../internals/types';
import type { FieldRootContextValue } from '../internals/field-root-context';
import type { FormContextValue } from '../internals/form-context';
import { CoreField, CoreForm, getCoreField } from './test/CoreFixture';

const NativeButton = (props: HTMLProps) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} />;
const Child = (props: CheckboxRootProps) => <CheckboxRoot {...props} />;

// Canonical: CheckboxGroup.test.tsx and useCheckboxGroupParent.test.tsx at the pinned source SHA.
// Public Field/Form shells become core-native fixtures. These cases must replay with public wrappers
// in bsolid-integration; portals/browser focus/hydration also belong to final qualification.
describe('CheckboxGroup', () => {
  const { render, renderProps } = createRenderer();
  describeConformance<CheckboxGroupState, ConformantComponentProps<CheckboxGroupState> & { disabled?: boolean }>((props) => <CheckboxGroup {...(props as CheckboxGroupProps)} />, {
    initialProps: {}, refInstanceof: HTMLDivElement,
    state: {
      change: { disabled: true }, class: (state) => state.disabled ? 'disabled' : 'enabled', before: 'enabled', after: 'disabled',
      assert: (state, changed) => expect(untrack(() => state.disabled)).toBe(changed),
    },
  });
  it('forwards id and allows a role override', async () => {
    const view = await render(() => <CheckboxGroup id="group" role="region" />);
    expect(view.getByRole('region')).toHaveAttribute('id', 'group');
  });
  it('controls selection without mutating the provided array', async () => {
    const initial = Object.freeze(['red']);
    const proposals = vi.fn();
    const view = await render(() => {
      const [value, setValue] = createSignal<readonly string[]>(initial);
      return <CheckboxGroup value={value()} onValueChange={(next) => { proposals(next); setValue(next); }}>
        {['red', 'green', 'blue'].map((name) => <Child name={name} data-testid={name} />)}
      </CheckboxGroup>;
    });
    for (const [name, selected] of [
      ['initial', ['red']], ['green', ['red', 'green']],
      ['blue', ['red', 'green', 'blue']], ['green', ['red', 'blue']],
    ] as const) {
      if (name !== 'initial') await view.user.click(view.getByTestId(name));
      for (const color of ['red', 'green', 'blue']) {
        expect(view.getByTestId(color)).toHaveAttribute('aria-checked', String((selected as readonly string[]).includes(color)));
      }
    }
    expect(proposals.mock.calls.map(([value]) => value)).toEqual([['red', 'green'], ['red', 'green', 'blue'], ['red', 'blue']]);
    expect(initial).toEqual(['red']);
    expect(view.getByTestId('red')).toHaveAttribute('aria-checked', 'true');
    expect(view.getByTestId('green')).toHaveAttribute('aria-checked', 'false');
    expect(view.getByTestId('blue')).toHaveAttribute('aria-checked', 'true');
  });
  it.each([false, true])('empty-string selection survives toggle (parent enabled=%s)', async (withParent) => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxGroup defaultValue={['']} allValues={withParent ? ['', 'other'] : undefined} onValueChange={changed}>
      <Child value="" data-testid="empty" /><Child value="other" data-testid="other" />
    </CheckboxGroup>);
    expect(view.getByTestId('empty')).toHaveAttribute('aria-checked', 'true');
    expect(view.getByTestId('other')).toHaveAttribute('aria-checked', 'false');
    await view.user.click(view.getByTestId('empty'));
    expect(changed.mock.calls[0][0]).toEqual([]);
    expect(view.getByTestId('empty')).toHaveAttribute('aria-checked', 'false');
  });
  it('treats a controlled undefined value as empty', async () => {
    const view = await renderProps((props: CheckboxGroupProps) => <CheckboxGroup {...props}><Child value="red" /></CheckboxGroup>, { value: ['red'] });
    await expectDiagnostic({ message: /changing the controlled value state of CheckboxGroup to be uncontrolled/ },
      () => view.setProps({ value: undefined }));
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'false');
  });
  it('defaults to an isolated empty array and emits one immutable proposal per click', async () => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxGroup onValueChange={changed}>
      <Child name="red" data-testid="red" /><Child name="green" data-testid="green" />
    </CheckboxGroup>);
    for (const name of ['red', 'green', 'red']) await view.user.click(view.getByTestId(name));
    expect(changed.mock.calls.map(([value]) => value)).toEqual([['red'], ['red', 'green'], ['green']]);
    expect(changed.mock.calls[0][0]).not.toBe(changed.mock.calls[1][0]);
  });
  it('treats unsupported JS null default as empty', async () => {
    // @ts-expect-error An untyped JavaScript consumer may supply null.
    const view = await render(() => <CheckboxGroup defaultValue={null} />);
    expect(view.getByRole('group')).toBeInTheDocument();
  });
  it('uses the initial default and the current callback', async () => {
    const old = vi.fn(); const current = vi.fn();
    const view = await renderProps((props: CheckboxGroupProps) => <CheckboxGroup {...props}><Child value="a" /><Child value="b" /></CheckboxGroup>,
      { defaultValue: ['a'], onValueChange: old });
    const group = view.getByRole('group');
    await view.setProps({ defaultValue: ['b'], onValueChange: current });
    expect(view.getAllByRole('checkbox')[0]).toHaveAttribute('aria-checked', 'true');
    await view.user.click(view.getAllByRole('checkbox')[1]);
    expect(old).not.toHaveBeenCalled(); expect(current.mock.calls[0][0]).toEqual(['a', 'b']);
    expect(view.getByRole('group')).toBe(group);
  });
  it.each([false, true])('veto rolls back native inputs and logical selection (parent=%s)', async (withParent) => {
    const changed = vi.fn<NonNullable<CheckboxGroupProps['onValueChange']>>((_, details) => details.cancel());
    const view = await render(() => <CheckboxGroup allValues={withParent ? ['a', 'b'] : undefined} onValueChange={changed}>
      {withParent && <Child parent data-testid="parent" />}<Child value="a" data-testid="a" /><Child value="b" />
    </CheckboxGroup>);
    await view.user.click(view.getByTestId('a'));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][0]).toEqual(['a']);
    for (const node of view.getAllByRole('checkbox')) expect(node).toHaveAttribute('aria-checked', 'false');
    for (const node of view.container.querySelectorAll<HTMLInputElement>('input')) expect(node.checked).toBe(false);
  });
  it.each([false, true])('disabled group wins over child disabled=false (%s)', async (disabled) => {
    const view = await render(() => <CheckboxGroup disabled={disabled}><Child value="a" disabled={false} /><Child value="b" /></CheckboxGroup>);
    for (const child of view.getAllByRole('checkbox')) {
      if (disabled) expect(child).toHaveAttribute('aria-disabled', 'true');
      else expect(child).not.toHaveAttribute('aria-disabled');
    }
  });

  describe('parent selection and registration', () => {
    it('mixed -> all -> none restores the child snapshot without child notifications', async () => {
      const groupChange = vi.fn(); const childChange = vi.fn(); const parentChange = vi.fn();
      const view = await render(() => <CheckboxGroup defaultValue={['a']} allValues={['a', 'b', 'c']} onValueChange={groupChange}>
        <Child parent data-testid="parent" onCheckedChange={parentChange} />
        <Child value="a" /><Child value="b" onCheckedChange={childChange} /><Child value="c" />
      </CheckboxGroup>);
      const parent = view.getByTestId('parent');
      for (const state of ['true', 'false', 'mixed']) { await view.user.click(parent); expect(parent).toHaveAttribute('aria-checked', state); }
      expect(groupChange.mock.calls.map(([value]) => value)).toEqual([['a', 'b', 'c'], [], ['a']]);
      expect(parentChange).toHaveBeenCalledTimes(3); expect(childChange).not.toHaveBeenCalled();
    });
    it.each(['parent', 'child'] as const)('%s veto happens before group effects', async (target) => {
      const changed = vi.fn();
      const veto: CheckboxRootProps['onCheckedChange'] = (_, details) => details.cancel();
      const view = await render(() => <CheckboxGroup allValues={['a', 'b']} onValueChange={changed}>
        <Child parent data-testid="parent" onCheckedChange={target === 'parent' ? veto : undefined} />
        <Child value="a" data-testid="child" onCheckedChange={target === 'child' ? veto : undefined} /><Child value="b" />
      </CheckboxGroup>);
      await view.user.click(view.getByTestId(target));
      expect(changed).not.toHaveBeenCalled();
      for (const input of view.container.querySelectorAll<HTMLInputElement>('input')) expect(input.checked).toBe(false);
    });
    it('group-vetoed parent retries the same transition, and child veto preserves the snapshot', async () => {
      const changed = vi.fn<NonNullable<CheckboxGroupProps['onValueChange']>>((_, details) => details.cancel());
      const view = await renderProps((props: CheckboxGroupProps) => <CheckboxGroup {...props} allValues={['a', 'b', 'c']}>
        <Child parent data-testid="parent" /><Child value="a" data-testid="a" /><Child value="b" /><Child value="c" />
      </CheckboxGroup>, { value: ['a'], onValueChange: changed });
      const parent = view.getByTestId('parent');
      await view.user.click(parent); await view.user.click(parent);
      expect(changed.mock.calls.map(([value]) => value)).toEqual([['a', 'b', 'c'], ['a', 'b', 'c']]);
      // Remount to test an all-checked initial restore snapshot.
      view.unmount();
      const all = await render(() => <CheckboxGroup value={['a', 'b', 'c']} allValues={['a', 'b', 'c']} onValueChange={changed}>
        <Child parent data-testid="parent" /><Child value="a" data-testid="a" /><Child value="b" /><Child value="c" />
      </CheckboxGroup>);
      changed.mockClear();
      await all.user.click(all.getByTestId('a')); await all.user.click(all.getByTestId('parent'));
      expect(changed.mock.calls.map(([value]) => value)).toEqual([['b', 'c'], []]);
    });
    it.each([false, true])('parent preserves disabled child selection (%s)', async (checked) => {
      const changed = vi.fn();
      const view = await render(() => <CheckboxGroup defaultValue={checked ? ['a'] : []} allValues={['a', 'b', 'c']} onValueChange={changed}>
        <Child parent data-testid="parent" /><Child value="a" disabled data-testid="a" /><Child value="b" /><Child value="c" />
      </CheckboxGroup>);
      await view.user.click(view.getByTestId('parent')); await view.user.click(view.getByTestId('parent'));
      expect(changed.mock.calls[0][0]).toEqual(checked ? ['a', 'b', 'c'] : ['b', 'c']);
      expect(changed.mock.calls[1][0]).toEqual(checked ? ['a'] : []);
      expect(view.getByTestId('a')).toHaveAttribute('aria-checked', String(checked));
    });
    it.each([false, true])('aria-controls names actual custom-rendered hosts (%s)', async (nativeButton) => {
      const view = await render(() => <CheckboxGroup allValues={['a', 'b', 'constructor']}>
        <Child parent data-testid="parent" nativeButton={nativeButton} render={nativeButton ? NativeButton : undefined} />
        <Child value="a" id="input-a" nativeButton={nativeButton}
          render={(props) => nativeButton ? <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} id="rendered-a" /> : <span {...(props as JSX.HTMLAttributes<HTMLSpanElement>)} id="rendered-a" />} />
        <Child value="b" data-testid="b" />
      </CheckboxGroup>);
      expect(view.getByTestId('parent')).toHaveAttribute('aria-controls', `rendered-a ${view.getByTestId('b').id}`);
      if (!nativeButton) expect(view.container.querySelector('#input-a')).toBeInstanceOf(HTMLInputElement);
    });
    it('duplicate values retain surviving IDs across unmount and reassociation', async () => {
      const view = await renderProps((props: { second: boolean; value: string }) => <CheckboxGroup allValues={['a', 'b']}>
        <Child parent data-testid="parent" /><Child value="a" data-testid="a" /><Child value={props.value} data-testid="b" />
        {props.second && <Child value="b" data-testid="second" />}
      </CheckboxGroup>, { second: true, value: 'b' });
      const parent = view.getByTestId('parent');
      expect(parent).toHaveAttribute('aria-controls', `${view.getByTestId('a').id} ${view.getByTestId('b').id} ${view.getByTestId('second').id}`);
      await view.setProps({ second: false });
      expect(parent).toHaveAttribute('aria-controls', `${view.getByTestId('a').id} ${view.getByTestId('b').id}`);
      await view.setProps({ value: 'a' });
      expect(parent).toHaveAttribute('aria-controls', `${view.getByTestId('a').id} ${view.getByTestId('b').id}`);
    });
    it('does not select a child without an identifying value but still assigns an input ID', async () => {
      const view = await render(() => <CheckboxGroup allValues={['a']}>
        <Child parent data-testid="parent" /><Child id="standalone" data-testid="valueless" /><Child value="a" />
      </CheckboxGroup>);
      await view.user.click(view.getByTestId('parent'));
      expect(view.getByTestId('valueless')).toHaveAttribute('aria-checked', 'false');
      expect(view.getByTestId('valueless').nextElementSibling).toHaveAttribute('id', 'standalone');
      expect(view.getByTestId('parent')).toHaveAttribute('aria-checked', 'true');
    });
    it('keeps two omitted-default groups independent', async () => {
      const view = await render(() => <>
        <CheckboxGroup allValues={['a1', 'a2']}><Child parent data-testid="ap" /><Child value="a1" data-testid="a1" /><Child value="a2" data-testid="a2" /></CheckboxGroup>
        <CheckboxGroup allValues={['b1', 'b2']}><Child parent data-testid="bp" /><Child value="b1" data-testid="b1" /><Child value="b2" data-testid="b2" /></CheckboxGroup>
      </>);
      await view.user.click(view.getByTestId('a1'));
      expect(view.getByTestId('ap')).toHaveAttribute('aria-checked', 'mixed');
      for (const id of ['bp', 'b1', 'b2']) expect(view.getByTestId(id)).toHaveAttribute('aria-checked', 'false');
      await view.user.click(view.getByTestId('bp'));
      expect(view.getByTestId('a1')).toHaveAttribute('aria-checked', 'true');
      expect(view.getByTestId('a2')).toHaveAttribute('aria-checked', 'false');
      for (const id of ['b1', 'b2']) expect(view.getByTestId(id)).toHaveAttribute('aria-checked', 'true');
      await view.user.click(view.getByTestId('ap'));
      for (const id of ['a1', 'a2', 'bp']) expect(view.getByTestId(id)).toHaveAttribute('aria-checked', 'true');
      await view.user.click(view.getByTestId('b1'));
      expect(view.getByTestId('bp')).toHaveAttribute('aria-checked', 'mixed');
      expect(view.getByTestId('ap')).toHaveAttribute('aria-checked', 'true');
    });
    it('reset restores the default selection and mixed restore cycle without callbacks', async () => {
      const changed = vi.fn();
      const view = await render(() => <form><CheckboxGroup defaultValue={['a']} allValues={['a', 'b']} onValueChange={changed}>
        <Child parent data-testid="parent" /><Child value="a" /><Child value="b" />
      </CheckboxGroup></form>);
      await view.user.click(view.getByTestId('parent'));
      view.container.querySelector('form')!.reset();
      await waitFor(() => expect(view.getByTestId('parent')).toHaveAttribute('aria-checked', 'mixed'));
      expect(changed).toHaveBeenCalledTimes(1);
      await view.user.click(view.getByTestId('parent'));
      expect(changed.mock.calls[1][0]).toEqual(['a', 'b']);
    });
  });

  describe('core field and registry', () => {
    it('derives filled from the logical value even without a rendered matching checkbox', async () => {
      const view = await render(() => <CoreField name="fruits"><CheckboxGroup defaultValue={['cherry']}><Child value="apple" /></CheckboxGroup></CoreField>);
      const group = view.getByRole('group');
      expect(group).toHaveAttribute('data-filled');
      await view.user.click(view.getByRole('checkbox')); await view.user.click(view.getByRole('checkbox'));
      expect(group).toHaveAttribute('data-filled');
    });
    it('dirty returns to false when selection equals the initial value', async () => {
      const view = await render(() => <CoreField name="fruits"><CheckboxGroup defaultValue={['apple']}><Child value="apple" /><Child value="banana" /></CheckboxGroup></CoreField>);
      const group = view.getByRole('group'); const banana = view.getAllByRole('checkbox')[1];
      expect(group).not.toHaveAttribute('data-dirty');
      await view.user.click(banana); expect(group).toHaveAttribute('data-dirty');
      await view.user.click(banana); expect(group).not.toHaveAttribute('data-dirty');
    });
    it.each(['onChange', 'onBlur', 'onSubmit'] as const)('validates every enabled required input (%s)', async (mode) => {
      let engine!: FieldRootContextValue;
      const view = await render(() => <CoreForm><CoreField name="protocols" validationMode={mode} expose={(field) => { engine = field; }}>
        <CheckboxGroup><Child value="http" required /><Child value="https" required /><Child value="disabled" required disabled /></CheckboxGroup>
      </CoreField><button type="submit">Submit</button></CoreForm>);
      const [http, https] = view.getAllByRole('checkbox');
      await view.user.click(https);
      if (mode === 'onBlur') { https.focus(); await view.user.tab(); }
      if (mode === 'onSubmit') await view.user.click(view.getByText('Submit'));
      expect(untrack(() => engine.validityData.state.valueMissing)).toBe(true);
      await view.user.click(http);
      if (mode === 'onBlur') { http.focus(); await view.user.tab(); }
      if (mode === 'onSubmit') await view.user.click(view.getByText('Submit'));
      expect(untrack(() => engine.validityData.state.valid)).toBe(true);
    });
    it('native registry cleanup preserves constraints after the checked sibling unmounts', async () => {
      let engine!: FieldRootContextValue;
      const view = await renderProps((props: { show: boolean }) => <CoreForm><CoreField name="protocols" expose={(field) => { engine = field; }}>
        <CheckboxGroup><Child value="http" required />{props.show && <Child value="https" required />}</CheckboxGroup>
      </CoreField><button type="submit">Submit</button></CoreForm>, { show: true });
      await view.user.click(view.getAllByRole('checkbox')[1]);
      await view.setProps({ show: false });
      await view.user.click(view.getByText('Submit'));
      expect(untrack(() => engine.validityData.state.valueMissing)).toBe(true);
      await view.user.click(view.getByRole('checkbox')); await view.user.click(view.getByText('Submit'));
      expect(untrack(() => engine.validityData.state.valid)).toBe(true);
    });
    it('custom validation sees logical arrays, clears stale/disabled custom validity, and runs once per change', async () => {
      const validate = vi.fn((value: unknown) => (value as string[]).length < 2 ? 'pick two' : null);
      const view = await renderProps((props: { disabled: boolean }) => <CoreField name="protocols" validationMode="onChange" validate={validate}>
        <CheckboxGroup><Child value="http" disabled={props.disabled} /><Child value="https" /></CheckboxGroup>
      </CoreField>, { disabled: false });
      validate.mockClear();
      await view.user.click(view.getAllByRole('checkbox')[0]);
      expect(validate).toHaveBeenCalledTimes(1);
      const input = view.container.querySelector('input')!;
      expect(input.validity.customError).toBe(true);
      await view.setProps({ disabled: true }); await view.user.click(view.getAllByRole('checkbox')[1]);
      expect(validate.mock.lastCall?.[0]).toEqual(['http', 'https']);
      expect(input.validity.customError).toBe(false);
      for (const node of view.getAllByRole('checkbox')) expect(node).not.toHaveAttribute('aria-invalid');
    });
    it('parent changes and external controlled changes validate logical selection exactly once', async () => {
      const validate = vi.fn((_value: unknown, _formValues: Record<string, unknown>) => null);
      const view = await renderProps<CheckboxGroupProps>((props) => <CoreField name="fruits" validationMode="onChange" validate={validate}>
        <CheckboxGroup {...props} allValues={['apple', 'orange']}><Child parent data-testid="parent" /><Child value="apple" /><Child value="orange" /></CheckboxGroup>
      </CoreField>, {});
      validate.mockClear();
      await view.user.click(view.getByTestId('parent'));
      expect(validate).toHaveBeenCalledTimes(1); expect(validate.mock.lastCall?.[0]).toEqual(['apple', 'orange']);
      await view.user.click(view.getByTestId('parent'));
      expect(validate).toHaveBeenCalledTimes(2); expect(validate.mock.lastCall?.[0]).toEqual([]);
      view.unmount();
      const external = await renderProps<CheckboxGroupProps>((props) => <CoreField name="fruits" validationMode="onChange" validate={validate}><CheckboxGroup {...props} /></CoreField>, { value: [] });
      validate.mockClear(); await external.setProps({ value: ['one'] });
      expect(validate).toHaveBeenCalledTimes(1); expect(validate.mock.lastCall?.[0]).toEqual(['one']);
    });
    it('successful values exclude disabled, unmounted, reassociated, parent and fieldset-disabled inputs', async () => {
      let engine!: FieldRootContextValue; let form!: FormContextValue;
      const validate = vi.fn((_value: unknown, _formValues: Record<string, unknown>) => null);
      const view = await renderProps((props: { disabled: boolean; mounted: boolean; external: boolean }) => <>
        <form id="other" /><CoreForm id="current" expose={(context) => { form = context; }}>
          <CoreField name="fruits" validate={validate} expose={(context) => { engine = context; }}>
            <CheckboxGroup defaultValue={['apple', 'banana', 'cherry', 'fieldset']} allValues={['apple', 'banana', 'cherry', 'fieldset']}>
              <Child parent /><Child value="apple" />
              {props.mounted && <Child value="banana" disabled={props.disabled} form={props.external ? 'other' : undefined} />}
              <fieldset disabled><Child value="fieldset" /></fieldset>
            </CheckboxGroup>
          </CoreField>
        </CoreForm>
      </>, { disabled: true, mounted: true, external: false });
      const projected = () => untrack(() => getCoreField(form, 'fruits').getValue());
      expect(projected()).toEqual(['apple']);
      expect(untrack(() => engine.validityData.initialValue)).toEqual(['apple', 'banana', 'cherry', 'fieldset']);
      await view.setProps({ disabled: false }); expect(projected()).toEqual(['apple', 'banana']);
      await view.setProps({ external: true }); expect(projected()).toEqual(['apple']);
      await view.setProps({ mounted: false, external: false }); expect(projected()).toEqual(['apple']);
      await view.setProps({ mounted: true }); expect(projected()).toEqual(['apple', 'banana']);
      untrack(() => getCoreField(form, 'fruits').validate());
      expect(validate.mock.lastCall?.[0]).toEqual(['apple', 'banana', 'cherry', 'fieldset']);
      expect(validate.mock.lastCall?.[1]).toEqual({ fruits: ['apple', 'banana'] });
    });
    it('registers a field-name fallback value and duplicate-value survivors', async () => {
      let form!: FormContextValue;
      const view = await renderProps((props: { trim: boolean }) => <CoreForm expose={(context) => { form = context; }}><CoreField name="items">
        <CheckboxGroup defaultValue={['items', 'one', 'two']}>
          <Child />{!props.trim && <Child value="one" />}<Child value="two" />{!props.trim && <Child value="two" />}
        </CheckboxGroup>
      </CoreField></CoreForm>, { trim: false });
      expect(untrack(() => getCoreField(form, 'items').getValue())).toEqual(['items', 'one', 'two']);
      await view.setProps({ trim: true });
      expect(untrack(() => getCoreField(form, 'items').getValue())).toEqual(['items', 'two']);
    });
    it.each(['unassociated', 'current', 'other'] as const)('projects context-portaled inputs (%s)', async (association) => {
      let form!: FormContextValue;
      const mount = document.createElement(association === 'other' ? 'form' : 'div'); document.body.append(mount);
      try {
        const view = await render(() => <CoreForm id="current" expose={(context) => { form = context; }}><CoreField name="fruits">
          <CheckboxGroup defaultValue={['apple']}><Portal mount={mount}><Child value="apple" form={association === 'current' ? 'current' : undefined} /></Portal></CheckboxGroup>
        </CoreField></CoreForm>);
        expect(untrack(() => getCoreField(form, 'fruits').getValue())).toEqual(association === 'other' ? [] : ['apple']);
        view.unmount();
      } finally { mount.remove(); }
    });
    it.each(['onSubmit', 'onBlur', 'onChange'] as const)('inputless logical validation preserves mode (%s)', async (mode) => {
      const validate = vi.fn((value: unknown) => (value as string[]).length ? null : 'required');
      let engine!: FieldRootContextValue; let form!: FormContextValue;
      const view = await renderProps<{ value: readonly string[]; mounted: boolean }>((props) => <CoreForm expose={(context) => { form = context; }}>
        <CoreField name="group" validationMode={mode} validate={validate} expose={(context) => { engine = context; }}>
          <CheckboxGroup value={props.value}>{props.mounted && <Child value="one" />}</CheckboxGroup>
        </CoreField>
      </CoreForm>, { value: [], mounted: true });
      await view.setProps({ mounted: false }); validate.mockClear();
      await view.setProps({ value: ['one'] });
      expect(validate).toHaveBeenCalledTimes(mode === 'onChange' ? 1 : 0);
      expect(untrack(() => getCoreField(form, 'group').getValue())).toEqual([]);
      expect(untrack(() => engine.validation.getInputControl())).toBeNull();
      untrack(() => getCoreField(form, 'group').validate());
      expect(validate.mock.lastCall).toEqual([['one'], { group: [] }]);
    });
    it('inputless custom validation remains registered and clears submitted errors on change', async () => {
      let engine!: FieldRootContextValue; let form!: FormContextValue;
      const validate = vi.fn((value: unknown) => (value as string[]).length ? null : 'required');
      const view = await renderProps<CheckboxGroupProps>((props) => <CoreForm expose={(context) => { form = context; }}><CoreField name="group" validate={validate} expose={(context) => { engine = context; }}>
        <CheckboxGroup {...props} />
      </CoreField><button type="submit">Submit</button></CoreForm>, { value: [] });
      await view.user.click(view.getByText('Submit'));
      expect(untrack(() => engine.validityData.state.valid)).toBe(false);
      await view.setProps({ value: ['one'] });
      expect(untrack(() => engine.validityData.state.valid)).toBe(true);
    });
    it.each(['disabled', 'unmounted', 'reassociated', 'parent'] as const)('selects first eligible invalid child and excludes %s representatives', async (kind) => {
      let engine!: FieldRootContextValue;
      const view = await renderProps((props: { change: boolean }) => <><form id="other" /><CoreForm id="current"><CoreField name="group" expose={(context) => { engine = context; }}>
        <CheckboxGroup allValues={['one', 'two']}>
          <Child parent data-testid="parent" />
          {!(kind === 'unmounted' && props.change) && <Child value="one" data-testid="first" required
            disabled={kind === 'disabled' && props.change} form={kind === 'reassociated' && props.change ? 'other' : undefined} />}
          <Child value="two" data-testid="second" required />
        </CheckboxGroup>
      </CoreField><button type="submit">Submit</button></CoreForm></>, { change: false });
      await view.setProps({ change: true });
      await view.user.click(view.getByText('Submit'));
      expect(untrack(() => engine.validation.getInputControl())).toBe(kind === 'parent' ? view.getByTestId('first') : view.getByTestId('second'));
      expect(kind === 'parent' ? view.getByTestId('first') : view.getByTestId('second')).toHaveFocus();
      expect(view.getByTestId('parent')).not.toHaveFocus();
    });
    it('unmounting all native constraints unblocks submission', async () => {
      const submit = vi.fn();
      const view = await renderProps((props: { show: boolean }) => <CoreForm onSubmit={submit}><CoreField name="group"><CheckboxGroup>
        {props.show && <Child value="one" required />}
      </CheckboxGroup></CoreField><button type="submit">Submit</button></CoreForm>, { show: true });
      await view.user.click(view.getByText('Submit')); expect(submit).not.toHaveBeenCalled();
      await view.setProps({ show: false }); await view.user.click(view.getByText('Submit'));
      expect(submit).toHaveBeenCalledWith({ group: [] });
    });
    it('invalid inputless and all-disabled groups have no focusable representative', async () => {
      let empty!: FieldRootContextValue; let disabled!: FieldRootContextValue;
      await render(() => <CoreForm>
        <CoreField name="empty" validate={() => 'error'} expose={(field) => { empty = field; }}><CheckboxGroup value={[]} /></CoreField>
        <CoreField name="disabled" validate={() => 'error'} expose={(field) => { disabled = field; }}><CheckboxGroup><Child value="a" disabled /></CheckboxGroup></CoreField>
      </CoreForm>);
      for (const field of [empty, disabled]) {
        untrack(() => field.validation.commit([]));
        expect(untrack(() => field.validation.getInputControl())).toBeNull();
      }
    });
  });

  browserCase({ source: 'packages/react/src/checkbox-group/CheckboxGroup.test.tsx', case: 'native submission excludes parents and submits checked group values', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const submitted = vi.fn();
    const view = await render(() => <form onSubmit={(event) => { event.preventDefault(); submitted(new FormData(event.currentTarget).getAll('fruits')); }}>
      <CoreField name="fruits"><CheckboxGroup defaultValue={['a', 'b']} allValues={['a', 'b', 'c']}>
        <Child parent /><Child value="a" /><Child value="b" /><Child value="c" />
      </CheckboxGroup></CoreField><button type="submit">Submit</button>
    </form>);
    await view.user.click(view.getAllByRole('checkbox')[3]); await view.user.click(view.getByText('Submit'));
    expect(submitted).toHaveBeenCalledWith(['a', 'b', 'c']);
    expect(view.container.querySelector('input')!).not.toHaveAttribute('name');
  });
});
