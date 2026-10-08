import { it, expect } from 'vitest';
import { cdp, server } from 'vitest/browser';
import { createRenderer, prepareNativeDocument } from '#test-utils';

it.skipIf(server.browser !== 'chromium')('grants real pointer lock from a trusted press in the current tester document', async () => {
  let request: Promise<void> | undefined;
  const { render } = createRenderer();
  const view = await render(() => <button style={{ position: 'fixed', left: '100px', top: '100px', width: '100px', height: '40px' }}
    onPointerDown={event => {
      console.info('HARNESS_POINTER_LOCK_DOCUMENT', {
        trusted: event.isTrusted, active: navigator.userActivation.isActive, focus: document.hasFocus(),
        connected: document.body.isConnected, correctOwner: document.body.ownerDocument === document,
        rootIsDocument: document.body.getRootNode() === document, visibility: document.visibilityState,
        frameSandbox: window.frameElement?.getAttribute('sandbox'), frameAllow: window.frameElement?.getAttribute('allow'),
      });
      request = document.body.requestPointerLock();
      // Consume the rejection now; the strict assertion below still awaits and fails it.
      request?.catch(() => {});
    }}>Native pointer lock</button>);
  const rect = view.getByRole('button').getBoundingClientRect();
  const frame = window.frameElement as HTMLIFrameElement | null;
  const frameRect = frame?.getBoundingClientRect();
  const scaleX = frame && frameRect ? frameRect.width / frame.offsetWidth : 1;
  const scaleY = frame && frameRect ? frameRect.height / frame.offsetHeight : 1;
  const point = { x: (frameRect?.left ?? 0) + (rect.left + rect.width / 2) * scaleX,
    y: (frameRect?.top ?? 0) + (rect.top + rect.height / 2) * scaleY };
  const driver = cdp();
  try {
    await prepareNativeDocument();
    await driver.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
    expect(request).toBeDefined();
    await request;
    expect(document.pointerLockElement).toBe(document.body);
  } finally {
    document.exitPointerLock();
    await driver.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 });
  }
});
