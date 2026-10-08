import { expect, it } from 'vitest';
import { createRenderer } from '../../../test';
import { createMountedPanels, type PanelRegistration } from './createMountedPanels';

// Independent oracle: TabsPanel's React layout-effect dependency list and
// TabsRoot's set(value, id) / conditional delete(value) @19511bb.
// Generated IDs do not normally change in Solid, so exercise that source
// dependency here rather than incorrectly treating a DOM id override as it.
it('retains all source dependencies, registration order and ID-based cleanup', async () => {
  const initial: PanelRegistration = { value: 'a', id: 'first', hidden: true, keepMounted: true };
  const view = await createRenderer().renderProps<{
    first: PanelRegistration; second: PanelRegistration; showFirst: boolean; showSecond: boolean;
  }>((p) => {
    const panels = createMountedPanels();
    function First() { panels.register(() => p.first); return null; }
    function Second() { panels.register(() => p.second); return null; }
    return <>{p.showFirst && <First />}{p.showSecond && <Second />}
      <output data-testid="ids" data-a={panels.getId('a')} data-b={panels.getId('b')} />
    </>;
  }, { first: initial, second: { ...initial, id: 'second' }, showFirst: true, showSecond: true });
  const ids = view.getByTestId('ids');
  expect(ids).toHaveAttribute('data-a', 'second');
  // Hidden changes re-register even though keepMounted keeps eligibility true.
  await view.setProps({ first: { ...initial, hidden: false } });
  expect(ids).toHaveAttribute('data-a', 'first');
  // Merely rerunning an accessor with identical dependency values does not.
  await view.setProps({ second: { ...initial, id: 'second' } });
  expect(ids).toHaveAttribute('data-a', 'first');
  await view.setProps({ second: { ...initial, id: 'replacement' } });
  expect(ids).toHaveAttribute('data-a', 'replacement');
  await view.setProps({ second: { ...initial, id: 'replacement', value: 'b' } });
  expect(ids).not.toHaveAttribute('data-a');
  expect(ids).toHaveAttribute('data-b', 'replacement');
  // No ID is ineligible, matching React 17's unresolved generated ID guard.
  await view.setProps({ second: { ...initial, value: 'b', id: undefined } });
  expect(ids).not.toHaveAttribute('data-b');
  await view.setProps({ second: { ...initial, value: 'b', id: 'resolved' } });
  expect(ids).toHaveAttribute('data-b', 'resolved');
  await view.setProps({ second: { ...initial, value: 'b', id: 'resolved', keepMounted: false } });
  expect(ids).not.toHaveAttribute('data-b');
  await view.setProps({ second: { ...initial, value: 'b', id: 'resolved', hidden: false, keepMounted: false } });
  expect(ids).toHaveAttribute('data-b', 'resolved');
  // Changes in both registrations clean up before registering in source order.
  await view.setProps({ first: initial, second: { ...initial, id: 'second' } });
  expect(ids).toHaveAttribute('data-a', 'second');
  await view.setProps({ showSecond: false });
  expect(ids).not.toHaveAttribute('data-a');
  await view.setProps({ first: { ...initial, id: 'shared' }, second: { ...initial, id: 'shared' }, showSecond: true });
  expect(ids).toHaveAttribute('data-a', 'shared');
  // Cleanup is guarded by ID, not component identity: equal IDs still delete.
  await view.setProps({ showFirst: false });
  expect(ids).not.toHaveAttribute('data-a');
});
