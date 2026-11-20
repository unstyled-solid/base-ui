import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const pkg = JSON.parse(await fs.readFile(new URL('../../package.json', import.meta.url)));
assert.equal(process.versions.node, pkg.engines.node, 'Use the pinned Node version');
await fs.access(new URL('../../upstream/base-ui/packages/react/src/index.ts', import.meta.url));
// Test the actual headed capability before builds or the long interaction suite.
const server = createServer((request, response) => {
  response.setHeader('Content-Type', 'text/html');
  response.end('<!doctype html><button>Pointer lock preflight</button>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.bringToFront();
  await page.waitForFunction(() => document.hasFocus(), null, { timeout: 5000 });
  await page.evaluate(() => {
    document.querySelector('button').onclick = () => document.body.requestPointerLock().catch(error => { window.pointerLockError = error.message; });
  });
  await page.locator('button').click();
  await page.waitForFunction(() => document.pointerLockElement === document.body || window.pointerLockError, null, { timeout: 5000 });
  assert.equal(await page.evaluate(() => window.pointerLockError ?? null), null, 'Native pointer lock unavailable');
  console.log('PASS: headed Chromium native pointer lock');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
