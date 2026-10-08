import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mark } from './protocol.mjs';

const nonce = 'qualification-nonce';
const escapeJSON = value => JSON.stringify(value).replaceAll('<', '\\u003c');

export function documentFor(entries) {
  return `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/fixture.css"></head><body>
${entries.map(entry => `<main id="${entry.id}">${entry.html}</main>`).join('\n')}
<script nonce="${nonce}">
window.hydrationEntries=${escapeJSON(entries.map(entry => ({ renderId: entry.id, props: entry.props })))};
window.serverOriginals = new Map([...document.querySelectorAll('main')].map(root => [root.id, [...root.querySelectorAll('[data-probe],[data-row]')]]));
window.prehydration = [...document.querySelectorAll('main')].map(root => ({ id:root.id,
  indicatorHidden: root.querySelector('[data-probe="indicator"]')?.hidden,
  indicatorWidth: root.querySelector('[data-probe="indicator"]')?.style.getPropertyValue('--active-tab-width'),
  thumbVisibility: root.querySelector('[data-probe="thumb"]')?.style.visibility,
  thumbPosition: root.querySelector('[data-probe="thumb"]')?.style.getPropertyValue('--position'),
  scripts: [...root.querySelectorAll('script')].map(script => ({ body:script.textContent, nonce:script.nonce })),
  tabScript: !!root.querySelector('[data-probe="indicator"] + script')
}));
window.startQualification=()=>import('/client.js');
</script></body></html>`;
}

