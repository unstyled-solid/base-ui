import artifact from 'virtual:harness-ssr';
import { hydrate, isServer } from '@solidjs/web';
import { it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HydrationFixture } from '../ssr-harness/HydrationFixture';

it('hydrates independently compiled server HTML, preserves IDs/nodes, isolates roots and disposes', async () => {
  expect(isServer).toBe(false);
  expect(artifact.isServer).toBe(true);
  const previousHydration = globalThis._$HY;
  const bootstrap = document.createElement('template');
  bootstrap.innerHTML = artifact.bootstrap;
  // Execute the actual server-emitted bootstrap, not a hand-written hydration registry mock.
  const scripts = bootstrap.content.querySelectorAll('script');
  expect(scripts.length).toBeGreaterThan(0);
  for (const script of scripts) new Function(script.textContent ?? '')();
  const roots: HTMLElement[] = [];
  const disposers: (() => void)[] = [];
  const ids: string[] = [];
  const disposed = vi.fn();
  const settled = vi.fn();
  try {
    for (const record of artifact.records) {
      const root = document.createElement('div');
      root.innerHTML = record.html;
      document.body.append(root); roots.push(root);
      const input = root.querySelector('input')!;
      const label = root.querySelector('label')!;
      const id = input.id; ids.push(id);
      disposers.push(hydrate(() => <HydrationFixture label={record.label} settled={settled} disposed={disposed} />, root, { renderId: record.renderId }));
      expect(root.querySelector('input')).toBe(input);
      expect(root.querySelector('label')).toBe(label);
      expect(input.id).toBe(id);
      expect(label.htmlFor).toBe(id);
      expect(label.textContent).toBe(record.label);
    }
    expect(new Set(ids).size).toBe(2);
    expect(settled).toHaveBeenCalledTimes(2);
    const user = userEvent.setup();
    await user.type(roots[0]!.querySelector('input')!, '-changed');
    expect(roots[0]!.querySelector('output')!.textContent).toBe('initial-changed');
    expect(roots[1]!.querySelector('output')!.textContent).toBe('initial');
  } finally {
    disposers.forEach((dispose) => dispose());
    roots.forEach((root) => root.remove());
    if (previousHydration === undefined) Reflect.deleteProperty(globalThis, '_$HY');
    else globalThis._$HY = previousHydration;
  }
  expect(disposed).toHaveBeenCalledTimes(2);
});
