import { describe, expect, it, vi } from 'vitest';
import { createMemo, Loading } from 'solid-js';
import { createRenderer, browserCase, waitFor } from '../../../test';
import { Tabs, TabsFixture } from '../test/TabsFixture';

// Source: TabsPanel.test.tsx and root ARIA-registration cases @19511bb.
describe('Tabs.Panel', () => {
  const { render, renderProps } = createRenderer();
  it('requires a Tabs.Root provider (Solid defaultless context)', async () => {
    await render(() => {
      expect(() => Tabs.Panel({ value: '1', keepMounted: true })).toThrow(/context/i);
      return null;
    });
  });
  it.each([false, true])('syncs mounted ARIA relationships (keepMounted=%s)', async (keepMounted) => {
    const view = await render(() => <TabsFixture defaultValue={0} keepMounted={keepMounted} />);
    const [first, second] = view.getAllByRole('tab');
    expect(first).toHaveAttribute('aria-controls', view.getByText('Panel zero').id);
    expect(view.getByText('Panel zero')).toHaveAttribute('aria-labelledby', first.id);
    expect(view.getByText('Panel zero')).toHaveAttribute('data-index', '0');
    await view.user.click(second);
    await waitFor(() => expect(second).toHaveAttribute('aria-controls', view.getByText('Panel one').id));
    expect(view.getByText('Panel one')).toHaveAttribute('tabindex', '0');
    if (keepMounted) {
      expect(view.getByText('Panel zero')).toHaveAttribute('inert');
      expect(view.getByText('Panel zero')).toHaveAttribute('tabindex', '-1');
      expect(view.getByText('Panel zero')).toHaveAttribute('hidden');
    } else {
      await waitFor(() => expect(view.queryByText('Panel zero')).toBeNull());
      expect(first).not.toHaveAttribute('aria-controls');
    }
  });
  it('preserves the surviving duplicate registration after shadowed cleanup', async () => {
    const view = await renderProps((p: { show: boolean }) => <Tabs.Root value="a"><Tabs.List>
      <Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab>
    </Tabs.List>{p.show && <Tabs.Panel value="b" keepMounted data-testid="shadowed" />}
      <Tabs.Panel value="b" keepMounted data-testid="owner" />
    </Tabs.Root>, { show: true });
    const tab = view.getByRole('tab', { name: 'B' });
    expect(tab).toHaveAttribute('aria-controls', view.getByTestId('owner').id);
    await view.setProps({ show: false });
    expect(tab).toHaveAttribute('aria-controls', view.getByTestId('owner').id);
  });
  it('does not restore an older duplicate when the owning panel is removed', async () => {
    // TabsRoot cleanup deletes by matching ID; it does not keep a fallback stack.
    const view = await renderProps((p: { show: boolean }) => <Tabs.Root value="a"><Tabs.List>
      <Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab>
    </Tabs.List><Tabs.Panel value="b" keepMounted data-testid="shadowed" />
      {p.show && <Tabs.Panel value="b" keepMounted data-testid="owner" />}
    </Tabs.Root>, { show: true });
    const tab = view.getByRole('tab', { name: 'B' });
    expect(tab).toHaveAttribute('aria-controls', view.getByTestId('owner').id);
    await view.setProps({ show: false });
    expect(view.getByTestId('shadowed')).toBeInTheDocument();
    expect(tab).not.toHaveAttribute('aria-controls');
  });
  it('transfers duplicate ownership for keepMounted changes even while visible', async () => {
    const view = await renderProps((p: { keep: boolean }) => <Tabs.Root value="b"><Tabs.List>
      <Tabs.Tab value="b">B</Tabs.Tab>
    </Tabs.List><Tabs.Panel value="b" keepMounted={p.keep} data-testid="first" />
      <Tabs.Panel value="b" keepMounted data-testid="second" />
    </Tabs.Root>, { keep: false });
    const tab = view.getByRole('tab');
    expect(tab).toHaveAttribute('aria-controls', view.getByTestId('second').id);
    await view.setProps({ keep: true });
    expect(tab).toHaveAttribute('aria-controls', view.getByTestId('first').id);
    await view.setProps({ keep: false });
    expect(tab).toHaveAttribute('aria-controls', view.getByTestId('first').id);
  });
  it('replaces and disposes registrations when panel values change', async () => {
    const view = await renderProps((p: { value: string; show: boolean }) => <Tabs.Root value="a"><Tabs.List>
      <Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab>
    </Tabs.List>{p.show && <Tabs.Panel value={p.value} keepMounted data-testid="panel" />}</Tabs.Root>, { value: 'a', show: true });
    const [a, b] = view.getAllByRole('tab');
    await view.setProps({ value: 'b' });
    expect(a).not.toHaveAttribute('aria-controls');
    expect(b).toHaveAttribute('aria-controls', view.getByTestId('panel').id);
    await view.setProps({ show: false }); expect(b).not.toHaveAttribute('aria-controls');
    await view.setProps({ show: true }); expect(b).toHaveAttribute('aria-controls', view.getByTestId('panel').id);
  });
  it('holds selection coherently while a newly opened panel is awaiting async content', async () => {
    // Source Suspense integration becomes RC13 Loading/held updates, with the
    // same single user request and no spurious automatic "missing" fallback.
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((done) => { resolve = done; });
    function Content() {
      const text = createMemo(() => promise);
      return <div>{text()}</div>;
    }
    const changed = vi.fn();
    const view = await render(() => <Loading fallback={<div>Loading panel</div>}>
      <Tabs.Root defaultValue="a" onValueChange={changed}><Tabs.List>
        <Tabs.Tab value="a">A</Tabs.Tab><Tabs.Tab value="b">B</Tabs.Tab>
      </Tabs.List><Tabs.Panel value="a">Panel A</Tabs.Panel><Tabs.Panel value="b"><Content /></Tabs.Panel></Tabs.Root>
    </Loading>);
    expect(view.getByText('Panel A')).toBeInTheDocument();
    await view.user.click(view.getByRole('tab', { name: 'B' }));
    expect(changed).toHaveBeenCalledTimes(1);
    expect(changed).toHaveBeenCalledWith('b', expect.objectContaining({ reason: 'none' }));
    resolve('Panel B');
    await waitFor(() => expect(view.getByText('Panel B')).toBeInTheDocument());
    const tab = view.getByRole('tab', { name: 'B' });
    expect(tab).toHaveAttribute('aria-selected', 'true');
    const panel = view.getByRole('tabpanel', { name: 'B' });
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    await waitFor(() => expect(view.getByRole('tab', { name: 'A' })).not.toHaveAttribute('aria-controls'));
    expect(changed).toHaveBeenCalledTimes(1);
  });
  it('tracks tab metadata ID replacement and removal without retaining stale panel labels', async () => {
    const view = await renderProps((p: { id: string; show: boolean }) => <Tabs.Root value="a">
      <Tabs.List>{p.show && <Tabs.Tab value="a" id={p.id}>A</Tabs.Tab>}<Tabs.Tab value="b">B</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="a" keepMounted>Panel A</Tabs.Panel>
    </Tabs.Root>, { id: 'tab-original', show: true });
    const panel = view.getByText('Panel A');
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-original');
    await view.setProps({ id: 'tab-replaced' });
    expect(view.getByText('Panel A')).toBe(panel);
    expect(panel).toHaveAttribute('aria-labelledby', 'tab-replaced');
    await view.setProps({ show: false });
    expect(panel).not.toHaveAttribute('aria-labelledby');
  });
  browserCase({ source: 'packages/react/src/tabs/panel/TabsPanel.test.tsx', case: 'applies data-ending-style before unmount', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    try {
      const view = await render(() => <><style>{'@keyframes tabs-exit { to { opacity: 0 } } .tabs-exit[data-ending-style] { animation: tabs-exit 200ms; }'}</style>
        <Tabs.Root defaultValue={0}><Tabs.List><Tabs.Tab value={0}>Zero</Tabs.Tab><Tabs.Tab value={1}>One</Tabs.Tab></Tabs.List>
          <Tabs.Panel value={0} class="tabs-exit">Leaving</Tabs.Panel><Tabs.Panel value={1}>Entering</Tabs.Panel>
        </Tabs.Root></>);
      await view.user.click(view.getByRole('tab', { name: 'One' }));
      expect(view.getByText('Leaving')).toHaveAttribute('data-ending-style');
      expect(view.getByText('Leaving')).toHaveAttribute('inert');
      await waitFor(() => expect(view.queryByText('Leaving')).toBeNull());
    } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
  });
  browserCase({ source: 'packages/react/src/tabs/panel/TabsPanel.test.tsx', case: 'triggers enter animation via data-starting-style when mounting', environment: 'browser', issue: 'bsolid-browser' }, async () => {
    const previous = globalThis.BASE_UI_ANIMATIONS_DISABLED;
    globalThis.BASE_UI_ANIMATIONS_DISABLED = false;
    let finished = false;
    try {
      const view = await render(() => <><style>{'.tabs-enter { transition: opacity 10ms; } .tabs-enter[data-starting-style] { opacity: 0; }'}</style>
        <Tabs.Root defaultValue={0}><Tabs.List><Tabs.Tab value={0}>Zero</Tabs.Tab><Tabs.Tab value={1}>One</Tabs.Tab></Tabs.List>
          <Tabs.Panel value={0}>Initial</Tabs.Panel><Tabs.Panel value={1} class="tabs-enter" onTransitionEnd={() => { finished = true; }}>Entering</Tabs.Panel>
        </Tabs.Root></>);
      expect(view.queryByText('Entering')).toBeNull();
      await view.user.click(view.getByRole('tab', { name: 'One' }));
      await waitFor(() => expect(finished).toBe(true));
      expect(view.getByText('Entering')).not.toHaveAttribute('data-starting-style');
    } finally { globalThis.BASE_UI_ANIMATIONS_DISABLED = previous; }
  });
});
