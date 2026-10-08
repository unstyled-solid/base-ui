import { it, expect } from 'vitest';
import { untrack } from 'solid-js';
import { createRenderer } from '../../../packages/solid/test/createRenderer';
it('rejects a deliberately snapshotted prop', async () => {
  const view = await createRenderer().renderProps((props: { label: string }) => {
    const label = untrack(() => props.label);
    return <button>{label}</button>;
  }, { label: 'before' });
  await view.setProps({ label: 'after' });
  expect(view.getByRole('button').textContent, 'HARNESS_REACTIVITY_PROBE').toBe('after');
});