export async function browserReplay({ chromium, directory, report, mode }) {
  const artifact = JSON.parse(await readFile(path.join(directory, 'server-evidence.json'), 'utf8'));
  const logs = [];
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/') {
        const selected = url.searchParams.get('case') ?? 'controls';
        const entries = selected === 'controls' ? artifact.rendered.filter(entry => entry.id.startsWith('controls-'))
          : artifact.rendered.filter(entry => entry.id === selected);
        if (!entries.length) { response.writeHead(404); response.end('Unknown fixture'); return; }
        response.setHeader('Content-Type', 'text/html');
        response.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'; style-src-elem 'self' 'nonce-${nonce}'; style-src-attr 'unsafe-inline'; object-src 'none'`);
        response.end(documentFor(entries));
      } else if (url.pathname === '/client.js' || url.pathname === '/fixture.css') {
        response.setHeader('Content-Type', url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript');
        response.end(await readFile(url.pathname.endsWith('.css') ? path.join(directory, 'fixture.css') : path.join(directory, 'client', 'client.js')));
      } else if (url.pathname === '/favicon.ico') { response.writeHead(204); response.end(); }
      else { response.writeHead(404); response.end('Missing asset'); }
    } catch (error) { response.writeHead(500); response.end(String(error)); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  const results = [];
  const base = `http://127.0.0.1:${server.address().port}`;
  async function scenario(name, ids, fixture, test, query = '') {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const diagnostics = [];
    page.on('console', message => {
      const entry = { type: message.type(), text: message.text(), location: message.location() };
      logs.push({ scenario: name, ...entry });
      if (['warning', 'error'].includes(entry.type)) diagnostics.push(entry);
    });
    page.on('pageerror', error => diagnostics.push({ type: 'pageerror', text: String(error.stack ?? error) }));
    page.on('requestfailed', request => diagnostics.push({ type: 'network', url: request.url(), error: request.failure() }));
    let error;
    try {
      await page.goto(`${base}/?case=${fixture}${query}`, { waitUntil: 'load', timeout: 15_000 });
      await test(page);
    } catch (failure) { error = String(failure.stack ?? failure); }
    finally {
      // Retain asynchronous warning delivery through one settled frame before disposal.
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))).catch(() => {});
      await context.close();
    }
    if (diagnostics.length) error = `${error ?? ''}\nUnapproved diagnostics: ${JSON.stringify(diagnostics)}`;
    const result = { name, status: error ? 'failed' : 'passed', error, diagnostics };
    results.push(result); mark(report, ids, mode, result.status, result);
  }
  const boot = async page => {
    await page.evaluate(() => window.startQualification());
    await page.waitForFunction(() => !!window.qualification, undefined, { timeout: 10_000 });
  };
  const identity = async (page, key) => assert.equal(await page.evaluate(key => {
    const originals = window.serverOriginals.get(key);
    return originals.every(node => {
      const probe = node.getAttribute('data-probe'), row = node.getAttribute('data-row');
      return document.getElementById(key).querySelector(probe ? `[data-probe="${probe}"]` : `[data-row="${row}"]`) === node;
    });
  }, key), true, `ORIGINAL_HOST_REPLACED:${key}`);
  const count = (page, key, event) => page.evaluate(({ key, event }) => window.qualification.counts[key][event] ?? 0, { key, event });
  try {
    browser = await chromium.launch({ headless: true });
    await scenario('multiple-roots-original-hosts-events', ['root-ids', 'identity-events'], 'controls', async page => {
      const before = await page.evaluate(() => [...document.querySelectorAll('main')].map(root => ({
        id: root.querySelector('[data-probe="input"]').id,
        label: root.querySelector('[data-probe="label"]').htmlFor,
      })));
      assert(before.every(record => record.id && record.label === record.id), 'SSR_LABEL_OWNERSHIP');
      assert.notEqual(before[0].id, before[1].id, 'ROOT_ID_COLLISION');
      await boot(page);
      await identity(page, 'controls-a'); await identity(page, 'controls-b');
      const after = await page.evaluate(() => [...document.querySelectorAll('main')].map(root => ({
        id: root.querySelector('[data-probe="input"]').id,
        label: root.querySelector('[data-probe="label"]').htmlFor,
        description: root.querySelector('[data-probe="input"]').getAttribute('aria-describedby'),
        expected: root.querySelector('[data-probe="description"]').id,
      })));
      assert.deepEqual(after.map(({ id, label }) => ({ id, label })), before, 'ID_DRIFT');
      assert(after.every(record => record.expected && record.description.split(' ').includes(record.expected)), 'DESCRIPTION_OWNERSHIP');
      await page.locator('#controls-a [data-probe="toggle"]').click();
      assert.equal(await count(page, 'controls-a', 'click'), 1);
      assert.equal(await count(page, 'controls-a', 'pressed'), 1);
      assert.equal(await count(page, 'controls-b', 'pressed'), 0);
      await page.locator('#controls-a [data-probe="input"]').fill('changed');
      await page.waitForFunction(() => document.querySelector('#controls-a output').textContent === 'changed');
      assert.equal(await count(page, 'controls-a', 'input'), 1);
      assert.equal(await page.locator('#controls-b output').textContent(), 'initial');
      await identity(page, 'controls-a');
    });
    await scenario('nested-roots-and-disposal', ['nested-roots', 'disposal'], 'controls', async page => {
      await boot(page);
      await page.evaluate(() => window.qualification.mount('nested', 'controls-a'));
      await page.locator('#nested [data-probe="toggle"]').click();
      assert.equal(await count(page, 'nested', 'pressed'), 1);
      assert.equal(await count(page, 'controls-a', 'pressed'), 0);
      assert.equal(await count(page, 'controls-b', 'pressed'), 0);
      await page.evaluate(() => window.qualification.dispose('nested'));
      await page.evaluate(() => document.querySelector('#nested [data-probe="toggle"]')?.click());
      assert.equal(await count(page, 'nested', 'pressed'), 1, 'DISPOSED_NESTED_EVENT');
      assert.equal(await count(page, 'nested', 'cleanup'), 1);
      await page.locator('#controls-b [data-probe="toggle"]').click();
      assert.equal(await count(page, 'controls-b', 'pressed'), 1);
      for (let iteration = 0; iteration < 3; iteration += 1) {
        const key = `cycle-${iteration}`;
        await page.evaluate(key => window.qualification.mount(key), key);
        await page.locator(`#${key} [data-probe="toggle"]`).click();
        assert.equal(await count(page, key, 'pressed'), 1);
        await page.evaluate(key => window.qualification.dispose(key), key);
        await page.evaluate(key => document.querySelector(`#${key} [data-probe="toggle"]`)?.click(), key);
        assert.equal(await count(page, key, 'pressed'), 1, 'DISPOSED_EVENT');
        assert.equal(await count(page, key, 'cleanup'), 1, 'OWNED_CLEANUP_COUNT');
      }
    });
    for (const keepMounted of [false, true]) {
      const key = `tabs-${keepMounted}`;
      await scenario(key, ['open-closed', 'keep-mounted', 'conditional'], key, async page => {
        assert.equal(await page.locator('[data-probe="panel-a"]').count(), 1);
        assert.equal(await page.locator('[data-probe="panel-b"]').count(), keepMounted ? 1 : 0);
        await boot(page); await identity(page, key);
        if (keepMounted) assert.equal(await page.locator('[data-probe="panel-b"]').isVisible(), false);
        await page.locator('[data-probe="tab-b"]').click();
        await page.locator('[data-probe="panel-b"]').waitFor({ state: 'visible' });
        const panel = await page.locator('[data-probe="panel-b"]').evaluateHandle(node => node);
        const input = await page.locator('[data-probe="conditional-input"]').evaluateHandle(node => node);
        await page.locator('[data-probe="conditional-input"]').fill('preserved');
        await page.locator('[data-probe="tab-a"]').click();
        await page.locator('[data-probe="panel-b"]').waitFor({ state: keepMounted ? 'hidden' : 'detached' });
        if (keepMounted) {
          assert.equal(await panel.evaluate(node => node.hidden || node.inert || node.getAttribute('aria-hidden') === 'true'), true, 'CLOSED_PANEL_ACCESSIBLE');
          await page.locator('[data-probe="tab-b"]').click();
          await page.locator('[data-probe="panel-b"]').waitFor({ state: 'visible' });
          assert.equal(await panel.evaluate(node => node === document.querySelector('[data-probe="panel-b"]')), true);
          assert.equal(await input.evaluate(node => node === document.querySelector('[data-probe="conditional-input"]') && node.value === 'preserved'), true);
          await page.locator('[data-probe="conditional"]').click();
          await page.locator('[data-probe="conditional-input"]').waitFor({ state: 'detached' });
          await page.locator('[data-probe="conditional"]').click();
          await page.locator('[data-probe="conditional-input"]').waitFor({ state: 'attached' });
          assert.equal(await input.evaluate(node => node === document.querySelector('[data-probe="conditional-input"]')), false);
        }
      });
    }
    for (const initialOpen of [false, true]) for (const keepMounted of [false, true]) {
      const key = `dialog-${initialOpen}-${keepMounted}`;
      await scenario(key, ['open-closed', 'keep-mounted', 'portal'], key, async page => {
        assert.equal(await page.locator('[data-probe="popup"]').count(), 0, 'SSR_PORTAL_CONTENT');
        await boot(page); await identity(page, key);
        if (initialOpen || keepMounted) await page.locator('[data-probe="popup"]').waitFor({ state: 'attached' });
        if (!initialOpen) {
          assert.equal(await page.locator('[data-probe="popup"]').isVisible(), false);
          await page.locator('[data-probe="trigger"]').click();
          assert.equal(await count(page, key, 'trigger-click'), 1);
        }
        await page.locator('[data-probe="popup"]').waitFor({ state: 'visible' });
        const popup = await page.locator('[data-probe="popup"]').evaluateHandle(node => node);
        assert.equal(await popup.evaluate(node => !document.querySelector('main').contains(node) && node.getBoundingClientRect().width > 0), true);
        await page.locator('[data-probe="portal-toggle"]').click();
        assert.equal(await count(page, key, 'portal-click'), 1);
        assert.equal(await count(page, key, 'portal-pressed'), 1);
        await page.locator('[data-probe="close"]').click();
        await page.locator('[data-probe="popup"]').waitFor({ state: keepMounted ? 'hidden' : 'detached' });
        if (keepMounted) {
          assert.equal(await popup.evaluate(node => node.hidden || node.inert || node.getAttribute('aria-hidden') === 'true'), true, 'CLOSED_DIALOG_ACCESSIBLE');
          await page.locator('[data-probe="trigger"]').click();
          await page.locator('[data-probe="popup"]').waitFor({ state: 'visible' });
          assert.equal(await popup.evaluate(node => node === document.querySelector('[data-probe="popup"]')), true, 'PORTAL_REOPEN_REPLACED');
        }
        await page.evaluate(key => window.qualification.dispose(key), key);
        await page.locator('[data-probe="popup"]').waitFor({ state: 'detached' });
        assert.equal(await count(page, key, 'cleanup'), 1);
      });
    }
    for (const container of ['shadow', 'iframe']) {
      await scenario(`portal-${container}`, ['portal-containers'], 'dialog-true-true', async page => {
        await boot(page);
        const root = container === 'iframe' ? page.frameLocator('#portal-frame') : page;
        await root.locator('[data-probe="popup"]').waitFor({ state: 'visible' });
        await root.locator('[data-probe="portal-toggle"]').click();
        assert.equal(await count(page, 'dialog-true-true', 'portal-pressed'), 1);
        assert.equal(await page.evaluate(container => {
          const mount = container === 'iframe' ? document.querySelector('iframe').contentDocument.body : document.querySelector('#shadow-host').shadowRoot;
          return !!mount.querySelector('[data-probe="popup"]');
        }, container), true, 'PORTAL_WRONG_DOCUMENT_OR_CONTAINER');
        await page.evaluate(() => window.qualification.dispose('dialog-true-true'));
        await root.locator('[data-probe="popup"]').waitFor({ state: 'detached' });
      }, `&container=${container}`);
    }
    await scenario('streamed-async-list-and-stale-disposal', ['stream-hydration', 'async-list', 'stale-async'], 'stream', async page => {
      await page.locator('[data-row="a"]').waitFor({ state: 'attached' });
      await boot(page); await identity(page, 'stream');
      await page.locator('[data-row="a"]').click();
      assert.equal(await count(page, 'stream', 'row-click'), 1);
      const original = await page.locator('[data-row="a"]').evaluateHandle(node => node);
      await page.evaluate(() => window.qualification.update('stream'));
      await page.waitForFunction(() => document.querySelector('[data-row="a"]').textContent === 'stream-request:0:a');
      await page.evaluate(() => window.qualification.resolve('stream'));
      await page.waitForFunction(() => document.querySelector('[data-row="a"]').textContent === 'stream-request:1:a');
      assert.equal(await original.evaluate(node => node === document.querySelector('[data-row="a"]')), true, 'KEYED_HOST_REPLACED');
      await page.evaluate(() => window.qualification.update('stream'));
      await page.evaluate(() => window.qualification.dispose('stream'));
      const before = await original.evaluate(node => node.textContent);
      await page.evaluate(() => window.qualification.resolve('stream'));
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
      assert.equal(await original.evaluate(node => node.textContent), before, 'STALE_ASYNC_MUTATED_DOM');
      assert.equal(await count(page, 'stream', 'cleanup'), 1);
    });
    await scenario('errored-stream-hydration', ['error-boundary'], 'error', async page => {
      await page.locator('[data-probe="error"]').waitFor({ state: 'attached' });
      assert.match(await page.locator('[data-probe="error"]').textContent(), /expected:error-request/);
      await boot(page);
      await identity(page, 'error');
      await page.evaluate(() => window.qualification.dispose('error'));
      assert.equal(await count(page, 'error', 'cleanup'), 1);
    });
    for (const disabled of [false, true]) {
      const key = `csp-${disabled}`;
      await scenario(key, ['csp-nonce', 'csp-disabled', 'tabs-prehydration', 'slider-prehydration'], key, async page => {
        const pre = await page.evaluate(() => window.prehydration[0]);
        assert.equal(pre.tabScript, true, 'TABS_SCRIPT_ABSENT');
        assert(pre.scripts.some(script => script.body.includes('document.currentScript')), 'PREHYDRATION_SERVER_BODY_STUBBED');
        assert(pre.scripts.every(script => script.nonce === 'qualification-nonce'), 'SCRIPT_NONCE_MISSING');
        assert.equal(pre.indicatorHidden, false, 'TABS_PREHYDRATION_DID_NOT_POSITION');
        assert.equal(pre.indicatorWidth, '100px');
        assert.equal(pre.thumbVisibility, '', 'SLIDER_PREHYDRATION_DID_NOT_POSITION');
        assert(Math.abs(Number.parseFloat(pre.thumbPosition) - 27.5) < 0.01, `SLIDER_POSITION:${pre.thumbPosition}`);
        await boot(page);
        // Prehydration scripts intentionally disappear; retained control hosts must survive.
        assert.equal(await page.evaluate(key => window.serverOriginals.get(key).filter(node => node.tagName !== 'SCRIPT').every(node => {
          const probe = node.getAttribute('data-probe');
          return document.getElementById(key).querySelector(`[data-probe="${probe}"]`) === node;
        }), key), true, 'CSP_CONTROL_HOST_REPLACED');
        await page.waitForFunction(() => !document.querySelector('main [data-probe="indicator"] + script') && !document.querySelector('main [data-probe="thumb"] script'));
        const styles = await page.evaluate(() => [...document.querySelectorAll('style')].filter(style => style.textContent.includes('base-ui-disable-scrollbar')).map(style => style.nonce));
        if (disabled) assert.deepEqual(styles, [], 'DISABLED_STYLE_INJECTED');
        else { assert(styles.length > 0, 'DEFAULT_STYLE_ABSENT'); assert(styles.every(value => value === nonce), 'STYLE_NONCE_MISSING'); }
        await page.locator('[data-probe="thumb"] input').focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('[data-probe="thumb"] input').value === '26');
      });
    }
    await scenario('tabs-null-selection-prehydration', ['tabs-prehydration'], 'csp-null', async page => {
      assert.equal(await page.evaluate(() => window.prehydration[0].tabScript), false);
      assert.equal(await page.locator('[data-probe="indicator"]').count(), 0);
      await boot(page);
      assert.equal(await page.locator('[data-probe="indicator"]').count(), 0);
    });
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
    await writeFile(path.join(directory, 'browser-evidence.json'), JSON.stringify({ results, logs }, null, 2));
  }
}
