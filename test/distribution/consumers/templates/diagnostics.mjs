import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const results = [];
let browser, server;
try {
  // Actual Node resolution and behavior, not a source string or simulated map.
  const script = `import assert from 'node:assert/strict';
    import { Popover } from ${JSON.stringify(input.name + '/popover')};
    const messages=[]; console.warn=(...args)=>messages.push(args.join(' '));
    Popover.createHandle().open();
    assert.equal(messages.length, process.argv[1] === 'development' ? 1 : 0);
    if(messages.length) assert.match(messages[0], /no root using this handle is mounted/);`;
  for (const environment of ['production', 'development']) {
    const result = spawnSync('rtk', ['proxy', process.execPath, ...(environment === 'development' ? ['--conditions=development'] : []), '--input-type=module', '-e', script, environment], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    assert.equal(result.stdout, '', 'Unexpected Node stdout');
    assert.equal(result.stderr, '', 'Unexpected Node stderr');
  }
  server = createServer(async (request, response) => {
    try {
      if (request.url === '/favicon.ico') { response.writeHead(204).end(); return; }
      const environment = request.url.split('/')[1];
      assert(['production', 'development'].includes(environment));
      if (request.url.endsWith('/client.js')) {
        response.setHeader('content-type', 'text/javascript');
        response.end(await fs.readFile(path.resolve(`bundles/diagnostics-${environment}/client.js`)));
      } else {
        response.setHeader('content-type', 'text/html');
        response.end(`<main></main><script type="module" src="/${environment}/client.js"></script>`);
      }
    } catch (error) { response.writeHead(500).end(error.message); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true });
  for (const environment of ['production', 'development']) {
    const page = await browser.newPage();
    const messages = [], errors = [];
    page.on('console', message => { if (['warning', 'error'].includes(message.type())) messages.push({ type: message.type(), text: message.text() }); });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/${environment}/`);
    await page.waitForFunction(() => window.diagnosticsReady);
    assert.equal(await page.evaluate(() => typeof process), 'undefined', 'No browser process polyfill');
    await page.click('#make-uncontrolled');
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.deepEqual(errors, []);
    const expected = environment === 'development' ? 1 : 0;
    assert.equal(messages.filter(message => /expected a native <button>/.test(message.text) && message.type === 'error').length, expected);
    assert.equal(messages.filter(message => /changing the controlled checked state.*uncontrolled/.test(message.text)).length, expected);
    assert.equal(messages.length, expected * 2, 'No unexpected or duplicate diagnostics');
    await page.evaluate(() => window.disposeDiagnostics());
    results.push({ environment, messages, errors, process: 'undefined', serverHandleWarning: expected });
    await page.close();
  }
} finally {
  await fs.writeFile('diagnostics-result.json', JSON.stringify({ results }, null, 2));
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
