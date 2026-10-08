import { hydrate, render, isServer } from '@solidjs/web';
import { App } from './app.js';
export function startClient() {
if (isServer) throw new Error('PACKED_CLIENT_SELECTED_SERVER_RENDERER');
const root = document.querySelector<HTMLElement>('main')!;
const button = root.querySelector('#package-toggle');
const separator = root.querySelector('#package-separator');
let cleaned = 0;
let dispose = hydrate(() => <App cleanup={() => cleaned++} />, root, { renderId: 'packed-' });
Object.assign(window, {
  check: () => ({ same: button === root.querySelector('#package-toggle'), sameSeparator: separator === root.querySelector('#package-separator'),
    pressed: root.querySelector('#package-toggle')?.getAttribute('aria-pressed'), value: root.querySelector('#package-value')?.textContent, cleaned }),
  dispose: () => dispose(),
  mount: () => { dispose = render(() => <App cleanup={() => cleaned++} />, root); },
  ready: true,
});
}
