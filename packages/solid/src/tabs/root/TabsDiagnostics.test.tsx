import { expect, it } from 'vitest';
import { createEffect, OBSERVE } from 'solid-js';
import { attribution } from 'solid-js/attribution';
import { createRenderer, waitFor } from '../../../test';
import { Tabs } from '../test/TabsFixture';
import { useTabsRootContext } from './TabsRootContext';

// Source: TabsRoot's first-render direction + mounted-panel ARIA cases, and
// TabsPanel's [hidden, keepMounted, value, id] registration @19511bb.
it.each([false, true])('selection, history and panel IDs derive together under attribution (keepMounted=%s)', async (keepMounted) => {
  const release = attribution.enable({ log: false });
  const diagnostics: string[] = [];
  const unsubscribe = OBSERVE!.diagnostics.subscribe((event) => {
    if (event.code === 'EFFECT_RELAY_TEAR' || event.code === 'EFFECT_WRITES_OWN_SOURCE') diagnostics.push(event.message);
  });
  const observations: { value: number; direction: string; id: string | undefined }[] = [];
  function Probe() {
    const root = useTabsRootContext();
    createEffect(() => ({ value: root.value, direction: root.tabActivationDirection,
      id: root.getTabPanelIdByValue(root.value) }), (next) => { observations.push(next); });
    return null;
  }
  try {
    const view = await createRenderer().render(() => <Tabs.Root defaultValue={0} data-testid="root">
      <Tabs.List>{[0, 1, 2].map((value) => <Tabs.Tab value={value}
        ref={(element) => { if (element) element.getBoundingClientRect = () => new DOMRect(value * 100, 0, 100, 30); }}>
        Tab {value}
      </Tabs.Tab>)}</Tabs.List>
      {[0, 1, 2].map((value) => <Tabs.Panel value={value} keepMounted={keepMounted}>Panel {value}</Tabs.Panel>)}
      <Probe />
    </Tabs.Root>);
    try {
      let previous = 0;
      for (const value of [1, 2, 0, 2, 1, 0]) {
        observations.length = 0;
        const tab = view.getByRole('tab', { name: `Tab ${value}` });
        await view.user.click(tab);
        await waitFor(() => expect(tab).toHaveAttribute('aria-selected', 'true'));
        const panel = view.getByText(`Panel ${value}`);
        const direction = value > previous ? 'right' : 'left';
        expect(tab).toHaveAttribute('aria-controls', panel.id);
        expect(panel).toHaveAttribute('aria-labelledby', tab.id);
        expect(panel).toHaveAttribute('data-activation-direction', direction);
        expect(view.getByTestId('root')).toHaveAttribute('data-activation-direction', direction);
        // An effect relay would expose the new selection with an old direction
        // or missing incoming panel ID before correcting it in another pass.
        expect(observations.length).toBeGreaterThan(0);
        expect(observations.every((next) => next.value === value && next.direction === direction && next.id === panel.id)).toBe(true);
        previous = value;
      }
      expect(diagnostics).toEqual([]);
    } finally { view.unmount(); }
  } finally { unsubscribe(); release(); }
});
