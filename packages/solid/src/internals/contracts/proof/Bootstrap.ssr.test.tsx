import { createUniqueId } from 'solid-js';
import { isServer, renderToString } from '@solidjs/web';
import { expect, test, vi } from 'vitest';
import { Bootstrap } from './Bootstrap';

test('Bootstrap SSR: server compiler/runtime render JSX without running client effects or refs', async () => {
  expect(isServer).toBe(true);
  expect(typeof document).toBe('undefined');
  expect(typeof createUniqueId).toBe('function');
  const clientWork = vi.fn();
  const html = await renderToString(() => <Bootstrap count={3} class="server-proof"
    onRef={clientWork} onEffect={clientWork} onSettled={clientWork}
    onCleanup={clientWork} onDispose={clientWork} />, { renderId: 'bootstrap' });
  expect(html).toContain('<button');
  expect(html).toContain('class="server-proof"');
  expect(html).toContain('type="button"');
  expect(html).toContain('Count: 3');
  expect(html).toMatch(/id="[^"]+"/);
  expect(clientWork).not.toHaveBeenCalled();
});
