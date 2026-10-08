import { beforeEach, describe, expect, vi } from 'vitest';
import { page, userEvent as nativeUser } from 'vitest/browser';
import { createSignal, Show } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, fireEvent, firePointer, waitFor } from '../../test';
import { NavigationMenu } from './index';
import type { NavigationMenuRoot } from './root/NavigationMenuRoot';
import { DirectionProvider } from '../direction-provider';
import type { Side } from '../internals/createAnchorPositioning';
import { CLOSE_DELAY } from './utils/constants';

const rootSource = 'packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx';
const triggerSource = 'packages/react/src/navigation-menu/trigger/NavigationMenuTrigger.test.tsx';
const issue = 'bsolid-c-navigation-menu-layout';
const { render, renderProps } = createRenderer();
function InlineNestedFixture(props: { placement?: 'left' | 'right' | 'top' | 'bottom'; keepMounted?: boolean }) {
  const [inserted, setInserted] = createSignal(false);
  const corridor = () => props.placement != null;
  const viewportPosition = () => ({
    right: { left: '420px', top: '200px' }, left: { left: '180px', top: '200px' },
    bottom: { left: '300px', top: '320px' }, top: { left: '300px', top: '80px' },
  })[props.placement ?? 'right'];
  return <NavigationMenu.Root>
    <NavigationMenu.List><NavigationMenu.Item value="a"><NavigationMenu.Trigger data-testid="outer-trigger">Outer</NavigationMenu.Trigger>
      <NavigationMenu.Content style={{ width: corridor() ? '650px' : '450px', padding: '20px' }}>
        <NavigationMenu.Root defaultValue={corridor() ? null : 'first'} style={{ display: 'flex', position: 'relative', height: corridor() ? '450px' : 'auto' }}>
          <NavigationMenu.List data-testid="nested-list" style={corridor() ? { position: 'absolute', left: '300px', top: '200px', margin: '0', padding: '0' } : { width: '100px', margin: '0', padding: '0' }}>
            <NavigationMenu.Item value="first"><NavigationMenu.Trigger data-testid="nested-first" style={{ width: '100px', height: corridor() ? '100px' : '40px' }}>First nested</NavigationMenu.Trigger>
              <NavigationMenu.Content keepMounted={props.keepMounted} data-testid="nested-content-first" style={{ width: corridor() ? '100px' : '250px' }}>
                <div style={{ height: '100px' }}><NavigationMenu.Link href="#nested-first">Nested first link</NavigationMenu.Link><button onClick={() => setInserted((value) => !value)}>Insert nested content</button></div>
                <Show when={inserted()}><div style={{ height: '100px' }}>Inserted nested content</div></Show>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
            <NavigationMenu.Item value="second"><NavigationMenu.Trigger data-testid="nested-second">Second nested</NavigationMenu.Trigger>
              <NavigationMenu.Content keepMounted={props.keepMounted} data-testid="nested-content-second" style={{ width: '250px', height: '300px' }}><NavigationMenu.Link href="#nested-second">Nested second link</NavigationMenu.Link></NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport data-testid="nested-viewport" style={corridor() ? { position: 'absolute', ...viewportPosition(), width: '100px', height: '100px', overflow: 'hidden' } : { width: '250px' }} />
        </NavigationMenu.Root>
      </NavigationMenu.Content>
    </NavigationMenu.Item></NavigationMenu.List>
    <NavigationMenu.Portal><NavigationMenu.Positioner data-testid="nested-outer-positioner" style={{ width: 'var(--positioner-width)', height: 'var(--positioner-height)' }}>
      <NavigationMenu.Popup data-testid="nested-outer-popup" style={{ width: 'var(--popup-width)', height: 'var(--popup-height)' }}><NavigationMenu.Viewport /></NavigationMenu.Popup>
    </NavigationMenu.Positioner></NavigationMenu.Portal>
  </NavigationMenu.Root>;
}
function LayoutFixture(props: NavigationMenuRoot.Props & { keepMounted?: boolean; side?: Side; children?: JSX.Element }) {
  const [expanded, setExpanded] = createSignal(false);
  return <NavigationMenu.Root value={props.value} defaultValue={props.defaultValue} onValueChange={props.onValueChange} onOpenChangeComplete={props.onOpenChangeComplete} actionsRef={props.actionsRef} style={{ margin: '40px 0 0 700px' }}>
    <NavigationMenu.List style={{ display: 'flex', gap: '40px' }} data-testid="list">
      <NavigationMenu.Item value="a"><NavigationMenu.Trigger data-testid="a">Product</NavigationMenu.Trigger>
        <NavigationMenu.Content keepMounted={props.keepMounted} style={{ width: expanded() ? '760px' : '675px', height: expanded() ? '260px' : '220px' }} data-testid="panel-a">
          <NavigationMenu.Link href="#product">Product link</NavigationMenu.Link>
          <button onClick={() => setExpanded((value) => !value)}>Expand</button><span>{expanded() ? 'Expanded panel' : 'Initial panel'}</span>{props.children}
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="b"><NavigationMenu.Trigger data-testid="b">Solutions</NavigationMenu.Trigger>
        <NavigationMenu.Content keepMounted={props.keepMounted} style={{ width: '500px', height: '180px' }} data-testid="panel-b"><NavigationMenu.Link href="#solutions">Solutions link</NavigationMenu.Link></NavigationMenu.Content>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Portal keepMounted={props.keepMounted}><NavigationMenu.Positioner side={props.side} data-testid="positioner" style={{ width: 'var(--positioner-width)', height: 'var(--positioner-height)' }}>
      <NavigationMenu.Popup data-testid="popup" style={{ width: 'var(--popup-width)', height: 'var(--popup-height)', transition: 'width 180ms linear, height 180ms linear' }}>
        <NavigationMenu.Arrow data-testid="arrow" /><NavigationMenu.Viewport />
      </NavigationMenu.Popup>
    </NavigationMenu.Positioner></NavigationMenu.Portal>
  </NavigationMenu.Root>;
}
function size(element: HTMLElement, axis: 'width' | 'height') { return parseFloat(element.style.getPropertyValue(`--positioner-${axis}`)); }

