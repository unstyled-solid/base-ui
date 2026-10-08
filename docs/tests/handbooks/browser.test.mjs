import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { rm } from 'node:fs/promises';
import { createServer } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium } from 'playwright';
import { snippets } from '../../content/handbooks/snippets.mjs';

test('real RC13 live render, native cancellation and ref cleanup in Chromium', async () => {
  const root = fileURLToPath(new URL('../../../', import.meta.url));
  const entry = `import { render } from '@solidjs/web';
import { Button } from 'baseui-solid2/button';
${snippets.refs.replace('export function Example', 'function RefExample')}
const [label, setLabel] = createSignal('first');
const [visible, setVisible] = createSignal(true);
window.update = () => setLabel('second');
window.removeRef = () => setVisible(false);
window.calls = [];
const dispose = render(() => <><Button render={(props) => <button {...props} id="live">{label()}</button>} />
<Button id="events" onClick={(event) => { window.calls.push(event instanceof MouseEvent); event.preventBaseUIHandler(); window.calls.push(event.baseUIHandlerPrevented); }}>Events</Button>
{visible() && <RefExample />}</>, document.getElementById('root'));
window.dispose = dispose;`;
  const server = await createServer({ configFile: false, root,
    cacheDir: `${root}docs/tests/handbooks/.vite`,
    optimizeDeps: { noDiscovery: true, include: ['solid-js', '@solidjs/web'] },
    server: { host: '127.0.0.1', port: 0 },
    resolve: { alias: [{ find: /^baseui-solid2\/(.+)$/, replacement: `${root}packages/solid/src/$1/index.ts` }] },
    plugins: [{ name: 'handbook-test-entry', resolveId(id) { if (id === '/handbook.tsx') return `${root}docs/tests/handbooks/entry.tsx`; },
      load(id) { if (id === `${root}docs/tests/handbooks/entry.tsx`) return entry; },
      configureServer(server) { server.middlewares.use((req, res, next) => {
        if (req.url !== '/') return next();
        res.setHeader('Content-Type', 'text/html');
        res.end('<div id="root"></div><script type="module" src="/handbook.tsx"></script>');
      }); } }, solid()],
  });
  let browser;
  try {
    await server.listen();
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(server.resolvedUrls.local[0]);
    await page.locator('#live').waitFor();
    await page.locator('#live').focus();
    await page.evaluate(() => { window.original = document.querySelector('#live'); window.update(); });
    await page.waitForFunction(() => document.querySelector('#live').textContent === 'second');
    assert.equal(await page.evaluate(() => window.original === document.activeElement), true);
    await page.locator('#events').click();
    assert.deepEqual(await page.evaluate(() => window.calls), [true, true]);
    await page.evaluate(() => { window.detached = [...document.querySelectorAll('button')].find(node => node.textContent === 'Focus me'); window.removeRef(); });
    await page.waitForFunction(() => !window.detached.isConnected);
    const messages = [];
    page.on('console', (message) => messages.push(message.text()));
    await page.evaluate(() => window.detached.dispatchEvent(new FocusEvent('focus')));
    assert.ok(!messages.includes('focused'));
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
    await server.close();
    await rm(`${root}docs/tests/handbooks/.vite`, { recursive: true, force: true });
  }
});
