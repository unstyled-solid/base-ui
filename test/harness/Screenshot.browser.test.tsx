import { it, expect } from 'vitest';
import { page, server } from 'vitest/browser';
import { createRenderer } from '#test-utils';

it('captures real PNG screenshots with bounded collision-resistant long paths', async () => {
  const { render } = createRenderer();
  await render(() => <div style={{ width: '80px', height: '80px', background: 'red' }}>Real screenshot</div>);
  const first = await page.screenshot({ path: `${'very-long-source-case-'.repeat(25)}-a.png`, base64: true });
  const second = await page.screenshot({ path: `${'very-long-source-case-'.repeat(25)}-b.png`, base64: true });
  expect(first.path).not.toBe(second.path);
  expect(new TextEncoder().encode(first.path.split('/').at(-1)).length).toBeLessThan(255);
  expect(first.base64).toMatch(/^iVBOR/);
  expect(first.base64.length).toBeGreaterThan(200);
});

it.skipIf(server.browser !== 'chromium')('installs the exact Dialog CDP driver and generates trusted native clicks', async () => {
  const events: boolean[] = [];
  const { render } = createRenderer();
  const view = await render(() => <button onClick={event => { events.push(event.isTrusted); }}>Trusted CDP</button>);
  const button = view.getByRole('button');
  const frameRect = window.frameElement?.getBoundingClientRect();
  const rect = button.getBoundingClientRect();
  const point = { x: (frameRect?.left ?? 0) + rect.left + rect.width / 2, y: (frameRect?.top ?? 0) + rect.top + rect.height / 2 };
  const globals = globalThis as typeof globalThis & { BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER?: { send(command: string, parameters: object): Promise<unknown> } };
  const driver = globals.BASE_UI_DIALOG_TRUSTED_POINTER_DRIVER;
  expect(driver).toBeDefined();
  await driver!.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
  await driver!.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 });
  expect(events).toEqual([true]);
});
