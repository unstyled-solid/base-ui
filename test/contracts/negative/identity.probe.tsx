import { it, expect } from 'vitest';
import { Show } from 'solid-js';
import { createRenderer } from '../../../packages/solid/test/createRenderer';
it('rejects remounts disguised as reactive updates', async () => {
  const view = await createRenderer().renderProps((props: { label: string }) => <Show when={props.label} keyed>{(label) => <button>{label}</button>}</Show>, { label: 'before' });
  const original = view.getByRole('button');
  await view.setProps({ label: 'after' });
  expect(view.getByRole('button'), 'HARNESS_IDENTITY_PROBE').toBe(original);
});
