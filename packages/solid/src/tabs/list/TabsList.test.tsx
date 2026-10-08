import { describe, expect, it, vi } from 'vitest';
import type { JSX } from '@solidjs/web';
import { browserCase, createRenderer, fireEvent, flushMicrotasks } from '../../../test';
import { DirectionContext } from '../../internals/direction-context';
import { Tabs, TabsFixture } from '../test/TabsFixture';

// Source: TabsList.test.tsx and TabsRoot.test.tsx keyboard navigation matrix.
describe('Tabs.List', () => {
  const { render, renderProps } = createRenderer();
  it('cycles all three accessibility selections without stale selected attributes', async () => {
    const view = await render(() => <TabsFixture defaultValue={1} />);
    const tabs = view.getAllByRole('tab');
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true', 'false']);
    for (const selected of [2, 0, 1]) {
      await view.user.click(tabs[selected]);
      expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual([0, 1, 2].map((index) => String(index === selected)));
    }
  });
  it('supports aria-labelledby and omits horizontal aria-orientation', async () => {
    const view = await render(() => <><h3 id="label-id">complex name</h3>
      <Tabs.Root defaultValue={0}><Tabs.List aria-labelledby="label-id"><Tabs.Tab value={0} /></Tabs.List></Tabs.Root></>);
    expect(view.getByRole('tablist')).toHaveAccessibleName('complex name');
    expect(view.getByRole('tablist')).not.toHaveAttribute('aria-orientation');
  });
  it('can fall back to a focusable disabled tab after controlled removal', async () => {
    const view = await renderProps((p: { show: boolean }) => <Tabs.Root value={2}><Tabs.List>
      <Tabs.Tab value={0} disabled>Disabled</Tabs.Tab><Tabs.Tab value={1}>One</Tabs.Tab>
      {p.show && <Tabs.Tab value={2}>Selected</Tabs.Tab>}
    </Tabs.List></Tabs.Root>, { show: true });
    await view.setProps({ show: false });
    expect(view.getByRole('tab', { name: 'Disabled' })).toHaveAttribute('tabindex', '0');
    expect(view.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '-1');
  });
  // Source's controlled keyboard matrix also pins request counts, requested
  // values and the consumer event after Base UI prevents the native default.
  for (const [orientation, direction, previous, next] of [
    ['horizontal', 'ltr', 'ArrowLeft', 'ArrowRight'],
    ['horizontal', 'rtl', 'ArrowRight', 'ArrowLeft'],
    ['vertical', 'ltr', 'ArrowUp', 'ArrowDown'],
  ] as const) {
    for (const activate of [false, true]) {
      for (const [action, start, destination, key] of [
        ['previous wrap', 0, 2, previous], ['previous', 1, 0, previous],
        ['next wrap', 2, 0, next], ['next', 1, 2, next],
        ['previous disabled', 2, 1, previous], ['next disabled', 0, 1, next],
      ] as const) {
        const title = `controlled ${orientation}/${direction} activate=${activate}: ${action}`;
        const body = async () => {
          const changed = vi.fn();
          const events: KeyboardEvent[] = [];
          const disabled = action.includes('disabled');
          const view = await render(() => <DirectionContext value={() => direction}><Tabs.Root value={start}
            orientation={orientation} onValueChange={changed}><Tabs.List activateOnFocus={activate}
              onKeyDown={(event) => events.push(event)}>
              {[0, 1, 2].map((value) => <Tabs.Tab value={value} disabled={disabled && value === 1}>{value}</Tabs.Tab>)}
            </Tabs.List></Tabs.Root></DirectionContext>);
          const tabs = view.getAllByRole('tab'); tabs[start].focus();
          await view.user.keyboard(`{${key}}`);
          expect(tabs[destination]).toHaveFocus();
          expect(changed).toHaveBeenCalledTimes(activate && !disabled ? 1 : 0);
          if (activate && !disabled) expect(changed.mock.calls[0][0]).toBe(destination);
          expect(events).toHaveLength(1);
          expect(events[0].defaultPrevented).toBe(true);
          if (action === 'next disabled') {
            await view.user.keyboard(`{${key}}`);
            expect(tabs[2]).toHaveFocus();
          }
        };
        if (direction === 'rtl') browserCase({ source: 'packages/react/src/tabs/root/TabsRoot.test.tsx',
          case: title, environment: 'browser', issue: 'bsolid-browser' }, body);
        else it(title, body);
      }
    }
  }
  for (const key of ['Home', 'End'] as const) {
    for (const activate of [false, true]) {
      for (const disabled of [false, true]) {
        it(`controlled ${key} activate=${activate} disabled=${disabled}`, async () => {
          const changed = vi.fn(); const events: KeyboardEvent[] = [];
          const start = key === 'Home' ? 2 : 0; const destination = key === 'Home' ? 0 : 2;
          const view = await render(() => <Tabs.Root value={start} onValueChange={changed}><Tabs.List
            activateOnFocus={activate} onKeyDown={(event) => events.push(event)}>
            {[0, 1, 2].map((value) => <Tabs.Tab value={value} disabled={disabled && value === destination}>{value}</Tabs.Tab>)}
          </Tabs.List></Tabs.Root>);
          const tabs = view.getAllByRole('tab'); tabs[start].focus();
          await view.user.keyboard(`{${key}}`);
          expect(tabs[destination]).toHaveFocus();
          expect(changed).toHaveBeenCalledTimes(activate && !disabled ? 1 : 0);
          if (activate && !disabled) expect(changed.mock.calls[0][0]).toBe(destination);
          expect(events).toHaveLength(1); expect(events[0].defaultPrevented).toBe(true);
        });
      }
    }
  }
  for (const [orientation, direction, previous, next] of [
    ['horizontal', 'ltr', 'ArrowLeft', 'ArrowRight'],
    ['horizontal', 'rtl', 'ArrowRight', 'ArrowLeft'],
    ['vertical', 'ltr', 'ArrowUp', 'ArrowDown'],
  ] as const) {
    for (const activate of [false, true]) {
      it(`${orientation}/${direction} activateOnFocus=${activate}: arrows, wrapping, Home, End`, async () => {
        const view = await render(() => <DirectionContext value={() => direction}><TabsFixture defaultValue={0} orientation={orientation} activateOnFocus={activate} /></DirectionContext>);
        const [first, second, last] = view.getAllByRole('tab');
        first.focus();
        await view.user.keyboard(`{${previous}}`);
        expect(last).toHaveFocus();
        expect(last).toHaveAttribute('aria-selected', String(activate));
        await view.user.keyboard(`{${next}}`);
        expect(first).toHaveFocus();
        await view.user.keyboard(`{${next}}`);
        expect(second).toHaveFocus();
        await view.user.keyboard('{End}');
        expect(last).toHaveFocus();
        await view.user.keyboard('{Home}');
        expect(first).toHaveFocus();
      });
    }
  }
  it.each(['Shift', 'Control', 'Alt', 'Meta'])('does not navigate with %s', async (modifier) => {
    const view = await render(() => <TabsFixture defaultValue={0} />);
    const first = view.getAllByRole('tab')[0]; first.focus();
    await view.user.keyboard(`{${modifier}>}{ArrowRight}{/${modifier}}`);
    expect(first).toHaveFocus();
  });
  it('loopFocus=false stops at both ends', async () => {
    const view = await render(() => <Tabs.Root defaultValue={0}><Tabs.List loopFocus={false}>
      <Tabs.Tab value={0}>First</Tabs.Tab><Tabs.Tab value={1}>Last</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    const [first, last] = view.getAllByRole('tab'); first.focus();
    await view.user.keyboard('{ArrowLeft}'); expect(first).toHaveFocus();
    await view.user.keyboard('{End}{ArrowRight}'); expect(last).toHaveFocus();
  });
  it('focuses disabled tabs without activating them', async () => {
    const view = await render(() => <Tabs.Root defaultValue={0}><Tabs.List activateOnFocus>
      <Tabs.Tab value={0}>First</Tabs.Tab><Tabs.Tab value={1} disabled>Disabled</Tabs.Tab><Tabs.Tab value={2}>Last</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    const [first, disabled, last] = view.getAllByRole('tab'); first.focus();
    await view.user.keyboard('{ArrowRight}');
    expect(disabled).toHaveFocus(); expect(disabled).not.toHaveAttribute('disabled');
    expect(disabled).toHaveAttribute('aria-disabled', 'true'); expect(first).toHaveAttribute('aria-selected', 'true');
    await view.user.keyboard('{ArrowRight}'); expect(last).toHaveFocus();
  });
  it('skips natively disabled rendered hosts in one keypress', async () => {
    const view = await render(() => <Tabs.Root defaultValue={0}><Tabs.List>
      <Tabs.Tab value={0}>First</Tabs.Tab>
      <Tabs.Tab value={1} render={(props) => <button {...props as JSX.HTMLAttributes<HTMLButtonElement>} disabled />}>Native disabled</Tabs.Tab>
      <Tabs.Tab value={2}>Last</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    const [first, , last] = view.getAllByRole('tab'); first.focus();
    await view.user.keyboard('{ArrowRight}'); expect(last).toHaveFocus();
    await view.user.keyboard('{ArrowLeft}'); expect(first).toHaveFocus();
  });
  it('keeps focus-relative highlight on external selection but follows selection outside the list', async () => {
    const view = await renderProps((p: { value: number }) => <TabsFixture value={p.value} />, { value: 0 });
    const [first, second, last] = view.getAllByRole('tab');
    await view.setProps({ value: 2 }); expect(last.tabIndex).toBe(0);
    first.focus();
    await view.setProps({ value: 1 });
    await view.user.keyboard('{ArrowRight}'); expect(second).toHaveFocus();
  });
  it('keeps a roving entry point when a controlled selected tab disappears', async () => {
    const view = await renderProps((p: { show: boolean }) => <Tabs.Root value={2}><Tabs.List>
      <Tabs.Tab value={0}>First</Tabs.Tab><Tabs.Tab value={1}>Second</Tabs.Tab>{p.show && <Tabs.Tab value={2}>Last</Tabs.Tab>}
    </Tabs.List></Tabs.Root>, { show: true });
    await view.setProps({ show: false });
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([0, -1]);
  });
  it('exposes vertical orientation and an accessible label', async () => {
    const view = await render(() => <Tabs.Root orientation="vertical"><Tabs.List aria-label="Sections" /></Tabs.Root>);
    expect(view.getByRole('tablist', { name: 'Sections' })).toHaveAttribute('aria-orientation', 'vertical');
  });
  it('delivers one navigation event whose default is prevented after dispatch', async () => {
    // Source inspects the same native event after dispatch, not a boolean captured
    // inside the consumer callback (which runs before the Base UI handler).
    const handled: KeyboardEvent[] = [];
    const changed = vi.fn();
    const view = await render(() => <Tabs.Root value={0} onValueChange={changed}><Tabs.List
      onKeyDown={(event) => handled.push(event)}>
      <Tabs.Tab value={0}>First</Tabs.Tab><Tabs.Tab value={1}>Second</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    const [first, second] = view.getAllByRole('tab'); first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    await flushMicrotasks();
    expect(second).toHaveFocus();
    expect(handled).toHaveLength(1);
    expect(handled[0].defaultPrevented).toBe(true);
    expect(changed).not.toHaveBeenCalled();
  });
  it('follows a highlighted successor through repeated removal without promoting a hidden tab', async () => {
    const view = await renderProps((p: { first: boolean; selected: boolean }) => <Tabs.Root value={1}><Tabs.List>
      {p.first && <Tabs.Tab value={0}>First</Tabs.Tab>}
      {p.selected && <Tabs.Tab value={1}>Selected</Tabs.Tab>}
      <Tabs.Tab value={2} hidden>Hidden</Tabs.Tab><Tabs.Tab value={3}>Successor</Tabs.Tab>
    </Tabs.List></Tabs.Root>, { first: true, selected: true });
    await view.setProps({ selected: false });
    expect(view.getAllByRole('tab', { hidden: true }).map((tab) => tab.tabIndex)).toEqual([0, -1, -1]);
    await view.setProps({ first: false });
    expect(view.getAllByRole('tab', { hidden: true }).map((tab) => tab.tabIndex)).toEqual([-1, 0]);
  });
  it('preserves the focused selected node and its tab stop when earlier tabs disappear', async () => {
    const view = await renderProps((p: { first: boolean }) => <Tabs.Root value={2}><Tabs.List>
      {p.first && <Tabs.Tab value={0}>First</Tabs.Tab>}
      <Tabs.Tab value={1}>Second</Tabs.Tab><Tabs.Tab value={2}>Selected</Tabs.Tab>
    </Tabs.List></Tabs.Root>, { first: true });
    const selected = view.getByRole('tab', { name: 'Selected' }); selected.focus();
    await view.setProps({ first: false });
    expect(view.getByRole('tab', { name: 'Selected' })).toBe(selected);
    expect(selected).toHaveFocus();
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([-1, 0]);
  });
});
