import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { namespaceOracle, assertRuntimeAccounting } from './runtime-accounting.mjs';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const mask = Number(process.argv[2]);
const optimized = process.argv.includes('--optimized');
const artifact = JSON.parse(await fs.readFile('ssr-result.json', 'utf8'));
const oracle = optimized ? undefined : namespaceOracle(input, JSON.parse(await fs.readFile('resolution-0.json', 'utf8')));
const clientRoot = path.resolve(optimized ? 'bundles/shake-optimized' : `bundles/client-${mask}`);
const diagnostics = [], evidence = { mask, optimized, conditions: optimized ? ['browser'] : input.conditionSets[mask], diagnostics, assertions: [] };
let server, browser;
try {
  server = createServer(async (request, response) => {
    try {
      if (request.url === '/favicon.ico') { response.statusCode = 204; response.end(); return; }
      if (request.url === '/') {
        response.setHeader('content-type', 'text/html');
        response.end(`<!doctype html><html><head></head><body>${artifact.bootstrap}<main>${artifact.html}</main><script type="module" src="/client.js"></script></body></html>`);
      } else {
        const file = path.resolve(clientRoot, `.${new URL(request.url, 'http://localhost').pathname}`);
        assert(file.startsWith(`${clientRoot}/`) && file.endsWith('.js'));
        response.setHeader('content-type', 'text/javascript'); response.end(await fs.readFile(file));
      }
    } catch (error) { diagnostics.push({ source: 'server', stack: error.stack }); response.statusCode = 404; response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('pageerror', error => diagnostics.push({ source: 'pageerror', message: error.message, stack: error.stack }));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) diagnostics.push({ source: 'console', type: message.type(), text: message.text(), location: message.location() }); });
  // Delay the real production bundle to exercise generated delegated-event replay.
  let release;
  const wait = new Promise(resolve => { release = resolve; });
  await page.route('**/client.js', async route => { await wait; await route.continue(); });
  // DOMContentLoaded waits for module scripts; waiting for it while withholding
  // the module would deadlock the prehydration test.
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'commit' });
  await page.locator('#package-toggle').waitFor();
  await page.evaluate(() => { window.originalButton = document.querySelector('#package-toggle'); window.originalSeparator = document.querySelector('#package-separator'); });
  await page.click('#package-toggle');
  release();
  await page.waitForFunction(() => window.ready === true, null, { timeout: 15_000 });
  if (!optimized) {
    const imports = await page.evaluate(() => window.allImports);
    assertRuntimeAccounting(input, imports, oracle);
    evidence.runtimeKeys = imports.map(entry => entry.key).sort();
    evidence.runtimeNamespaces = imports;
  }
  assert.equal(await page.evaluate(() => window.originalButton === document.querySelector('#package-toggle') && window.originalSeparator === document.querySelector('#package-separator')), true);
  await page.waitForFunction(() => window.check().value === 'on');
  assert.equal((await page.evaluate(() => window.check())).pressed, 'true');
  evidence.assertions.push(optimized ? 'optimized real-family fixture executed' : 'all runtime exports executed', 'SSR original button/separator retained', 'prehydration native click replayed');
  await page.click('#package-toggle');
  await page.waitForFunction(() => window.check().value === 'off');
  await page.click('#package-tab-two');
  await page.waitForFunction(() => document.querySelector('#package-tab-two').getAttribute('aria-selected') === 'true');
  const geometry = await page.locator('#package-viewport').boundingBox();
  assert(geometry && geometry.width > 0 && geometry.height > 0, 'Mounted viewport lacks geometry');
  const styles = await page.evaluate(() => [...document.querySelectorAll('style[data-base-ui-style="base-ui-disable-scrollbar"]')].map(node => ({ nonce: node.nonce, text: node.textContent })));
  assert(styles.length > 0 && styles.every(style => style.nonce === 'packed-consumer-nonce' && style.text.includes('scrollbar-width:none')));
  assert.equal(await page.locator('#package-viewport').evaluate(node => getComputedStyle(node).scrollbarWidth), 'none');
  evidence.styles = styles;
  evidence.assertions.push('minified Toggle native click updates state', 'compound Tabs selection', 'real geometry', 'CSP scrollbar style survives optimization');
  await page.evaluate(() => window.dispose());
  await page.waitForFunction(() => document.querySelectorAll('[data-base-ui-style="base-ui-disable-scrollbar"]').length === 0);
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.evaluate(() => window.mount());
    await page.waitForFunction(() => document.querySelector('#package-toggle'));
    await page.click('#package-toggle');
    await page.waitForFunction(() => document.querySelector('#package-value').textContent === 'on');
    await page.evaluate(() => window.dispose());
    await page.waitForFunction(() => !document.querySelector('#package-toggle') && document.querySelectorAll('[data-base-ui-style="base-ui-disable-scrollbar"]').length === 0);
  }
  assert.equal((await page.evaluate(() => window.check())).cleaned, 4);
  evidence.assertions.push('SSR and three production mounts disposed', 'shared styles absent after every disposal');
  assert.deepEqual(diagnostics, [], 'Unexpected browser diagnostics');
} catch (error) {
  // Retain completed assertions and the DOM/registry at the failure boundary,
  // even if stock RC13 hydration never reaches window.ready.
  if (browser) for (const page of browser.contexts().flatMap(context => context.pages())) {
    evidence.failureState = await page.evaluate(() => ({ ready: window.ready ?? false,
      imports: window.allImports ?? null, state: window.check?.() ?? null,
      sameOriginalButton: window.originalButton === document.querySelector('#package-toggle'),
      html: document.querySelector('main')?.outerHTML })).catch(capture => ({ captureError: capture.message }));
  }
  evidence.failure = { message: error.message, stack: error.stack };
  throw error;
} finally {
  await fs.writeFile(optimized ? 'browser-optimized.json' : `browser-${mask}.json`, JSON.stringify(evidence, null, 2));
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
