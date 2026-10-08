import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { createRenderer, browserCase } from '../../test';
import { Toggle } from './Toggle';
import { ToggleGroup } from '../toggle-group/ToggleGroup';
import { ToolbarRoot } from '../toolbar/root/ToolbarRoot';
import { ToolbarGroup } from '../toolbar/group/ToolbarGroup';
import { ToolbarButton } from '../toolbar/button/ToolbarButton';

// Real family replay, without mocks. Sources at 19511bb171f3b360b006c94cf6d07e53cb446505:
// toggle/Toggle.test.tsx: item cancellation, render composite props.
// toggle-group/ToggleGroup.test.tsx: controlled/uncontrolled, multiple, group cancellation.
// toolbar/button/ToolbarButton.test.tsx: direct ToggleGroup children, disabled navigation.
describe('Toggle real group/toolbar composition', () => {
  const { render, renderProps } = createRenderer();

  it.each(['none', 'item', 'group'] as const)('item then group share details; cancellation=%s', async (cancelAt) => {
    const order: string[] = [];
    let itemDetails: Toggle.ChangeEventDetails | undefined;
    const groupChange = vi.fn((next: string[], details: Toggle.ChangeEventDetails) => {
      order.push('group');
      expect(next).toEqual(['one']);
      expect(details).toBe(itemDetails);
      if (cancelAt === 'group') details.cancel();
    });
    const view = await render(() => <ToggleGroup onValueChange={groupChange}>
      <Toggle value="one" onPressedChange={(next, details) => {
        order.push('item');
        expect(next).toBe(true);
        itemDetails = details;
        if (cancelAt === 'item') details.cancel();
      }} />
      <Toggle value="two" />
    </ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one);
    expect(order).toEqual(cancelAt === 'item' ? ['item'] : ['item', 'group']);
    expect(groupChange).toHaveBeenCalledTimes(cancelAt === 'item' ? 0 : 1);
    expect(one).toHaveAttribute('aria-pressed', String(cancelAt === 'none'));
    expect(two).toHaveAttribute('aria-pressed', 'false');
  });

  it('group membership overrides pressed/defaultPressed and follows live item values', async () => {
    const change = vi.fn();
    const view = await renderProps<{ value: string; selection: string[] }>((props) =>
      <ToggleGroup value={props.selection} onValueChange={change}>
        <Toggle value={props.value} pressed defaultPressed />
      </ToggleGroup>, { value: 'one', selection: [] });
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.user.click(button);
    expect(change).toHaveBeenCalledWith(['one'], expect.anything());
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await view.setProps({ selection: ['two'], value: 'two' });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    await view.user.click(button);
    expect(change).toHaveBeenLastCalledWith([], expect.anything());
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it.each(['none', 'item', 'group'] as const)('deselection is one vetoable transaction; cancellation=%s', async (cancelAt) => {
    const order: string[] = [];
    let itemDetails: Toggle.ChangeEventDetails | undefined;
    const view = await render(() => <ToggleGroup multiple defaultValue={['one', 'two']} onValueChange={(next, details) => {
      order.push('group');
      expect(next).toEqual(['two']);
      expect(details).toBe(itemDetails);
      if (cancelAt === 'group') details.cancel();
    }}>
      <Toggle value="one" onPressedChange={(next, details) => {
        order.push('item');
        expect(next).toBe(false);
        itemDetails = details;
        if (cancelAt === 'item') details.cancel();
      }} />
      <Toggle value="two" />
    </ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    await view.user.click(one);
    expect(order).toEqual(cancelAt === 'item' ? ['item'] : ['item', 'group']);
    expect(one).toHaveAttribute('aria-pressed', String(cancelAt !== 'none'));
    expect(one.hasAttribute('data-pressed')).toBe(cancelAt !== 'none');
    expect(two).toHaveAttribute('aria-pressed', 'true');
  });

  it.each(['Enter', 'Space'])('grouped native %s activation calls item then group exactly once per press', async (key) => {
    const order: string[] = [];
    const item = vi.fn((_: boolean, details: Toggle.ChangeEventDetails) => {
      order.push('item');
      expect(details.event).toBeInstanceOf(MouseEvent);
    });
    const group = vi.fn((_: string[], details: Toggle.ChangeEventDetails) => {
      order.push('group');
      expect(details).toBe(item.mock.lastCall?.[1]);
    });
    const view = await render(() => <ToggleGroup onValueChange={group}>
      <Toggle value="one" onPressedChange={item} /><Toggle value="two" />
    </ToggleGroup>);
    const [one, two] = view.getAllByRole('button');
    await view.user.tab();
    expect(one).toHaveFocus();
    await view.user.keyboard(`[${key}]`);
    expect(one).toHaveAttribute('aria-pressed', 'true');
    await view.user.keyboard(`[${key}]`);
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(two).toHaveAttribute('aria-pressed', 'false');
    expect(order).toEqual(['item', 'group', 'item', 'group']);
    expect(item.mock.calls.map(([next]) => next)).toEqual([true, false]);
    expect(group.mock.calls.map(([next]) => next)).toEqual([['one'], []]);
  });

  it('uses current item/group callbacks and consumer click runs before the transaction', async () => {
    const order: string[] = [];
    const oldItem = vi.fn();
    const oldGroup = vi.fn();
    const view = await renderProps<{
      item: Toggle.Props['onPressedChange'];
      group: ToggleGroup.Props['onValueChange'];
    }>((props) => <ToggleGroup onValueChange={props.group}>
      <Toggle value="one" onPressedChange={props.item} onClick={() => order.push('click')} />
    </ToggleGroup>, { item: oldItem, group: oldGroup });
    const button = view.getByRole('button');
    await view.setProps({
      item: () => { order.push('item'); expect(button).toHaveAttribute('aria-pressed', 'false'); },
      group: () => { order.push('group'); expect(button).toHaveAttribute('aria-pressed', 'false'); },
    });
    await view.user.click(button);
    expect(oldItem).not.toHaveBeenCalled();
    expect(oldGroup).not.toHaveBeenCalled();
    expect(order).toEqual(['click', 'item', 'group']);
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('grouped render preserves focus, live disabled/pressed state, class and style on one host', async () => {
    let renderCount = 0;
    const view = await renderProps<{ disabled: boolean; selection: string[] }>((props) => <ToggleGroup value={props.selection}>
      <Toggle value="one" disabled={props.disabled}
        class={(state) => ({ pressed: state.pressed, disabled: state.disabled })}
        style={(state) => ({ color: state.pressed ? 'red' : 'blue' })}
        render={(host, state) => {
          renderCount++;
          return <button {...host as JSX.ButtonHTMLAttributes<HTMLButtonElement>}
            data-live-pressed={String(state.pressed)} data-live-disabled={String(state.disabled)} />;
        }} />
    </ToggleGroup>, { disabled: false, selection: [] });
    const button = view.getByRole('button');
    await view.user.tab();
    expect(button).toHaveFocus();
    await view.setProps({ selection: ['one'] });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('data-live-pressed', 'true');
    expect(button).toHaveClass('pressed');
    expect(button.style.color).toBe('red');
    await view.setProps({ disabled: true });
    expect(view.getByRole('button')).toBe(button);
    expect(button).toHaveAttribute('data-live-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled');
    expect(button).toHaveClass('pressed', 'disabled');
    expect(button).toBeDisabled();
    expect(renderCount).toBe(1);
  });

  it('grouped Toggle ignores form/type/value projection on native custom hosts', async () => {
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const view = await render(() => <form data-testid="form" onSubmit={submit}>
      <ToggleGroup>
        <Toggle value="one" name="toggle" type="submit" form="other-form"
          render={(host) => <button {...host as JSX.ButtonHTMLAttributes<HTMLButtonElement>} />} />
      </ToggleGroup>
    </form>);
    const button = view.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).not.toHaveAttribute('form');
    expect(button).not.toHaveAttribute('value');
    await view.user.click(button);
    await view.user.keyboard('[Enter][Space]');
    expect(submit).not.toHaveBeenCalled();
    expect([...new FormData(view.getByTestId('form') as HTMLFormElement)]).toEqual([]);
  });

  it('controlled Toolbar selection accepts callback proposals through live external state', async () => {
    const change = vi.fn();
    const view = await render(() => {
      const [value, setValue] = createSignal<string[]>([]);
      return <ToolbarRoot><ToggleGroup value={value()} onValueChange={(next, details) => {
        change(next, details);
        setValue(next);
      }}>
        <Toggle value="one" /><Toggle value="two" />
      </ToggleGroup></ToolbarRoot>;
    });
    const [one, two] = view.getAllByRole('button');
    await view.user.keyboard('[Tab][Enter]');
    expect(one).toHaveFocus();
    expect(one).toHaveAttribute('aria-pressed', 'true');
    await view.user.keyboard('[ArrowRight][Space]');
    expect(two).toHaveFocus();
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(two).toHaveAttribute('aria-pressed', 'true');
    expect(change.mock.calls.map(([next]) => next)).toEqual([['one'], ['two']]);
    expect(view.getAllByRole('button')).toEqual([one, two]);
  });

  it('group disabled state updates all items without losing per-item disabled state', async () => {
    const change = vi.fn();
    const view = await renderProps((props: { disabled: boolean }) => <ToggleGroup disabled={props.disabled} onValueChange={change}>
      <Toggle value="one" /><Toggle value="two" disabled />
    </ToggleGroup>, { disabled: true });
    const [one, two] = view.getAllByRole('button');
    expect(one).toBeDisabled();
    expect(two).toBeDisabled();
    await view.user.click(one);
    expect(change).not.toHaveBeenCalled();
    await view.setProps({ disabled: false });
    expect(one).not.toBeDisabled();
    expect(two).toBeDisabled();
    await view.user.click(one);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it.each([false, true])('Toolbar direct children navigate/select (multiple=%s)', async (multiple) => {
    const change = vi.fn();
    const view = await render(() => <ToolbarRoot>
      <ToggleGroup defaultValue={['one']} multiple={multiple} onValueChange={change}>
        <Toggle value="one" /> <Toggle value="two" /> <Toggle value="three" />
      </ToggleGroup>
    </ToolbarRoot>);
    const [one, two, three] = view.getAllByRole('button');
    await view.user.tab();
    expect(one).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(two).toHaveFocus();
    await view.user.keyboard('[ArrowRight][Enter]');
    expect(three).toHaveFocus();
    expect(change).toHaveBeenCalledExactlyOnceWith(multiple ? ['one', 'three'] : ['three'], expect.anything());
    expect(one).toHaveAttribute('aria-pressed', String(multiple));
    expect(three).toHaveAttribute('aria-pressed', 'true');
  });

  it('Toolbar.Group disabled makes direct Toggle children natively disabled and skips them', async () => {
    const view = await render(() => <ToolbarRoot>
      <ToolbarButton>Before</ToolbarButton>
      <ToolbarGroup disabled><ToggleGroup>
        <Toggle value="one" /><Toggle value="two" />
      </ToggleGroup></ToolbarGroup>
      <ToolbarButton>After</ToolbarButton>
    </ToolbarRoot>);
    const [before, one, two, after] = view.getAllByRole('button');
    expect(one).toBeDisabled();
    expect(two).toBeDisabled();
    await view.user.tab();
    expect(before).toHaveFocus();
    await view.user.keyboard('[ArrowRight]');
    expect(after).toHaveFocus();
    expect(one).not.toHaveAttribute('tabindex', '0');
    expect(two).not.toHaveAttribute('tabindex', '0');
  });

  it('Toolbar.Button render composition preserves standalone and grouped activation', async () => {
    const change = vi.fn();
    // Toolbar's generic render ref is narrowed to the native button target used
    // by this composition. No host props or refs are discarded by the adapter.
    const view = await render(() => <ToolbarRoot>
      <ToolbarButton render={(props) => <Toggle {...props as Toggle.Props} onPressedChange={change} />} value="apple" />
      <ToggleGroup>
        <ToolbarButton render={(props) => <Toggle {...props as Toggle.Props} onPressedChange={change} />} value="one" />
        <ToolbarButton render={(props) => <Toggle {...props as Toggle.Props} onPressedChange={change} />} value="two" />
      </ToggleGroup>
    </ToolbarRoot>);
    const [apple, one, two] = view.getAllByRole('button');
    await view.user.tab();
    expect(apple).toHaveFocus();
    await view.user.keyboard('[Enter]');
    expect(apple).toHaveAttribute('aria-pressed', 'true');
    await view.user.keyboard('[ArrowRight][Space]');
    expect(one).toHaveFocus();
    expect(one).toHaveAttribute('aria-pressed', 'true');
    await view.user.keyboard('[ArrowRight][Enter]');
    expect(two).toHaveFocus();
    expect(two).toHaveAttribute('aria-pressed', 'true');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(change).toHaveBeenCalledTimes(3);
  });

  it('disabled Toolbar.Button render composition stays focusable and blocks Toggle activation', async () => {
    const change = vi.fn();
    const view = await render(() => <ToolbarRoot>
      <ToolbarButton disabled render={(host) => <Toggle {...host as Toggle.Props} onPressedChange={change} />} value="apple" />
      <ToggleGroup>
        <ToolbarButton disabled render={(host) => <Toggle {...host as Toggle.Props} onPressedChange={change} />} value="one" />
        <ToolbarButton disabled render={(host) => <Toggle {...host as Toggle.Props} onPressedChange={change} />} value="two" />
      </ToggleGroup>
    </ToolbarRoot>);
    const buttons = view.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    for (const button of buttons) {
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-disabled');
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
    await view.user.tab();
    for (let index = 0; index < buttons.length; index++) {
      expect(buttons[index]).toHaveFocus();
      await view.user.keyboard('[Enter][Space]');
      expect(change).not.toHaveBeenCalled();
      if (index < buttons.length - 1) await view.user.keyboard('[ArrowRight]');
    }
  });

  for (const inToolbar of [false, true]) {
    browserCase({
      source: 'packages/react/src/toggle-group/ToggleGroup.test.tsx',
      case: `multiple transitions: preserves selection and roving focus (${inToolbar ? 'nested in Toolbar.Group' : 'standalone'})`,
      environment: 'browser', issue: 'bsolid-browser',
    }, async () => {
      const view = await renderProps((props: { multiple: boolean }) => {
        const group = () => <ToggleGroup defaultValue={['one']} multiple={props.multiple}>
          <Toggle value="one" /><Toggle value="two" />
        </ToggleGroup>;
        return inToolbar ? <ToolbarRoot><ToolbarGroup>{group()}</ToolbarGroup></ToolbarRoot> : group();
      }, { multiple: false });
      const [one, two] = view.getAllByRole('button');
      await view.user.keyboard('[Tab][ArrowRight]');
      expect(two).toHaveFocus();
      await view.user.click(two);
      expect(one).toHaveAttribute('aria-pressed', 'false');
      await view.setProps({ multiple: true });
      await view.user.click(one);
      expect(one).toHaveAttribute('aria-pressed', 'true');
      expect(two).toHaveAttribute('aria-pressed', 'true');
      await view.user.click(two);
      expect(two).toHaveAttribute('aria-pressed', 'false');
      await view.setProps({ multiple: false });
      await view.user.click(two);
      expect(one).toHaveAttribute('aria-pressed', 'false');
      expect(two).toHaveAttribute('aria-pressed', 'true');
      await view.user.keyboard('[ArrowLeft]');
      expect(one).toHaveFocus();
      expect(view.getAllByRole('button')).toEqual([one, two]);
    });
  }

  for (const initiallyDisabled of [false, true]) {
    browserCase({
      source: 'packages/react/src/toolbar/button/ToolbarButton.test.tsx',
      case: initiallyDisabled ? 'skips disabled direct ToggleGroup > Toggle children' : 'skips a direct Toggle that becomes disabled at runtime',
      environment: 'browser', issue: 'bsolid-browser',
    }, async () => {
      const view = await renderProps((props: { disabled: boolean }) => <ToolbarRoot><ToggleGroup>
        <Toggle value="one" /><Toggle value="two" disabled={props.disabled} /><Toggle value="three" />
      </ToggleGroup></ToolbarRoot>, { disabled: initiallyDisabled });
      const [one, two, three] = view.getAllByRole('button');
      await view.user.tab();
      expect(one).toHaveFocus();
      if (!initiallyDisabled) await view.setProps({ disabled: true });
      expect(two).toBeDisabled();
      await view.user.keyboard('[ArrowRight]');
      expect(three).toHaveFocus();
      expect(two).not.toHaveAttribute('tabindex', '0');
    });
  }
});
