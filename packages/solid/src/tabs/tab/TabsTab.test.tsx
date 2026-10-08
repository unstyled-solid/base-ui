import { describe, expect, it, vi } from 'vitest';
import type { JSX } from '@solidjs/web';
import { createRenderer, firePointer, fireEvent, flushMicrotasks } from '../../../test';
import { Tabs, TabsFixture } from '../test/TabsFixture';

// Source: packages/react/src/tabs/tab/TabsTab.test.tsx @19511bb.
describe('Tabs.Tab', () => {
  const { render } = createRenderer();
  it('requires a Tabs.List provider (Solid defaultless context)', async () => {
    function OutsideList() {
      expect(() => Tabs.Tab({ value: '1' })).toThrow(/context/i);
      return null;
    }
    await render(() => <Tabs.Root><OutsideList /></Tabs.Root>);
  });
  it.each(['{Enter}', ' '])('activates on %s with manual activation', async (key) => {
    const view = await render(() => <TabsFixture defaultValue={0} />);
    const [first, second] = view.getAllByRole('tab'); first.focus();
    await view.user.keyboard('{ArrowRight}');
    expect(second).toHaveFocus(); expect(second).toHaveAttribute('aria-selected', 'false');
    await view.user.keyboard(key); expect(second).toHaveAttribute('aria-selected', 'true');
  });
  it('does not recommit an active tab or activate a disabled tab', async () => {
    const changed = vi.fn();
    const view = await render(() => <TabsFixture value={1} disabled activateOnFocus onValueChange={changed} />);
    await view.user.click(view.getByRole('tab', { name: 'One' }));
    await view.user.click(view.getByRole('tab', { name: 'Zero' }));
    expect(changed).not.toHaveBeenCalled();
  });
  it.each(['pointerup', 'pointercancel'] as const)('secondary focus is guarded until %s', async (end) => {
    const changed = vi.fn();
    const view = await render(() => <TabsFixture defaultValue={0} activateOnFocus onValueChange={changed} />);
    const [first, second] = view.getAllByRole('tab');
    firePointer.down(second, { button: 2, timeStamp: 100 });
    second.focus(); await flushMicrotasks();
    expect(changed).not.toHaveBeenCalled();
    if (end === 'pointerup') firePointer.up(second, { button: 2, timeStamp: 120 });
    else fireEvent.pointerCancel(second);
    first.focus();
    await view.user.keyboard('{ArrowRight}');
    expect(changed).toHaveBeenCalledTimes(1);
    expect(second).toHaveAttribute('aria-selected', 'true');
  });
  it('does not activate on a secondary click', async () => {
    const changed = vi.fn();
    const view = await render(() => <TabsFixture defaultValue={0} onValueChange={changed} />);
    fireEvent.click(view.getByRole('tab', { name: 'One' }), { button: 2 });
    expect(changed).not.toHaveBeenCalled();
  });
  it('supports an anchor render callback and preserves href', async () => {
    const view = await render(() => <Tabs.Root defaultValue="one"><Tabs.List>
      <Tabs.Tab value="one" nativeButton={false} render={(props) => <a {...props as JSX.HTMLAttributes<HTMLAnchorElement>} href="#one" />}>One</Tabs.Tab>
      <Tabs.Tab value="two" nativeButton={false} render={(props) => <a {...props as JSX.HTMLAttributes<HTMLAnchorElement>} href="#two" />}>Two</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    const second = view.getByRole('tab', { name: 'Two' });
    expect(second.tagName).toBe('A'); expect(second).toHaveAttribute('href', '#two');
    await view.user.click(second); expect(second).toHaveAttribute('aria-selected', 'true');
  });
  it('keeps preventBaseUIHandler distinct from change cancellation', async () => {
    const changed = vi.fn();
    const view = await render(() => <Tabs.Root defaultValue={0} onValueChange={changed}><Tabs.List>
      <Tabs.Tab value={0}>Zero</Tabs.Tab><Tabs.Tab value={1} onClick={(event) => event.preventBaseUIHandler()}>One</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    await view.user.click(view.getByRole('tab', { name: 'One' }));
    expect(changed).not.toHaveBeenCalled();
  });
});
