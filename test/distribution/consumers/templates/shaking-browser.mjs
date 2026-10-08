import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const diagnostics = [], results = [];
let browser, server;
try {
  server = createServer(async (request, response) => {
    try {
      if (request.url === '/favicon.ico') { response.statusCode = 204; response.end(); return; }
      const url = new URL(request.url, 'http://localhost');
      const [, fixture, asset] = url.pathname.split('/');
      assert(['empty', 'unused', 'root', 'subpath', 'date-fns', 'luxon'].includes(fixture));
      if (!asset) { response.setHeader('content-type', 'text/html'); response.end(`<main></main><script type="module" src="/${fixture}/client.js"></script>`); }
      else {
        const directory = path.resolve(`bundles/shake-${fixture}`);
        const file = path.resolve(directory, url.pathname.slice(fixture.length + 2));
        assert(file.startsWith(`${directory}/`) && file.endsWith('.js'));
        response.setHeader('content-type', 'text/javascript'); response.end(await fs.readFile(file));
      }
    } catch (error) { diagnostics.push({ source: 'server', stack: error.stack }); response.statusCode = 404; response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true });
  const fixtures = ['empty', 'unused', 'root', 'subpath', ...['date-fns', 'luxon'].filter(kind => input.kind === 'both' || input.kind === kind)];
  for (const fixture of fixtures) {
    const page = await browser.newPage();
    page.on('pageerror', error => diagnostics.push({ fixture, source: 'pageerror', stack: error.stack }));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) diagnostics.push({ fixture, source: 'console', type: message.type(), text: message.text(), location: message.location() }); });
    await page.goto(`http://127.0.0.1:${server.address().port}/${fixture}/`);
    if (['root', 'subpath'].includes(fixture)) {
      await page.waitForFunction(() => window.shakeReady === true);
      await page.click('#shake-toggle');
      await page.waitForFunction(() => document.querySelector('output').textContent === 'on');
      assert.equal(await page.locator('#shake-toggle').getAttribute('aria-pressed'), 'true');
      await page.evaluate(() => window.stopShake());
      assert.equal(await page.locator('#shake-toggle').count(), 0);
      results.push({ fixture, assertions: ['optimized actual Toggle mount', 'native event', 'reactive pressed/value', 'disposal'] });
    } else if (['date-fns', 'luxon'].includes(fixture)) {
      await page.waitForFunction(() => Boolean(window.packedAdapter));
      assert.equal(await page.evaluate(() => window.packedAdapter.date(null, 'UTC')), null);
      assert.equal(await page.evaluate(() => window.packedAdapter.getTimezone(window.packedAdapter.date('2024-03-31', 'Europe/Paris'))), 'Europe/Paris');
      results.push({ fixture, assertions: ['isolated optimized adapter constructor', 'null and timezone contract'] });
    } else {
      await page.waitForFunction(() => window.packedEmpty === true);
      assert.equal(await page.locator('style').count(), 0);
      assert.equal(await page.locator('main > *').count(), 0);
      results.push({ fixture, assertions: ['unused import has no mounted content or style injection'] });
    }
    await page.close();
  }
  assert.deepEqual(diagnostics, []);
} finally {
  await fs.writeFile('shaking-browser-result.json', JSON.stringify({ results, diagnostics }, null, 2));
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
