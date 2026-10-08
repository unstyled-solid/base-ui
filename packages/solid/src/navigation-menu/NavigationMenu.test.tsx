import { describe, it, expect, vi } from 'vitest';
import { createSignal, flush, omit } from 'solid-js';
import { advanceTimers, createRenderer, fireEvent, waitFor, firePointer } from '../../test';
import { NavigationMenu } from './index';
import type { NavigationMenuRoot } from './root/NavigationMenuRoot';
import { DirectionProvider } from '../direction-provider';

function Fixture(props: NavigationMenuRoot.Props & { itemValue?: any; keepMounted?: boolean }) {
  const rootProps = omit(props, 'itemValue', 'keepMounted');
  return <NavigationMenu.Root {...rootProps}>
    <NavigationMenu.List data-testid="list">
      <NavigationMenu.Item value={props.itemValue ?? 'a'}>
        <NavigationMenu.Trigger data-testid="a">First<NavigationMenu.Icon data-testid="icon" /></NavigationMenu.Trigger>
        <NavigationMenu.Content keepMounted={props.keepMounted} data-testid="content-a">
          <NavigationMenu.Link href="#first">First link</NavigationMenu.Link>
          <button>Action</button>
          <NavigationMenu.Link closeOnClick href="#close">Close link</NavigationMenu.Link>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="b"><NavigationMenu.Trigger data-testid="b">Second</NavigationMenu.Trigger>
        <NavigationMenu.Content data-testid="content-b"><NavigationMenu.Link href="#second">Second link</NavigationMenu.Link></NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Portal keepMounted={props.keepMounted}>
      <NavigationMenu.Positioner data-testid="positioner"><NavigationMenu.Popup data-testid="popup"><NavigationMenu.Arrow /><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner>
    </NavigationMenu.Portal>
  </NavigationMenu.Root>;
}

