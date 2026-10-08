import { describe, expect, it, vi } from 'vitest';
import { createRenderer, fireEvent, firePointer, screen, waitFor, advanceTimers, flushMicrotasks } from '#test-utils';
import { NavigationMenu } from './index';
import type { NavigationMenuRoot } from './root/NavigationMenuRoot';

const { render, renderProps } = createRenderer();
function Fixture(props: NavigationMenuRoot.Props & { keepMounted?: boolean }) {
  return <NavigationMenu.Root value={props.value} defaultValue={props.defaultValue} onValueChange={props.onValueChange} actionsRef={props.actionsRef} onOpenChangeComplete={props.onOpenChangeComplete} delay={props.delay} closeDelay={props.closeDelay}>
    <NavigationMenu.List data-testid="list">
      <NavigationMenu.Item value="a"><NavigationMenu.Trigger>A</NavigationMenu.Trigger><NavigationMenu.Content keepMounted={props.keepMounted} data-testid="panel-a"><NavigationMenu.Link href="#first">First</NavigationMenu.Link><button>Action</button><NavigationMenu.Link href="#last" closeOnClick>Last</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
      <NavigationMenu.Item value="b"><NavigationMenu.Trigger>B</NavigationMenu.Trigger><NavigationMenu.Content keepMounted={props.keepMounted} data-testid="panel-b"><NavigationMenu.Link href="#b">B link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
      <NavigationMenu.Item><NavigationMenu.Link href="#top">Top link</NavigationMenu.Link></NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Portal keepMounted={props.keepMounted}><NavigationMenu.Positioner data-testid="positioner"><NavigationMenu.Popup data-testid="popup"><NavigationMenu.Viewport data-testid="viewport" /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal>
  </NavigationMenu.Root>;
}
function Inline(props: { value?: any; defaultValue?: any; onValueChange?: NavigationMenuRoot.Props['onValueChange']; keepMounted?: boolean }) {
  return <NavigationMenu.Root data-testid="inline-root" defaultValue={props.defaultValue !== undefined ? props.defaultValue : props.value ?? 'a'} onValueChange={props.onValueChange}>
    <NavigationMenu.List data-testid="inline-list">
      <NavigationMenu.Item value={props.value ?? 'a'}><NavigationMenu.Trigger data-testid="inline-a">Inline A</NavigationMenu.Trigger>
        <NavigationMenu.Content keepMounted={props.keepMounted} data-testid="inline-panel-a"><NavigationMenu.Link href="#inline-first">Inline first</NavigationMenu.Link><button>Inline action</button></NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="b"><NavigationMenu.Trigger data-testid="inline-b">Inline B</NavigationMenu.Trigger><NavigationMenu.Content keepMounted={props.keepMounted} data-testid="inline-panel-b"><NavigationMenu.Link href="#inline-last" closeOnClick>Inline last</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Viewport data-testid="inline-viewport" />
  </NavigationMenu.Root>;
}
function NestedInline(props: { closed?: boolean } = {}) {
  return <NavigationMenu.Root defaultValue="outer"><NavigationMenu.List><NavigationMenu.Item value="outer"><NavigationMenu.Trigger>Outer</NavigationMenu.Trigger><NavigationMenu.Content>
    <NavigationMenu.Link href="#before">Before nested</NavigationMenu.Link><Inline defaultValue={props.closed ? null : 'a'} />
  </NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Viewport /></NavigationMenu.Root>;
}

