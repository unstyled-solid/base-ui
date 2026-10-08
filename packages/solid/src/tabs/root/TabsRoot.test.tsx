import { describe, expect, it, vi } from 'vitest';
import { createSignal } from 'solid-js';
import { createRenderer, expectDiagnostic, waitFor } from '../../../test';
import { Tabs, TabsFixture } from '../test/TabsFixture';

// Source: packages/react/src/tabs/root/TabsRoot.test.tsx @19511bb.
// React rerender/StrictMode cases use live props and owned disposal in RC13.
describe('Tabs.Root', () => {
  const { render, renderProps } = createRenderer();
  it('accepts null and empty children and updates selected tab order', async () => {
    const empty = await render(() => <Tabs.Root value={1} />);
    expect(empty.container.firstElementChild).not.toBeNull();
    empty.unmount();
    const view = await renderProps((p: { value: number }) => <Tabs.Root value={p.value}>
      {null}<Tabs.List><Tabs.Tab value={0} /><Tabs.Tab value={1} /></Tabs.List>
    </Tabs.Root>, { value: 1 });
    expect(view.getAllByRole('tab')).toHaveLength(2);
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([-1, 0]);
    await view.setProps({ value: 0 });
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([0, -1]);
  });
  it('wires reordered panels to generated and explicit tab IDs', async () => {
    const view = await render(() => <Tabs.Root defaultValue="tab-0"><Tabs.List>
      <Tabs.Tab value="tab-0" /><Tabs.Tab value="tab-1" id="explicit-tab-id-1" />
      <Tabs.Tab value="tab-2" /><Tabs.Tab value="tab-3" id="explicit-tab-id-3" />
    </Tabs.List>{[1, 0, 2, 3].map((value) => <Tabs.Panel value={`tab-${value}`} keepMounted />)}</Tabs.Root>);
    const tabs = view.getAllByRole('tab');
    const panels = view.getAllByRole('tabpanel', { hidden: true });
    for (const [panelIndex, tabIndex] of [1, 0, 2, 3].entries()) {
      expect(panels[panelIndex]).toHaveAttribute('aria-labelledby', tabs[tabIndex].id);
      expect(tabs[tabIndex]).toHaveAttribute('aria-controls', panels[panelIndex].id);
    }
  });
  it('keeps controlled selection when its selected tab becomes disabled', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { disabled: boolean }) => <TabsFixture value={0}
      disabled={p.disabled} onValueChange={changed} />, { disabled: false });
    await view.setProps({ disabled: true });
    expect(changed).not.toHaveBeenCalled();
    expect(view.getAllByRole('tab').map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
  });
  it.each([
    { label: 'implicit default', props: {}, value: 0, reason: 'initial' },
    { label: 'undefined default', props: { defaultValue: undefined }, value: 0, reason: 'initial' },
    { label: 'disabled implicit default', props: { disabled: true }, value: 1, reason: 'initial' },
    { label: 'explicit disabled default', props: { disabled: true, defaultValue: 0 }, value: 0, reason: undefined },
    { label: 'explicit enabled default', props: { defaultValue: 1 }, value: 1, reason: undefined },
    { label: 'explicit missing default', props: { defaultValue: 'absent' }, value: 0, reason: 'missing' },
    { label: 'explicit null', props: { defaultValue: null }, value: null, reason: undefined },
    { label: 'controlled missing', props: { value: 'absent' }, value: null, reason: undefined },
    { label: 'controlled disabled', props: { value: 0, disabled: true }, value: 0, reason: undefined },
  ])('selection: $label', async ({ props, value, reason }) => {
    const changed = vi.fn();
    const view = await render(() => <TabsFixture {...props} onValueChange={changed} keepMounted />);
    expect(view.getAllByRole('tab').map((tab) => tab.getAttribute('aria-selected')))
      .toEqual([0, 1, 2].map((index) => String(index === value)));
    expect(changed).toHaveBeenCalledTimes(reason ? 1 : 0);
    if (reason) expect(changed).toHaveBeenCalledWith(value, expect.objectContaining({ reason, activationDirection: 'none' }));
  });
  it('does not select an enabled tab after all-disabled fallback cleared selection', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { disabled: boolean }) => <Tabs.Root onValueChange={changed}>
      <Tabs.List><Tabs.Tab value={0} disabled={p.disabled}>Zero</Tabs.Tab></Tabs.List>
    </Tabs.Root>, { disabled: true });
    expect(changed).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'initial' }));
    await view.setProps({ disabled: false });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(view.getByRole('tab')).toHaveAttribute('aria-selected', 'false');
  });
  it('automatic fallbacks are not cancelable but user changes are', async () => {
    const changed = vi.fn((_value, details) => details.cancel());
    const view = await render(() => <TabsFixture disabled onValueChange={changed} />);
    expect(view.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    await view.user.click(view.getByRole('tab', { name: 'Two' }));
    expect(view.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    expect(changed.mock.calls[0][1].event.type).toBe('base-ui');
    expect(changed.mock.calls[1][1].reason).toBe('none');
  });
  it('falls back when the selected tab becomes disabled after being enabled', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { disabled: boolean }) => <TabsFixture defaultValue={0} disabled={p.disabled} onValueChange={changed} keepMounted />, { disabled: true });
    expect(changed).not.toHaveBeenCalled();
    expect(view.getByRole('tab', { name: 'Zero' })).toHaveAttribute('aria-selected', 'true');
    await view.setProps({ disabled: false });
    expect(changed).not.toHaveBeenCalled();
    expect(view.getByRole('tab', { name: 'Zero' })).toHaveAttribute('aria-selected', 'true');
    await view.setProps({ disabled: true });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith(1, expect.objectContaining({ reason: 'disabled', activationDirection: 'none' }));
    expect(view.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true');
    expect(view.getByText('Panel zero')).toHaveAttribute('hidden');
    expect(view.getByText('Panel one')).not.toHaveAttribute('hidden');
  });
  it('falls back after removal and removes stale labelledby', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { showFirst: boolean }) => <TabsFixture defaultValue={0} showFirst={p.showFirst} onValueChange={changed} keepMounted />, { showFirst: true });
    await view.setProps({ showFirst: false });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith(1, expect.objectContaining({ reason: 'missing' }));
    expect(view.getAllByRole('tab')[0]).toHaveTextContent('One');
    expect(view.getAllByRole('tab')[0]).toHaveAttribute('aria-selected', 'true');
    expect(view.getByText('Panel zero')).not.toHaveAttribute('aria-labelledby');
    expect(view.getByRole('tab', { name: 'One' })).toHaveAttribute('tabindex', '0');
  });
  it('clears selection when no tabs remain', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { show: boolean }) => <Tabs.Root defaultValue={0} onValueChange={changed}>
      <Tabs.List>{p.show && <Tabs.Tab value={0}>Zero</Tabs.Tab>}</Tabs.List>
      <Tabs.Panel value={0} keepMounted>Panel</Tabs.Panel>
    </Tabs.Root>, { show: true });
    expect(view.getByRole('tabpanel')).not.toHaveAttribute('hidden');
    await view.setProps({ show: false });
    await waitFor(() => expect(changed).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'missing' })));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(view.queryAllByRole('tab')).toHaveLength(0);
    expect(view.getByText('Panel')).toHaveAttribute('hidden');
  });
  it('preserves arbitrary identity-bearing values', async () => {
    const values = [0, 'one', {}, () => 3, Symbol('four'), /five/];
    const view = await render(() => <Tabs.Root defaultValue={0}><Tabs.List>
      {values.map((value, index) => <Tabs.Tab value={value}>{index}</Tabs.Tab>)}
    </Tabs.List>{values.map((value, index) => <Tabs.Panel value={value} keepMounted>Panel {index}</Tabs.Panel>)}</Tabs.Root>);
    for (const [index, tab] of view.getAllByRole('tab').entries()) {
      await view.user.click(tab);
      expect(view.getByRole('tabpanel')).toHaveTextContent(`Panel ${index}`);
      expect(view.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', tab.id);
    }
  });
  it('uses the current callback and preserves the controlled host when a request is refused', async () => {
    const before = vi.fn(); const after = vi.fn();
    const view = await renderProps((p: { callback: typeof before; value: number }) => <TabsFixture value={p.value} onValueChange={p.callback} />, { callback: before, value: 0 });
    const zero = view.getByRole('tab', { name: 'Zero' });
    await view.setProps({ callback: after });
    await view.user.click(view.getByRole('tab', { name: 'One' }));
    expect(before).not.toHaveBeenCalled();
    expect(after).toHaveBeenCalledTimes(1);
    expect(zero).toHaveAttribute('aria-selected', 'true');
    await view.setProps({ value: 1 });
    expect(view.getByRole('tab', { name: 'Zero' })).toBe(zero);
    expect(zero).toHaveAttribute('aria-selected', 'false');
  });
  it('does not emit repeatedly for transient duplicate disabled and enabled values', async () => {
    const changed = vi.fn();
    await render(() => <Tabs.Root onValueChange={changed}><Tabs.List>
      <Tabs.Tab value="a" disabled>Stale</Tabs.Tab><Tabs.Tab value="a">A</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith('a', expect.objectContaining({ reason: 'initial' }));
  });
  it('keeps nested roots independent', async () => {
    const view = await render(() => <Tabs.Root defaultValue="outer"><Tabs.List><Tabs.Tab value="outer">Outer</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="outer"><TabsFixture defaultValue={0} /></Tabs.Panel>
    </Tabs.Root>);
    await view.user.click(view.getByRole('tab', { name: 'Two' }));
    expect(view.getByRole('tab', { name: 'Outer' })).toHaveAttribute('aria-selected', 'true');
    expect(view.getByText('Panel two')).not.toHaveAttribute('hidden');
  });
  it('does not submit or reset selection as a form control', async () => {
    const submitted = vi.fn((event: Event) => event.preventDefault());
    const view = await render(() => <form onSubmit={submitted}><TabsFixture defaultValue={0} /><button type="reset">Reset</button></form>);
    const tab = view.getByRole('tab', { name: 'One' });
    expect(tab).toHaveAttribute('type', 'button');
    await view.user.click(tab);
    await view.user.click(view.getByRole('button', { name: 'Reset' }));
    expect(submitted).not.toHaveBeenCalled();
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(Array.from(new FormData(tab.closest('form')!).entries())).toEqual([]);
  });
  it('supports asynchronous controlled acceptance without losing focused navigation', async () => {
    const view = await render(() => {
      const [value, setValue] = createSignal(0);
      return <TabsFixture value={value()} activateOnFocus onValueChange={(next) => { Promise.resolve().then(() => setValue(next)); }} />;
    });
    view.getByRole('tab', { name: 'Zero' }).focus();
    await view.user.keyboard('{ArrowRight}');
    expect(view.getByRole('tab', { name: 'One' })).toHaveFocus();
    await waitFor(() => expect(view.getByRole('tab', { name: 'One' })).toHaveAttribute('aria-selected', 'true'));
  });
  it('notifies the implicit default matching a later tab without choosing DOM-first', async () => {
    const changed = vi.fn();
    const view = await render(() => <Tabs.Root onValueChange={changed}><Tabs.List>
      <Tabs.Tab value={1}>One</Tabs.Tab><Tabs.Tab value={0}>Zero</Tabs.Tab>
    </Tabs.List></Tabs.Root>);
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith(0, expect.objectContaining({ reason: 'initial' }));
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([-1, 0]);
  });
  it('warns on a live default change but keeps the initial disabled-default policy', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { defaultValue: number }) => <TabsFixture defaultValue={p.defaultValue}
      disabled onValueChange={changed} />, { defaultValue: 0 });
    expect(view.getByRole('tab', { name: 'Zero' })).toHaveAttribute('aria-selected', 'true');
    await expectDiagnostic({ message: /changing the default value state of an uncontrolled Tabs after being initialized/ },
      () => view.setProps({ defaultValue: 1 }));
    expect(view.getByRole('tab', { name: 'Zero' })).toHaveAttribute('aria-selected', 'true');
    expect(changed).not.toHaveBeenCalled();
    expect(view.getAllByRole('tab').map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
  });
  it('keeps controlled disabled selection off the roving highlight', async () => {
    const view = await renderProps((p: { value: number }) => <TabsFixture value={p.value} disabled />, { value: 1 });
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
    await view.setProps({ value: 0 });
    expect(view.getByRole('tab', { name: 'Zero' })).toHaveAttribute('aria-selected', 'true');
    expect(view.getAllByRole('tab').map((tab) => tab.tabIndex)).toEqual([-1, 0, -1]);
  });
  it('clears automatic selection and panel labelling when the whole list is replaced', async () => {
    const changed = vi.fn();
    const view = await renderProps((p: { empty: boolean }) => <Tabs.Root defaultValue={0} onValueChange={changed}>
      {p.empty ? <Tabs.List /> : <Tabs.List><Tabs.Tab value={0}>Zero</Tabs.Tab></Tabs.List>}
      <Tabs.Panel value={0} keepMounted>Panel</Tabs.Panel>
    </Tabs.Root>, { empty: false });
    expect(view.getByRole('tabpanel')).not.toHaveAttribute('hidden');
    await view.setProps({ empty: true });
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'missing', activationDirection: 'none' }));
    expect(view.getByText('Panel')).toHaveAttribute('hidden');
    expect(view.getByText('Panel')).not.toHaveAttribute('aria-labelledby');
  });
});