describe('NavigationMenu browser geometry and animation replay', () => {
  beforeEach(async () => { globalThis.BASE_UI_ANIMATIONS_DISABLED = false; await page.viewport(1440, 900); });
  browserCase({ source: rootSource, case: 'does not open when onValueChange cancels the interaction', environment: 'browser', issue }, async () => {
    const changed = vi.fn((_value, details: NavigationMenuRoot.ChangeEventDetails) => details.cancel());
    const view = await render(() => <LayoutFixture onValueChange={changed} />);
    await nativeUser.click(view.getByTestId('a'));
    expect(changed).toHaveBeenCalledWith('a', expect.objectContaining({ reason: 'trigger-press', isCanceled: true }));
    const details = changed.mock.calls.find(([, details]) => details.reason === 'trigger-press')![1];
    expect(details.event).toBeInstanceOf(MouseEvent);
    expect(details.event.isTrusted).toBe(true);
    expect(view.getByTestId('a')).toHaveAttribute('aria-expanded', 'false');
    expect(view.queryByTestId('popup')).toBeNull();
  });
  browserCase({ source: 'packages/react/src/navigation-menu/content/NavigationMenuContent.tsx', case: 'focused descendant keeps exiting content interactive until focus leaves it', environment: 'browser', issue: 'bsolid-navigation-menu-replay' }, async () => {
    const view = await renderProps<NavigationMenuRoot.Props>((props) => <LayoutFixture {...props} keepMounted />, { value: 'a' });
    const popup = view.getByTestId('popup');
    await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
    const content = view.getByTestId('panel-a');
    const link = view.getByText('Product link');
    link.focus();
    await waitFor(() => expect(link).toHaveFocus());
    expect(view.getByTestId('panel-a')).toBe(content);
    const animation = content.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 10000 });
    try {
      await view.setProps({ value: 'b' });
      expect(view.getByTestId('panel-a')).toBe(content);
      expect(content).toHaveAttribute('data-ending-style');
      expect(content).not.toHaveAttribute('inert');
      expect(link).toHaveFocus();
      view.getByText('Solutions link').focus();
      await waitFor(() => expect(content).toHaveAttribute('inert'));
      animation.finish();
      await animation.finished;
      await waitFor(() => expect(content).toHaveAttribute('hidden'));
    } finally { animation.cancel(); }
  });
  browserCase({ source: triggerSource, case: 'handles positioner width correctly / handles focus and positioner height', environment: 'browser', issue }, async () => {
    const view = await render(() => <LayoutFixture />);
    view.getByTestId('a').focus(); await nativeUser.keyboard('{ArrowDown}');
    const positioner = view.getByTestId('positioner');
    await waitFor(() => expect(size(positioner, 'width')).toBeCloseTo(675, 0));
    await waitFor(() => expect(size(positioner, 'height')).toBeCloseTo(220, 0));
    await nativeUser.keyboard('{ArrowRight}{ArrowDown}');
    await waitFor(() => expect(size(positioner, 'width')).toBeCloseTo(500, 0));
    await waitFor(() => expect(size(positioner, 'height')).toBeCloseTo(180, 0));
    expect(view.getByTestId('panel-b')).toHaveAttribute('data-activation-direction', 'right');
    expect(view.getByTestId('b')).toHaveFocus();
  });
  for (const keepMounted of [false, true]) {
    browserCase({ source: rootSource, case: `preserves popup size when controlled value closes externally [keepMounted=${keepMounted}]`, environment: 'browser', issue }, async () => {
      const complete = vi.fn();
      const view = await renderProps<NavigationMenuRoot.Props>((props) => <LayoutFixture {...props} keepMounted={keepMounted} />, { value: 'a', onOpenChangeComplete: complete });
      const popup = view.getByTestId('popup'); const positioner = view.getByTestId('positioner');
      await waitFor(() => expect(size(positioner, 'width')).toBeCloseTo(675, 0));
      const animation = popup.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 });
      await view.setProps({ value: null });
      expect(popup.style.getPropertyValue('--popup-width')).toBe('675px');
      expect(popup.style.getPropertyValue('--popup-height')).toBe('220px');
      expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px');
      await animation.finished;
      await waitFor(() => expect(complete.mock.calls.filter(([open]) => !open)).toHaveLength(1));
      if (keepMounted) expect(positioner).toHaveAttribute('hidden');
      else expect(popup.isConnected).toBe(false);
    });
  }
  browserCase({ source: triggerSource, case: 'does not let interrupted mutation resizing reapply popup sizes after a later switch', environment: 'browser', issue }, async () => {
    const view = await render(() => <LayoutFixture keepMounted />);
    await view.user.click(view.getByTestId('a'));
    const popup = view.getByTestId('popup'); const positioner = view.getByTestId('positioner');
    await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
    await view.user.click(view.getByText('Expand'));
    await waitFor(() => expect(size(positioner, 'width')).toBeCloseTo(760, 0));
    const spy = vi.spyOn(popup.style, 'setProperty');
    try {
      await nativeUser.hover(view.getByTestId('b'));
      await waitFor(() => expect(size(positioner, 'width')).toBeCloseTo(500, 0));
      await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
      const widths = spy.mock.calls.filter(([property]) => property === '--popup-width').map(([, value]) => value);
      const switched = widths.indexOf('500px');
      expect(switched).toBeGreaterThan(-1);
      expect(widths.slice(switched + 1)).not.toContain('760px');
    } finally { spy.mockRestore(); }
  });
  browserCase({ source: rootSource, case: 'ignores the initial open size reset once a trigger switch has started', environment: 'browser', issue }, async () => {
    const view = await render(() => <LayoutFixture keepMounted />);
    const popup = view.getByTestId('popup');
    await view.user.click(view.getByTestId('a'));
    const initial = popup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 });
    view.getByTestId('b').focus(); await nativeUser.keyboard('{ArrowDown}');
    const current = popup.animate([{ opacity: 0.8 }, { opacity: 1 }], { duration: 350 });
    await initial.finished;
    expect(popup.style.getPropertyValue('--popup-width')).toBe('500px');
    await current.finished;
    await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
  });
  for (const [direction, side] of [['ltr', 'left'], ['ltr', 'inline-start'], ['rtl', 'inline-end']] as const) {
    browserCase({ source: rootSource, case: `pins the popup to the right edge [${direction}/${side}]`, environment: 'browser', issue }, async () => {
      const view = await render(() => <DirectionProvider direction={direction}><LayoutFixture side={side} /></DirectionProvider>);
      await view.user.click(view.getByTestId('a'));
      const popup = view.getByTestId('popup');
      expect(popup).toHaveAttribute('data-side', side);
      expect(popup.style.position).toBe('absolute'); expect(popup.style.right).toBe('0px');
      expect(popup.style.top).toBe('0px');
    });
  }
  browserCase({ source: triggerSource, case: 'repositions the positioner when switching triggers via hover', environment: 'browser', issue }, async () => {
    const view = await render(() => <LayoutFixture />);
    await nativeUser.hover(view.getByTestId('a'));
    const positioner = await view.findByTestId('positioner');
    const left = positioner.getBoundingClientRect().left;
    // Source checks the real positioned box, not a mocked anchor rect.
    await nativeUser.hover(view.getByTestId('popup'));
    await nativeUser.hover(view.getByTestId('b'));
    await waitFor(() => expect(view.getByTestId('b')).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(Math.abs(positioner.getBoundingClientRect().left - left)).toBeGreaterThan(20));
  });
  for (const key of ['{ArrowDown}', '{Enter}', ' ']) {
    browserCase({ source: triggerSource, case: `keeps focus on the trigger when opened with ${key}`, environment: 'browser', issue: 'bsolid-c-navigation-menu-interactions' }, async () => {
      const view = await render(() => <LayoutFixture />);
      const trigger = view.getByTestId('a'); trigger.focus();
      await view.user.keyboard(key);
      await waitFor(() => expect(view.getByText('Product link')).toBeVisible());
      expect(trigger).toHaveFocus();
    });
  }
  browserCase({ source: rootSource, case: 'blocks pointer events on sibling top-level triggers when opened through real hover', environment: 'browser', issue: 'bsolid-c-navigation-menu-interactions' }, async () => {
    const view = await render(() => <LayoutFixture />);
    await nativeUser.hover(view.getByTestId('a'));
    await waitFor(() => expect(view.getByTestId('list').style.pointerEvents).toBe('none'));
    expect(getComputedStyle(view.getByTestId('b')).pointerEvents).toBe('none');
    expect(document.body.style.pointerEvents).toBe('');
    firePointer.down(view.getByTestId('a'), { pointerType: 'mouse', timeStamp: 200 });
    expect(view.getByTestId('list').style.pointerEvents).toBe('');
    view.unmount();
    expect(document.body.style.pointerEvents).toBe('');
  });
  browserCase({ source: rootSource, case: 'updates popup sizing when the window is resized while the popup is open', environment: 'browser', issue }, async () => {
    const view = await render(() => <LayoutFixture defaultValue="a" />);
    const positioner = view.getByTestId('positioner'); const popup = view.getByTestId('popup');
    await waitFor(() => expect(size(positioner, 'width')).toBeCloseTo(675, 0));
    fireEvent(window, new Event('resize'));
    await waitFor(() => expect(positioner).toHaveAttribute('data-instant'));
    await waitFor(() => expect(positioner).not.toHaveAttribute('data-instant'));
    await waitFor(() => expect(popup.style.getPropertyValue('--popup-width')).toBe('auto'));
    expect(size(positioner, 'height')).toBeCloseTo(220, 0);
  });
  for (const placement of ['left', 'right', 'top', 'bottom'] as const) {
    browserCase({ source: rootSource, case: `keeps an inline submenu open while traversing toward a viewport on the ${placement}`, environment: 'browser', issue: 'bsolid-c-navigation-menu-interactions' }, async () => {
      const view = await render(() => <InlineNestedFixture placement={placement} />);
      await nativeUser.click(view.getByTestId('outer-trigger'));
      const trigger = view.getByTestId('nested-first'); const viewport = view.getByTestId('nested-viewport'); const list = view.getByTestId('nested-list');
      await nativeUser.hover(trigger);
      expect(view.getByTestId('nested-first')).toBe(trigger);
      await waitFor(() => expect(view.getByTestId('nested-first')).toHaveAttribute('aria-expanded', 'true'));
      expect(view.getByTestId('nested-first')).toBe(trigger);
      const a = trigger.getBoundingClientRect(); const b = viewport.getBoundingClientRect();
      const horizontal = placement === 'left' || placement === 'right';
      const start = horizontal ? { clientX: placement === 'left' ? a.left : a.right, clientY: a.top + a.height / 2 }
        : { clientX: a.left + a.width / 2, clientY: placement === 'top' ? a.top : a.bottom };
      const end = horizontal ? { clientX: placement === 'left' ? b.right : b.left, clientY: b.top + b.height / 2 }
        : { clientX: b.left + b.width / 2, clientY: placement === 'top' ? b.bottom : b.top };
      expect(list.style.pointerEvents).toBe('none'); expect(document.body.style.pointerEvents).toBe('');
      await nativeUser.hover(trigger, { position: { x: Math.max(0, Math.min(a.width - 1, start.clientX - a.left) - trigger.clientLeft), y: Math.max(0, Math.min(a.height - 1, start.clientY - a.top) - trigger.clientTop) } });
      await nativeUser.hover(document.documentElement, { position: { x: (start.clientX + end.clientX) / 2, y: (start.clientY + end.clientY) / 2 } });
      await new Promise((resolve) => setTimeout(resolve, CLOSE_DELAY));
      expect(trigger).toHaveAttribute('aria-expanded', 'true'); expect(list.style.pointerEvents).toBe('none');
      await nativeUser.hover(viewport);
      await waitFor(() => expect(list.style.pointerEvents).toBe(''));
      view.unmount(); expect(document.body.style.pointerEvents).toBe('');
    });
  }
  for (const keepMounted of [false, true]) {
    browserCase({ source: rootSource, case: `updates popup sizing when inline nested content is inserted while active [keepMounted=${keepMounted}]`, environment: 'browser', issue }, async () => {
      const view = await render(() => <InlineNestedFixture keepMounted={keepMounted} />);
      await view.user.click(view.getByTestId('outer-trigger'));
      const popup = view.getByTestId('nested-outer-popup'); const positioner = view.getByTestId('nested-outer-positioner');
      await waitFor(() => expect(popup.style.getPropertyValue('--popup-height')).toBe('auto'));
      const baseline = popup.getBoundingClientRect().height;
      await view.user.click(view.getByText('Insert nested content'));
      await waitFor(() => expect(size(positioner, 'height')).toBeGreaterThan(baseline + 90));
      await waitFor(() => expect(popup.style.getPropertyValue('--popup-height')).toBe('auto'));
      expect(size(positioner, 'height')).toBeCloseTo(popup.getBoundingClientRect().height, 0);
      await view.user.click(view.getByTestId('nested-second'));
      await waitFor(() => expect(view.getByTestId('nested-content-second')).toBeVisible());
      await waitFor(() => expect(size(positioner, 'height')).toBeGreaterThan(baseline + 190));
      if (keepMounted) await waitFor(() => expect(view.getByTestId('nested-content-first')).toHaveAttribute('hidden'));
    });
  }
  browserCase({ source: 'packages/react/src/navigation-menu/root/NavigationMenuRoot.webkit.test.tsx', case: 'keeps nested safePolygon pointer events scoped on WebKit', environment: 'browser', issue: 'bsolid-c-navigation-menu-interactions' }, async () => {
    const view = await render(() => <InlineNestedFixture placement="right" />);
    await nativeUser.hover(view.getByTestId('outer-trigger'));
    const trigger = await view.findByTestId('nested-first');
    await nativeUser.hover(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'));
    expect(view.getByTestId('nested-list').style.pointerEvents).toBe('none');
    expect(document.body.style.pointerEvents).toBe('');
  });
});