describe('NavigationMenu pinned source DOM review', () => {
  it('click opens, switches, and closes through a link once', async () => {
    const changed = vi.fn();
    await render(() => <Fixture onValueChange={changed} />);
    fireEvent.click(screen.getByText('A'));
    await waitFor(() => expect(screen.getByTestId('panel-a')).toBeVisible());
    expect(screen.getByText('A')).toHaveAttribute('aria-controls', screen.getByTestId('popup').id);
    fireEvent.click(screen.getByText('B'));
    await waitFor(() => expect(screen.getByTestId('panel-b')).toBeVisible());
    expect(changed.mock.calls.map(([value]) => value)).toEqual(['a', 'b']);
    fireEvent.click(screen.getByText('A'));
    await waitFor(() => expect(screen.getByTestId('panel-a')).toBeVisible());
    fireEvent.click(screen.getByText('Last'));
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    expect(changed.mock.calls.map(([value]) => value)).toEqual(['a', 'b', 'a', null]);
  });
  it('honors hover delay, scopes pointer suppression, switches immediately and clears on floating entry', async () => {
    vi.useFakeTimers();
    const changed = vi.fn(); const view = await render(() => <Fixture delay={100} closeDelay={200} onValueChange={changed} />);
    try {
      const first = screen.getByText('A'); const second = screen.getByText('B'); const list = screen.getByTestId('list');
      fireEvent.mouseEnter(first); fireEvent.mouseMove(first);
      await advanceTimers(99);
      expect(first).toHaveAttribute('aria-expanded', 'false');
      await advanceTimers(1);
      expect(first).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('panel-a')).toBeInTheDocument();
      expect(list.style.pointerEvents).toBe('none');
      expect(document.body.style.pointerEvents).toBe('');
      fireEvent.mouseEnter(screen.getByTestId('positioner'));
      expect(list.style.pointerEvents).toBe('');
      fireEvent.mouseEnter(second); fireEvent.mouseMove(second);
      await advanceTimers(0);
      expect(second).toHaveAttribute('aria-expanded', 'true');
      expect(list.style.pointerEvents).toBe('none');
      expect(changed.mock.calls.map(([value]) => value)).toEqual(['a', 'b']);
      firePointer.down(second, { pointerType: 'mouse', timeStamp: 150 });
      expect(list.style.pointerEvents).toBe('');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('releases the eager kept-portal hover lock when leaving before the rest delay', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Fixture keepMounted delay={100} />);
    try {
      const trigger = screen.getByText('A'); const list = screen.getByTestId('list');
      fireEvent.mouseEnter(trigger);
      expect(list.style.pointerEvents).toBe('none');
      fireEvent.mouseLeave(trigger);
      expect(list.style.pointerEvents).toBe('');
      await advanceTimers(100);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByTestId('panel-a')).toHaveAttribute('hidden');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('a quick click sticks after hover; a patient click closes after the threshold', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Fixture />);
    try {
      const trigger = screen.getByText('A');
      fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
      await advanceTimers(50);
      fireEvent.click(trigger); await advanceTimers(0);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await advanceTimers(500);
      fireEvent.click(trigger); await advanceTimers(0);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByTestId('popup')).toBeNull();
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('hover leave respects closeDelay and does not restore trigger focus', async () => {
    vi.useFakeTimers();
    const view = await render(() => <Fixture closeDelay={200} />);
    try {
      const trigger = screen.getByText('A');
      fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
      await advanceTimers(50);
      fireEvent.mouseLeave(trigger); fireEvent.mouseLeave(screen.getByTestId('positioner'));
      await advanceTimers(199);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await advanceTimers(1);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByTestId('popup')).toBeNull();
      expect(trigger).not.toHaveFocus();
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('a closed standalone viewport has no unpaired focus guards', async () => {
    const view = await render(() => <NavigationMenu.Root><NavigationMenu.Viewport data-testid="empty-viewport" /></NavigationMenu.Root>);
    expect(view.container.querySelectorAll('[data-base-ui-focus-guard]')).toHaveLength(0);
    expect(screen.getByTestId('empty-viewport').firstElementChild?.tagName).toBe('DIV');
  });
  for (const value of [0, false, '']) {
    it(`keeps falsy inline value ${String(value)} open on trigger click`, async () => {
      await render(() => <Inline value={value} />);
      expect(screen.getByTestId('inline-panel-a')).toBeVisible();
      fireEvent.click(screen.getByTestId('inline-a'));
      await flushMicrotasks();
      expect(screen.getByTestId('inline-a')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('inline-panel-a')).toBeVisible();
    });
  }
  it('kept inline content stays in its viewport and hides after a switch', async () => {
    await render(() => <Inline keepMounted />);
    const first = screen.getByTestId('inline-panel-a');
    const second = screen.getByTestId('inline-panel-b');
    expect(screen.getByTestId('inline-viewport')).toContainElement(first);
    expect(second).toHaveAttribute('hidden');
    fireEvent.click(screen.getByTestId('inline-b'));
    await waitFor(() => expect(second).not.toHaveAttribute('hidden'));
    await waitFor(() => expect(first).toHaveAttribute('hidden'));
    expect(screen.getByTestId('inline-panel-a')).toBe(first);
    expect(screen.getByTestId('inline-panel-b')).toBe(second);
  });
  it('nested arrows navigate in the parent content without changing the active panel', async () => {
    const changed = vi.fn();
    const view = await render(() => <NavigationMenu.Root defaultValue="outer"><NavigationMenu.List><NavigationMenu.Item value="outer"><NavigationMenu.Trigger>Outer</NavigationMenu.Trigger><NavigationMenu.Content>
      <NavigationMenu.Link href="#before">Before nested</NavigationMenu.Link><Inline onValueChange={changed} />
    </NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Viewport /></NavigationMenu.Root>);
    screen.getByText('Before nested').focus();
    await view.user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('inline-a')).toHaveFocus();
    await view.user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('inline-b')).toHaveFocus();
    expect(changed).not.toHaveBeenCalled();
    expect(screen.getByTestId('inline-a')).toHaveAttribute('aria-expanded', 'true');
    await view.user.keyboard('{ArrowUp}{ArrowUp}');
    expect(screen.getByText('Before nested')).toHaveFocus();
  });
  it('Tab enters inline content then leaves for the next inactive trigger; Shift+Tab re-enters', async () => {
    const view = await render(() => <NestedInline />);
    screen.getByTestId('inline-a').focus();
    await view.user.tab();
    expect(screen.getByText('Inline first')).toHaveFocus();
    await view.user.tab();
    expect(screen.getByText('Inline action')).toHaveFocus();
    await view.user.tab();
    expect(screen.getByTestId('inline-b')).toHaveFocus();
    expect(screen.getByTestId('inline-viewport')).toHaveAttribute('inert');
    expect(screen.getByTestId('inline-a')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByTestId('inline-panel-b')).toBeNull();
    await view.user.tab({ shift: true });
    expect(screen.getByText('Inline action')).toHaveFocus();
    expect(screen.getByTestId('inline-viewport')).not.toHaveAttribute('inert');
  });
  for (const [placement, rect, leave, point] of [
    ['right', { x: 120, y: 0, width: 100, height: 100 }, { clientX: 100, clientY: 50 }, { clientX: 110, clientY: 50 }],
    ['left', { x: -120, y: 0, width: 100, height: 100 }, { clientX: 0, clientY: 50 }, { clientX: -10, clientY: 50 }],
    ['bottom', { x: 0, y: 120, width: 100, height: 100 }, { clientX: 50, clientY: 100 }, { clientX: 50, clientY: 110 }],
    ['top', { x: 0, y: -120, width: 100, height: 100 }, { clientX: 50, clientY: 0 }, { clientX: 50, clientY: -10 }],
  ] as const) {
    it(`keeps the inline ${placement} hover corridor scoped until entering the viewport`, async () => {
      vi.useFakeTimers();
      const view = await render(() => <NestedInline />);
      try {
        const trigger = screen.getByTestId('inline-a'); const viewport = screen.getByTestId('inline-viewport');
        function bounds(element: HTMLElement, value: { x: number; y: number; width: number; height: number }) {
          vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ ...value, left: value.x, top: value.y, right: value.x + value.width, bottom: value.y + value.height, toJSON() {} });
        }
        bounds(trigger, { x: 0, y: 0, width: 100, height: 100 }); bounds(viewport, rect);
        fireEvent.mouseEnter(trigger);
        expect(screen.getByTestId('inline-list').style.pointerEvents).toBe('none');
        expect(document.body.style.pointerEvents).toBe('');
        fireEvent.mouseLeave(trigger, leave); fireEvent.mouseMove(document, point);
        await advanceTimers(50);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByTestId('inline-list').style.pointerEvents).toBe('none');
        fireEvent.mouseEnter(viewport);
        expect(screen.getByTestId('inline-list').style.pointerEvents).toBe('');
      } finally { view.unmount(); vi.useRealTimers(); }
    });
  }
  it('clears an inline corridor on pointerdown and disposal', async () => {
    const view = await render(() => <NestedInline />);
    const trigger = screen.getByTestId('inline-a'); const list = screen.getByTestId('inline-list');
    fireEvent.mouseEnter(trigger);
    expect(list.style.pointerEvents).toBe('none');
    firePointer.down(trigger, { pointerType: 'mouse', timeStamp: 100 });
    expect(list.style.pointerEvents).toBe('');
    fireEvent.mouseEnter(trigger);
    expect(list.style.pointerEvents).toBe('none');
    view.unmount();
    expect(list.style.pointerEvents).toBe('');
    expect(document.body.style.pointerEvents).toBe('');
  });
  it('opening a closed inline root preserves the root, list, triggers and viewport owners', async () => {
    vi.useFakeTimers();
    const view = await render(() => <NestedInline closed />);
    try {
      const root = screen.getByTestId('inline-root'); const list = screen.getByTestId('inline-list');
      const trigger = screen.getByTestId('inline-a'); const viewport = screen.getByTestId('inline-viewport');
      fireEvent.mouseEnter(trigger); fireEvent.mouseMove(trigger);
      await advanceTimers(50);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByTestId('inline-root')).toBe(root);
      expect(screen.getByTestId('inline-list')).toBe(list);
      expect(screen.getByTestId('inline-a')).toBe(trigger);
      expect(screen.getByTestId('inline-viewport')).toBe(viewport);
      expect(list.style.pointerEvents).toBe('none');
      fireEvent.mouseEnter(viewport);
      expect(list.style.pointerEvents).toBe('');
    } finally { view.unmount(); vi.useRealTimers(); }
  });
  it('close then unmount in the same turn finishes a manual close once', async () => {
    const actions = { current: null as NavigationMenuRoot.Actions | null };
    const complete = vi.fn();
    await render(() => <Fixture defaultValue="a" actionsRef={actions} onOpenChangeComplete={complete} onValueChange={(_, details) => details.preventUnmountOnClose()} />);
    actions.current!.close(); actions.current!.unmount();
    await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull());
    expect(complete).toHaveBeenCalledExactlyOnceWith(false);
    actions.current!.unmount();
    expect(complete).toHaveBeenCalledTimes(1);
  });
  it('link active state, native tab order and callbacks stay live on the same host', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: { active: boolean; closeOnClick: boolean }) => <NavigationMenu.Root defaultValue="a" onValueChange={changed}><NavigationMenu.List><NavigationMenu.Item><NavigationMenu.Link active={props.active} closeOnClick={props.closeOnClick} href="#live">Live link</NavigationMenu.Link></NavigationMenu.Item></NavigationMenu.List></NavigationMenu.Root>, { active: false, closeOnClick: false });
    const link = screen.getByText('Live link');
    expect(link).not.toHaveAttribute('aria-current');
    expect(link).not.toHaveAttribute('tabindex');
    fireEvent.click(link); expect(changed).not.toHaveBeenCalled();
    await view.setProps({ active: true, closeOnClick: true });
    expect(screen.getByText('Live link')).toBe(link);
    expect(link).toHaveAttribute('aria-current', 'page');
    fireEvent.click(link);
    expect(changed).toHaveBeenCalledExactlyOnceWith(null, expect.objectContaining({ reason: 'link-press' }));
  });
  it('keeps the menu open when a link loses focus without a related target', async () => {
    const view = await render(() => <Fixture />);
    const trigger = screen.getByText('A');
    await view.user.click(trigger);
    const link = await screen.findByRole('link', { name: 'First' });
    fireEvent.focus(link);
    fireEvent.blur(link, { relatedTarget: null });
    await flushMicrotasks();
    expect(screen.getByRole('link', { name: 'First' })).toBe(link);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
  it('stops vertical navigation keys from escaping the list', async () => {
    const keyDown = vi.fn();
    await render(() => <div onKeyDown={keyDown}><NavigationMenu.Root orientation="vertical">
      <NavigationMenu.List><NavigationMenu.Item><NavigationMenu.Trigger>Item</NavigationMenu.Trigger></NavigationMenu.Item></NavigationMenu.List>
    </NavigationMenu.Root></div>);
    const trigger = screen.getByRole('button', { name: 'Item' });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(keyDown).not.toHaveBeenCalled();
    fireEvent.keyDown(trigger, { key: 'PageDown' });
    expect(keyDown).toHaveBeenCalledTimes(1);
  });
  it('navigates from the focused trigger after an earlier item is removed', async () => {
    const view = await renderProps((props: { showFirst: boolean }) => <NavigationMenu.Root><NavigationMenu.List>
      {props.showFirst && <NavigationMenu.Item><NavigationMenu.Trigger>One</NavigationMenu.Trigger></NavigationMenu.Item>}
      <NavigationMenu.Item><NavigationMenu.Trigger>Two</NavigationMenu.Trigger></NavigationMenu.Item>
      <NavigationMenu.Item><NavigationMenu.Trigger>Three</NavigationMenu.Trigger></NavigationMenu.Item>
    </NavigationMenu.List></NavigationMenu.Root>, { showFirst: true });
    screen.getByText('One').focus();
    await view.user.keyboard('{ArrowRight}{ArrowRight}');
    const last = screen.getByText('Three');
    expect(last).toHaveFocus();
    await view.setProps({ showFirst: false });
    await view.user.keyboard('{ArrowLeft}');
    expect(screen.getByText('Two')).toHaveFocus();
  });
  it('keeps both contents inside the popup viewport when switching triggers', async () => {
    const view = await render(() => <Fixture keepMounted />);
    fireEvent.click(screen.getByText('A'));
    await waitFor(() => expect(screen.getByTestId('panel-a')).not.toHaveAttribute('hidden'));
    const viewport = screen.getByTestId('viewport');
    const first = screen.getByTestId('panel-a');
    expect(viewport).toContainElement(first);
    expect(screen.getByTestId('list')).not.toContainElement(first);
    fireEvent.click(screen.getByText('B'));
    await waitFor(() => expect(screen.getByTestId('panel-b')).not.toHaveAttribute('hidden'));
    expect(viewport).toContainElement(screen.getByTestId('panel-a'));
    expect(viewport).toContainElement(screen.getByTestId('panel-b'));
  });
  it('keeps closed content inside a kept popup after Escape', async () => {
    const view = await render(() => <Fixture keepMounted />);
    await view.user.click(screen.getByText('A'));
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toContainElement(screen.getByTestId('panel-a'));
    await view.user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByTestId('panel-a')).toHaveAttribute('hidden'));
    expect(viewport).toContainElement(screen.getByTestId('panel-a'));
  });
  it('link default prevention and Base UI handler prevention remain independent', async () => {
    const changed = vi.fn();
    const view = await renderProps((props: { prevention: 'default' | 'base' }) => <NavigationMenu.Root value="a" onValueChange={changed}><NavigationMenu.List><NavigationMenu.Link href="#prevent" closeOnClick onClick={(event) => {
      if (props.prevention === 'default') event.preventDefault();
      else event.preventBaseUIHandler();
    }}>Prevented link</NavigationMenu.Link></NavigationMenu.List></NavigationMenu.Root>, { prevention: 'default' });
    const link = screen.getByText('Prevented link');
    fireEvent.click(link);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed.mock.calls[0][1].event.defaultPrevented).toBe(true);
    await view.setProps({ prevention: 'base' });
    expect(screen.getByText('Prevented link')).toBe(link);
    fireEvent.click(link);
    expect(changed).toHaveBeenCalledTimes(1);
  });
});
