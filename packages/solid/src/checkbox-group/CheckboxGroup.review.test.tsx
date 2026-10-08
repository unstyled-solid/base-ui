import { flush, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { describe, expect, it, vi } from 'vitest';
import { createRenderer, waitFor, within } from '../../test';
import { CheckboxGroup, type CheckboxGroupProps } from './CheckboxGroup';
import { CheckboxRoot, type CheckboxRootProps } from '../checkbox/root/CheckboxRoot';
import { CoreField, CoreLabel, CoreForm, getCoreField } from './test/CoreFixture';
import { createRenderElement } from '../internals/createRenderElement';
import type { FormContextValue } from '../internals/form-context';

// Source: CheckboxGroup/useCheckboxGroupParent and CheckboxRoot at
// 19511bb171f3b360b006c94cf6d07e53cb446505. Explicit same-turn native events
// exercise RC13 staged writes; UI reads must still use committed selection.
describe('CheckboxGroup source-first review', () => {
  const { render, renderProps } = createRenderer();
  it('parent-enabled removal splices one occurrence from the logical selection', async () => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxGroup defaultValue={['a', 'a']} allValues={['a', 'b']} onValueChange={changed}>
      <CheckboxRoot value="a" />
    </CheckboxGroup>);
    await view.user.click(view.getByRole('checkbox'));
    expect(changed.mock.lastCall?.[0]).toEqual(['a']);
    expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');
    expect(view.container.querySelector('input')!.checked).toBe(true);
  });
  it('keeps callback edits in the accepted group candidate and parent restore snapshot', async () => {
    const changed = vi.fn<NonNullable<CheckboxGroupProps['onValueChange']>>((next) => {
      if (next.length === 1 && next[0] === 'a') next.push('b');
    });
    const view = await render(() => <CheckboxGroup allValues={['a', 'b', 'c']} onValueChange={changed}>
      <CheckboxRoot parent data-testid="parent" /><CheckboxRoot value="a" data-testid="a" /><CheckboxRoot value="b" /><CheckboxRoot value="c" />
    </CheckboxGroup>);
    await view.user.click(view.getByTestId('a'));
    expect(view.getAllByRole('checkbox')[2]).toHaveAttribute('aria-checked', 'true');
    for (let index = 0; index < 3; index += 1) await view.user.click(view.getByTestId('parent'));
    expect(changed.mock.lastCall?.[0]).toEqual(['a', 'b']);
  });
  it('retains accepted candidate identity and callback mutations through repeated parent restore cycles', async () => {
    let accepted: string[] | undefined;
    const changed = vi.fn<NonNullable<CheckboxGroupProps['onValueChange']>>((next) => {
      if (!accepted) accepted = next;
      else if (next === accepted && next.length === 1) next.push('b');
    });
    const view = await render(() => <CheckboxGroup allValues={['a', 'b', 'c']} onValueChange={changed}>
      <CheckboxRoot parent data-testid="parent" /><CheckboxRoot value="a" aria-label="A" /><CheckboxRoot value="b" aria-label="B" /><CheckboxRoot value="c" />
    </CheckboxGroup>);
    await view.user.click(view.getByRole('checkbox', { name: 'A' }));
    for (let n = 0; n < 3; n += 1) await view.user.click(view.getByTestId('parent'));
    expect(changed.mock.lastCall?.[0]).toBe(accepted);
    expect(changed.mock.lastCall?.[0]).toEqual(['a', 'b']);
    expect(view.getByRole('checkbox', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
    for (let n = 0; n < 3; n += 1) await view.user.click(view.getByTestId('parent'));
    expect(changed.mock.lastCall?.[0]).toBe(accepted);
    expect(view.getByRole('checkbox', { name: 'B' }).nextElementSibling).toBeChecked();
  });
  it.each([false, true])('keeps independent mounts with identical values and omitted defaults isolated (parent=%s)', async (withParent) => {
    const firstChange = vi.fn();
    const secondChange = vi.fn();
    const mount = (change: NonNullable<CheckboxGroupProps['onValueChange']>) => render(() => <CheckboxGroup allValues={withParent ? ['a', 'b'] : undefined} onValueChange={change}>
      {withParent && <CheckboxRoot parent aria-label="Parent" />}
      <CheckboxRoot value="a" aria-label="A" /><CheckboxRoot value="b" aria-label="B" />
    </CheckboxGroup>);
    const first = await mount(firstChange);
    const second = await mount(secondChange);
    const a = within(first.container);
    const b = within(second.container);
    await first.user.click(a.getByRole('checkbox', { name: 'A' }));
    expect(firstChange.mock.lastCall?.[0]).toEqual(['a']);
    expect(secondChange).not.toHaveBeenCalled();
    for (const input of second.container.querySelectorAll('input')) expect(input).not.toBeChecked();
    await second.user.click(b.getByRole('checkbox', { name: withParent ? 'Parent' : 'B' }));
    expect(secondChange.mock.lastCall?.[0]).toEqual(withParent ? ['a', 'b'] : ['b']);
    expect(a.getByRole('checkbox', { name: 'A' })).toHaveAttribute('aria-checked', 'true');
    expect(a.getByRole('checkbox', { name: 'B' })).toHaveAttribute('aria-checked', 'false');
    first.unmount();
    expect(b.getByRole('checkbox', { name: 'B' })).toHaveAttribute('aria-checked', 'true');
  });
  it.each([false, true])('carries accepted same-turn child requests without losing membership (parent=%s)', async (withParent) => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxGroup allValues={withParent ? ['a', 'b'] : undefined} onValueChange={changed}>
      <CheckboxRoot value="a" /><CheckboxRoot value="b" />
    </CheckboxGroup>);
    const [a, b] = view.getAllByRole('checkbox');
    a.click(); b.click(); flush();
    expect(changed.mock.calls.map(([next]) => next)).toEqual([['a'], ['a', 'b']]);
    for (const child of [a, b]) expect(child).toHaveAttribute('aria-checked', 'true');
  });
  it.each([false, true])('a vetoed same-turn request does not replace the accepted candidate (parent=%s)', async (withParent) => {
    const changed = vi.fn<NonNullable<CheckboxGroupProps['onValueChange']>>((next, details) => {
      if (next.includes('b')) details.cancel();
    });
    const view = await render(() => <CheckboxGroup allValues={withParent ? ['a', 'b', 'c'] : undefined} onValueChange={changed}>
      <CheckboxRoot value="a" /><CheckboxRoot value="b" /><CheckboxRoot value="c" />
    </CheckboxGroup>);
    const [a, b, c] = view.getAllByRole('checkbox');
    a.click(); b.click(); c.click(); flush();
    expect(changed.mock.calls.map(([next]) => next)).toEqual([['a'], ['a', 'b'], ['a', 'c']]);
    expect(b).toHaveAttribute('aria-checked', 'false');
    expect(c).toHaveAttribute('aria-checked', 'true');
  });
  it('controlled proposals remain proposals during same-turn interaction', async () => {
    const changed = vi.fn();
    const view = await render(() => <CheckboxGroup value={[]} onValueChange={changed}>
      <CheckboxRoot value="a" /><CheckboxRoot value="b" />
    </CheckboxGroup>);
    const [a, b] = view.getAllByRole('checkbox');
    a.click(); b.click(); flush();
    expect(changed.mock.calls.map(([next]) => next)).toEqual([['a'], ['b']]);
    await waitFor(() => expect(view.container.querySelectorAll<HTMLInputElement>('input')[1].checked).toBe(false));
  });
  it('reads checkbox callbacks before the current group callback, sharing cancellation details', async () => {
    const order: string[] = [];
    let childDetails: CheckboxRoot.ChangeEventDetails | undefined;
    const old = vi.fn();
    const view = await renderProps<CheckboxGroupProps>((props) => <CheckboxGroup {...props} allValues={['a']}>
      <CheckboxRoot value="a" onCheckedChange={(_, details) => { order.push('child'); childDetails = details; }} />
    </CheckboxGroup>, { onValueChange: old });
    await view.setProps({ onValueChange: (_, details) => { order.push('group'); expect(details).toBe(childDetails); details.cancel(); } });
    await view.user.click(view.getByRole('checkbox'));
    expect(order).toEqual(['child', 'group']);
    expect(old).not.toHaveBeenCalled();
    expect(view.container.querySelector('input')!.checked).toBe(false);
  });
  it('updates membership, metadata and parent controls when a live child value changes', async () => {
    let form!: FormContextValue;
    const view = await renderProps((props: { value: string }) => <CoreForm expose={(context) => { form = context; }}><CoreField name="items">
      <CheckboxGroup defaultValue={['a']} allValues={['a', 'b']}>
        <CheckboxRoot parent data-testid="parent" /><CheckboxRoot value={props.value} data-testid="child" />
      </CheckboxGroup>
    </CoreField></CoreForm>, { value: 'a' });
    const child = view.getByTestId('child');
    expect(untrack(() => getCoreField(form, 'items').getValue())).toEqual(['a']);
    await view.setProps({ value: 'b' });
    expect(view.getByTestId('child')).toBe(child);
    expect(child).toHaveAttribute('aria-checked', 'false');
    expect(untrack(() => getCoreField(form, 'items').getValue())).toEqual([]);
    expect(view.getByTestId('parent')).toHaveAttribute('aria-controls', child.id);
    await view.user.click(child);
    expect(untrack(() => getCoreField(form, 'items').getValue())).toEqual(['b']);
  });
  it.each([false, true])('tracks rendered child id replacement, fallback and removal with the current foundation (nativeButton=%s)', async (nativeButton) => {
    const view = await renderProps<{ override: string | undefined; mounted: boolean }>((props) => <CheckboxGroup allValues={['a']}>
      <CheckboxRoot parent data-testid="parent" />
      {props.mounted && <CheckboxRoot value="a" aria-label="A" nativeButton={nativeButton} render={(attributes) => createRenderElement(nativeButton ? 'button' : 'span', {}, {
        props: [attributes, { get id() { return props.override ?? attributes.id; } }],
      })} />}
    </CheckboxGroup>, { override: 'rendered-a', mounted: true });
    const parent = view.getByTestId('parent');
    const child = view.getByRole('checkbox', { name: 'A' });
    expect(parent).toHaveAttribute('aria-controls', 'rendered-a');
    await view.setProps({ override: 'rendered-b' });
    expect(view.getByRole('checkbox', { name: 'A' })).toBe(child);
    expect(parent).toHaveAttribute('aria-controls', 'rendered-b');
    await view.setProps({ override: undefined });
    expect(child.id).not.toBe('rendered-b');
    expect(child.id).not.toBe('');
    expect(parent).toHaveAttribute('aria-controls', child.id);
    await view.setProps({ mounted: false });
    expect(parent).not.toHaveAttribute('aria-controls');
    child.id = 'detached-child';
    await Promise.resolve();
    expect(parent).not.toHaveAttribute('aria-controls');
  });
  it.each([false, true])('a true remount replaces the explicit id and retains label association (nativeButton=%s)', async (nativeButton) => {
    const button: CheckboxRootProps['render'] = (props) => <button {...(props as JSX.ButtonHTMLAttributes<HTMLButtonElement>)} />;
    const view = await renderProps((props: { replace: boolean }) => <CoreField><CoreLabel>Label</CoreLabel>
      {props.replace ? <CheckboxRoot nativeButton={nativeButton} render={nativeButton ? button : undefined} />
        : <CheckboxRoot id="old" nativeButton={nativeButton} render={nativeButton ? button : undefined} />}
    </CoreField>, { replace: false });
    const oldRoot = view.getByRole('checkbox');
    await view.setProps({ replace: true });
    const target = nativeButton ? view.getByRole('checkbox') : view.container.querySelector('input')!;
    expect(view.getByRole('checkbox')).not.toBe(oldRoot);
    expect(target.id).not.toBe('old');
    expect(target.id).not.toBe('');
    expect(view.getByText('Label')).toHaveAttribute('for', target.id);
  });
  it('canceled reset preserves the parent restore cycle', async () => {
    const changed = vi.fn();
    const view = await render(() => <form onReset={(event) => event.preventDefault()}>
      <CheckboxGroup defaultValue={['a']} allValues={['a', 'b']} onValueChange={changed}>
        <CheckboxRoot parent data-testid="parent" /><CheckboxRoot value="a" /><CheckboxRoot value="b" />
      </CheckboxGroup>
    </form>);
    await view.user.click(view.getByTestId('parent'));
    view.container.querySelector('form')!.reset();
    await Promise.resolve(); flush();
    expect(view.getByTestId('parent')).toHaveAttribute('aria-checked', 'true');
    await view.user.click(view.getByTestId('parent'));
    expect(changed.mock.lastCall?.[0]).toEqual([]);
    await view.user.click(view.getByTestId('parent'));
    expect(changed.mock.lastCall?.[0]).toEqual(['a']);
  });
  it.each([false, true])('reset restores a valueless independent checkbox inside a plain group (%s)', async (defaultChecked) => {
    const changed = vi.fn();
    const view = await render(() => <form><CheckboxGroup>
      <CheckboxRoot defaultChecked={defaultChecked} onCheckedChange={changed} />
    </CheckboxGroup></form>);
    await view.user.click(view.getByRole('checkbox'));
    view.container.querySelector('form')!.reset();
    await waitFor(() => expect(view.getByRole('checkbox')).toHaveAttribute('aria-checked', String(defaultChecked)));
    expect(view.container.querySelector('input')!.checked).toBe(defaultChecked);
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it('controlled group reset reasserts current input state without notifying', async () => {
    const changed = vi.fn();
    const view = await renderProps<CheckboxGroupProps>((props) => <form><CheckboxGroup {...props} allValues={['a', 'b']}>
      <CheckboxRoot parent data-testid="parent" /><CheckboxRoot value="a" /><CheckboxRoot value="b" />
    </CheckboxGroup></form>, { value: [], onValueChange: changed });
    await view.setProps({ value: ['a', 'b'] });
    view.container.querySelector('form')!.reset();
    await waitFor(() => expect(view.container.querySelectorAll<HTMLInputElement>('input')[2].checked).toBe(true));
    expect(view.getByTestId('parent')).toHaveAttribute('aria-checked', 'true');
    expect(changed).not.toHaveBeenCalled();
  });
});