describe('NavigationMenu source transactions and traversal', () => {
  const { render, renderProps } = createRenderer();
  for (const value of [0, false, '']) {
    it(`treats falsy ${JSON.stringify(value)} as a valid open value`, async () => {
      const changed = vi.fn();
      const view = await render(() => <Fixture itemValue={value} onValueChange={changed} />);
      await view.user.click(view.getByTestId('a'));
      expect(changed).toHaveBeenCalledTimes(1);
      expect(changed.mock.calls[0][0]).toBe(value);
      expect(view.getByTestId('a')).toHaveAttribute('aria-expanded', 'true');
      expect(view.getByTestId('content-a')).toBeVisible();
      expect(view.getByTestId('icon')).toHaveAttribute('data-popup-open');
    });
  }
  it('does not add aria-orientation to root or list', async () => {
    const view = await render(() => <Fixture orientation="vertical" />);
    expect(view.getByRole('navigation')).not.toHaveAttribute('aria-orientation');
    expect(view.getByTestId('list')).not.toHaveAttribute('aria-orientation');
  });
  it('cancellation prevents an open and preserves callback event identity', async () => {
    const changed = vi.fn((_value, details: NavigationMenuRoot.ChangeEventDetails) => details.cancel());
    const view = await render(() => <Fixture onValueChange={changed} />);
    const trigger = view.getByTestId('a');
    await view.user.click(trigger);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][1].event).toBeInstanceOf(MouseEvent);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByTestId('popup')).toBeNull();
  });
  it('controlled callbacks stay fresh and value changes preserve trigger identity', async () => {
    const first = vi.fn(); const second = vi.fn();
    const view = await renderProps((props: NavigationMenuRoot.Props) => <Fixture {...props} />, { value: 'a', onValueChange: first });
    const trigger = view.getByTestId('a');
    await view.setProps({ value: 'b', onValueChange: second });
    expect(view.getByTestId('a')).toBe(trigger);
    await view.user.click(trigger);
    expect(first).not.toHaveBeenCalled();
    expect(second.mock.calls[0][0]).toBe('a');
    expect(view.getByTestId('b')).toHaveAttribute('aria-expanded', 'true');
  });
  it('keyboard switching emits one list-navigation request and keeps trigger focus', async () => {
    const changed = vi.fn();
    const view = await render(() => <Fixture onValueChange={changed} />);
    await view.user.click(view.getByTestId('a'));
    await view.user.keyboard('{ArrowRight}');
    expect(view.getByTestId('b')).toHaveFocus();
    expect(changed).toHaveBeenCalledTimes(1);
    await view.user.keyboard('{ArrowDown}');
    expect(changed).toHaveBeenCalledTimes(2);
    expect(changed.mock.calls[1][1].reason).toBe('list-navigation');
    expect(view.getByTestId('b')).toHaveFocus();
  });
  it('mirrors vertical keyboard entry in RTL', async () => {
    const view = await render(() => <DirectionProvider direction="rtl"><Fixture orientation="vertical" /></DirectionProvider>);
    view.getByTestId('a').focus();
    await view.user.keyboard('{ArrowLeft}');
    expect(view.getByTestId('a')).toHaveAttribute('aria-expanded', 'true');
  });
  it('disabled triggers stay focusable but ignore activation', async () => {
    const changed = vi.fn();
    const view = await render(() => <NavigationMenu.Root onValueChange={changed}><NavigationMenu.List><NavigationMenu.Item><NavigationMenu.Trigger disabled>Disabled</NavigationMenu.Trigger></NavigationMenu.Item></NavigationMenu.List></NavigationMenu.Root>);
    const trigger = view.getByRole('button');
    trigger.focus();
    expect(trigger).toHaveFocus();
    await view.user.keyboard('{ArrowDown}{Enter}');
    fireEvent.click(trigger);
    expect(changed).not.toHaveBeenCalled();
    expect(trigger).toHaveAttribute('data-disabled');
  });
  it('touch input does not hover open', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Fixture />);
    try {
      const trigger = view.getByTestId('a');
      firePointer.enter(trigger, { pointerType: 'touch', timeStamp: 100 });
      fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
      await advanceTimers(50);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      firePointer.down(trigger, { pointerType: 'touch', timeStamp: 150 });
      fireEvent.click(trigger);
      flush();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('manual close preserves its opt-out through redundant close and completes once', async () => {
    const actions = { current: null as NavigationMenuRoot.Actions | null };
    const complete = vi.fn(); const changed = vi.fn((value, details: NavigationMenuRoot.ChangeEventDetails) => { if (value == null) details.preventUnmountOnClose(); });
    const view = await render(() => <Fixture defaultValue="a" actionsRef={actions} onValueChange={changed} onOpenChangeComplete={complete} />);
    actions.current!.unmount();
    flush(); // The source ignores this stale action before a later, separate close.
    expect(view.getByTestId('popup')).toBeInTheDocument();
    actions.current!.close();
    await waitFor(() => expect(view.getByTestId('a')).toHaveAttribute('aria-expanded', 'false'));
    actions.current!.close();
    expect(changed).toHaveBeenCalledTimes(1);
    expect(view.getByTestId('popup')).toBeInTheDocument();
    actions.current!.unmount();
    await waitFor(() => expect(view.queryByTestId('popup')).toBeNull());
    actions.current!.unmount();
    expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1);
    view.unmount();
    expect(actions.current).toBeNull();
  });
  for (const keepMounted of [false, true]) for (const defaultValue of [null, 'a']) {
    it(`Tab traverses arbitrary content and Shift+Tab re-enters the last item [keepMounted=${keepMounted}, defaultValue=${defaultValue}]`, async () => {
      const view = await render(() => <><Fixture keepMounted={keepMounted} defaultValue={defaultValue} /><button>After menu</button></>);
      if (defaultValue == null) await view.user.click(view.getByTestId('a'));
      else view.getByTestId('a').focus();
      await view.user.tab(); expect(view.getByText('First link')).toHaveFocus();
      await view.user.tab(); expect(view.getByText('Action')).toHaveFocus();
      await view.user.tab(); expect(view.getByText('Close link')).toHaveFocus();
      await view.user.tab(); expect(view.getByTestId('b')).toHaveFocus();
      await view.user.tab({ shift: true }); expect(view.getByText('Close link')).toHaveFocus();
      await view.user.tab(); await view.user.tab();
      expect(view.getByText('After menu')).toHaveFocus();
      if (keepMounted) expect(view.getByTestId('positioner')).toHaveAttribute('hidden');
      else expect(view.queryByTestId('popup')).toBeNull();
    });
  }
  it('deeply nested closeOnClick bubbles link-press through every root', async () => {
    const changed = [vi.fn(), vi.fn(), vi.fn()];
    function Nested(props: { level: number }) {
      return <NavigationMenu.Root defaultValue={false} onValueChange={changed[props.level]}>
        <NavigationMenu.List><NavigationMenu.Item value={false}><NavigationMenu.Trigger>Level {props.level}</NavigationMenu.Trigger>
          <NavigationMenu.Content>{props.level === 2 ? <NavigationMenu.Link href="#close" closeOnClick>Deep link</NavigationMenu.Link> : <Nested level={props.level + 1} />}</NavigationMenu.Content>
        </NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Viewport />
      </NavigationMenu.Root>;
    }
    const view = await render(() => <Nested level={0} />);
    expect(view.container.querySelectorAll('nav')).toHaveLength(1);
    await view.user.click(view.getByText('Deep link'));
    for (const callback of changed) {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toBeNull();
      expect(callback.mock.calls[0][1].reason).toBe('link-press');
    }
  });
  it('content remains hidden after closing a kept portal', async () => {
    const view = await render(() => <Fixture keepMounted />);
    expect(view.getByTestId('content-a')).toHaveAttribute('hidden');
    await view.user.click(view.getByTestId('a'));
    expect(view.getByTestId('content-a')).not.toHaveAttribute('hidden');
    await view.user.click(view.getByText('Close link'));
    await waitFor(() => expect(view.getByTestId('content-a')).toHaveAttribute('hidden'));
  });
  it('dynamic removal preserves navigation from the currently focused item', async () => {
    const view = await render(() => {
      const [removed, remove] = createSignal(false);
      return <><button onClick={() => remove(true)}>Remove</button><NavigationMenu.Root><NavigationMenu.List>
        {!removed() && <NavigationMenu.Item><NavigationMenu.Trigger>One</NavigationMenu.Trigger></NavigationMenu.Item>}
        <NavigationMenu.Item><NavigationMenu.Trigger>Two</NavigationMenu.Trigger></NavigationMenu.Item>
        <NavigationMenu.Item><NavigationMenu.Trigger>Three</NavigationMenu.Trigger></NavigationMenu.Item>
      </NavigationMenu.List></NavigationMenu.Root></>;
    });
    await view.user.click(view.getByText('Remove'));
    view.getByText('Two').focus();
    await view.user.keyboard('{ArrowRight}');
    expect(view.getByText('Three')).toHaveFocus();
  });
});
