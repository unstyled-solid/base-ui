import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';
import { build } from 'vite';
import solid from '@solidjs/vite-plugin';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

const assertions = [], diagnostics = [];
const record = id => assertions.push({ id, status: 'passed' });
let browser, server;
try {
  for (const moduleResolution of [ts.ModuleResolutionKind.Bundler, ts.ModuleResolutionKind.NodeNext]) {
    const program = ts.createProgram(['qualification-app.tsx', 'qualification-client.tsx', 'qualification-server.tsx'], {
      target: ts.ScriptTarget.ES2022, module: moduleResolution === ts.ModuleResolutionKind.NodeNext ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
      moduleResolution, strict: true, skipLibCheck: false, noEmit: true, jsx: ts.JsxEmit.Preserve, jsxImportSource: '@solidjs/web', types: ['node'],
    });
    const errors = ts.getPreEmitDiagnostics(program);
    assert.equal(errors.length, 0, ts.formatDiagnostics(errors, { getCurrentDirectory: () => process.cwd(), getCanonicalFileName: f => f, getNewLine: () => '\n' }));
  }
  record('qualification-fixtures-strict-types');
  for (const ssr of [true, false]) {
    await build({ configFile: false, root: process.cwd(), logLevel: 'warn',
      plugins: [solid({ compiler: 'babel', ssr: true, solid: { hydratable: true, moduleName: '@solidjs/web' } })],
      resolve: { conditions: ['browser', 'production'] }, ssr: { resolve: { conditions: ['node', 'production'] } },
      define: { 'process.env.NODE_ENV': '"production"' },
      build: { outDir: `qualification-bundle/${ssr ? 'server' : 'client'}`, emptyOutDir: true, minify: true, sourcemap: true,
        ...(ssr ? { ssr: 'qualification-server.tsx' } : { lib: { entry: 'qualification-client.tsx', formats: ['es'], fileName: () => 'client.js' } }),
        rollupOptions: { output: { entryFileNames: ssr ? 'server.mjs' : 'client.js' }, onwarn: warning => { throw new Error(warning.message); } },
      },
    });
  }
  const rendered = spawnSync('rtk', ['proxy', process.execPath, 'qualification-bundle/server/server.mjs'], { encoding: 'utf8' });
  process.stdout.write(rendered.stdout); process.stderr.write(rendered.stderr);
  assert.equal(rendered.status, 0); assert.equal(rendered.stderr, '');
  const cases = JSON.parse(await fs.readFile('qualification-ssr.json'));
  server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost');
      if (url.pathname === '/favicon.ico') { response.writeHead(204).end(); return; }
      if (url.pathname === '/') {
        const item = cases.find(c => String(c.vertical) === url.searchParams.get('vertical') && String(c.rtl) === url.searchParams.get('rtl'));
        response.setHeader('content-type', 'text/html');
        response.end(`<!doctype html><html><head></head><body>${item?.bootstrap ?? ''}<main>${item?.html ?? ''}</main><script type="module" src="/client.js"></script></body></html>`);
      } else {
        assert.equal(url.pathname, '/client.js');
        response.setHeader('content-type', 'text/javascript');
        response.end(await fs.readFile('qualification-bundle/client/client.js'));
      }
    } catch (e) { diagnostics.push(e.stack); response.writeHead(500).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function page() {
    const page = await browser.newPage();
    page.on('pageerror', e => diagnostics.push(e.stack));
    page.on('console', m => { if (['warning', 'error'].includes(m.type())) diagnostics.push(m.text()); });
    return page;
  }
  for (const item of cases) {
    const p = await page();
    let release;
    const held = new Promise(resolve => { release = resolve; });
    await p.route('**/client.js', async route => { await held; await route.continue(); });
    await p.goto(`${base}/?vertical=${item.vertical}&rtl=${item.rtl}`, { waitUntil: 'commit' });
    await p.locator('#ssr-thumb').waitFor({ state: 'attached' });
    const initial = await p.evaluate(() => {
      const indicator = document.querySelector('#ssr-indicator'), thumb = document.querySelector('#ssr-thumb');
      // The first panel is intentionally removed by the queued tab selection;
      // every persistent control host must retain its original SSR identity.
      window.originalQualificationNodes = [...document.querySelectorAll('main [id]:not([role="tabpanel"])')];
      return { tabWidth: indicator.style.getPropertyValue('--active-tab-width'), tabHeight: indicator.style.getPropertyValue('--active-tab-height'), hidden: indicator.hidden,
        position: thumb.style.getPropertyValue('--position'), visibility: thumb.style.visibility,
        scripts: [...document.querySelectorAll('main script')].map(s => s.nonce) };
    });
    assert.equal(initial.tabWidth, '100px'); assert.equal(initial.tabHeight, '40px'); assert.equal(initial.hidden, false);
    const expected = (10 + ((item.vertical ? 160 : 240) - 20) * .25) / (item.vertical ? 160 : 240) * 100;
    assert(Math.abs(parseFloat(initial.position) - expected) < .001, JSON.stringify(initial));
    assert.equal(initial.visibility, ''); assert(initial.scripts.length >= 2 && initial.scripts.every(n => n === 'qualification-nonce'));
    record(`prehydration-geometry-${item.vertical}-${item.rtl}`);
    await p.click('#ssr-toggle'); await p.click('#ssr-two');
    await p.locator('#ssr-thumb input').focus();
    await p.keyboard.press('ArrowUp');
    release();
    await p.waitForFunction(() => window.qualificationImported);
    await p.evaluate(() => window.hydrateQualification());
    await p.waitForFunction(() => document.querySelector('#ssr-pressed').textContent === 'true');
    await p.waitForFunction(() => document.querySelector('#ssr-two').getAttribute('aria-selected') === 'true');
    await p.waitForFunction(() => document.querySelector('#ssr-value').textContent === '26');
    assert(await p.evaluate(() => window.originalQualificationNodes.every(node => document.getElementById(node.id) === node)));
    await p.waitForFunction(() => document.querySelectorAll('main script').length === 0);
    await p.locator('#ssr-thumb input').focus();
    await p.keyboard.press('ArrowUp');
    await p.waitForFunction(() => document.querySelector('#ssr-value').textContent === '27');
    await p.evaluate(() => window.disposeQualification('ssr'));
    await p.waitForFunction(() => document.querySelectorAll('[data-base-ui-style]').length === 0);
    record(`prehydration-replay-identity-slider-handoff-${item.vertical}-${item.rtl}`);
    await p.close();
  }
  const p = await page();
  // Instrument global native subscriptions before package evaluation. Exact
  // callback/capture identity mirrors DOM registration and once semantics.
  await p.addInitScript(() => {
    const active = [], add = EventTarget.prototype.addEventListener, remove = EventTarget.prototype.removeEventListener;
    const types = new Set(['click', 'keydown', 'keyup', 'pointerdown', 'pointerup', 'pointermove', 'pointercancel', 'mousedown', 'mouseup', 'mousemove', 'touchstart', 'touchmove', 'touchend', 'focusin', 'focusout', 'blur', 'resize', 'scroll']);
    EventTarget.prototype.addEventListener = function(type, callback, options) {
      const capture = typeof options === 'boolean' ? options : !!options?.capture;
      if ((this === window || this === document) && callback && types.has(type) && !active.some(x => x.target === this && x.type === type && x.callback === callback && x.capture === capture)) active.push({ target: this, type, callback, capture, stack: new Error().stack });
      return add.call(this, type, callback, options);
    };
    EventTarget.prototype.removeEventListener = function(type, callback, options) {
      const capture = typeof options === 'boolean' ? options : !!options?.capture;
      const index = active.findIndex(x => x.target === this && x.type === type && x.callback === callback && x.capture === capture);
      if (index !== -1) active.splice(index, 1);
      return remove.call(this, type, callback, options);
    };
    window.globalListeners = () => active.map(x => `${x.target === window ? 'window' : 'document'}:${x.type}:${x.capture}`).sort();
    window.globalListenerDetails = () => active.map(({ target, callback, ...entry }) => entry);
  });
  let releaseCSR;
  const heldCSR = new Promise(resolve => { releaseCSR = resolve; });
  await p.route('**/client.js', async route => { await heldCSR; await route.continue(); });
  await p.goto(base, { waitUntil: 'commit' });
  await p.locator('main').waitFor({ state: 'attached' });
  await p.waitForFunction(() => typeof window.globalListeners === 'function');
  // Playwright installs its own trusted-input interception listeners. Establish
  // that baseline before the archive module can execute, not after a warm-up mount.
  const baseline = await p.evaluate(() => window.globalListeners());
  releaseCSR();
  await p.waitForFunction(() => window.qualificationImported);
  assert.equal(await p.locator('[data-base-ui-style]').count(), 0);
  assert.deepEqual(await p.evaluate(() => window.globalListeners()), baseline, JSON.stringify(await p.evaluate(() => window.globalListenerDetails())));
  record('import-alone-no-styles-or-global-listeners');
  const originalStyles = await p.evaluate(() => [document.body.style.cssText, document.documentElement.style.cssText]);
  for (let cycle = 0; cycle < 3; cycle++) {
    await p.evaluate(() => { window.mountQualification('a'); window.mountQualification('b'); });
    await p.waitForFunction(() => document.querySelectorAll('head style[data-base-ui-style]').length === 1);
    assert.equal(await p.locator('head style[data-base-ui-style]').evaluate(s => s.nonce), 'qualification-nonce');
    assert.equal(await p.locator('#a-viewport').evaluate(s => getComputedStyle(s).scrollbarWidth), 'none');
    await p.click('#a-select'); await p.locator('#a-select-popup').waitFor();
    assert.equal(await p.locator('head style[data-base-ui-style]').count(), 1);
    await p.locator('#a-select-popup').getByRole('option', { name: 'Two', exact: true }).click(); await p.locator('#a-select-popup').waitFor({ state: 'hidden' });
    await p.hover('#a-hover'); await p.locator('#a-tooltip').waitFor();
    await p.hover('#b-hover'); await p.locator('#b-tooltip').waitFor();
    await p.click('#a-open'); await p.locator('#a-popup').waitFor();
    await p.evaluate(() => document.querySelector('#b-open').click()); await p.locator('#b-popup').waitFor();
    const mounted = await p.evaluate(() => window.globalListeners()); assert(mounted.length > 0);
    await p.evaluate(() => window.disposeQualification('a'));
    await p.waitForFunction(() => document.querySelectorAll('head style[data-base-ui-style]').length === 1 && !document.querySelector('#a-popup'));
    assert(await p.locator('#b-popup').isVisible());
    await p.click('#b-close'); await p.locator('#b-popup').waitFor({ state: 'detached' });
    await p.evaluate(() => window.disposeQualification('b'));
    await p.waitForFunction(expected => document.querySelectorAll('[data-base-ui-style]').length === 0 && JSON.stringify(window.globalListeners()) === JSON.stringify(expected), baseline);
    assert.deepEqual(await p.evaluate(() => [document.body.style.cssText, document.documentElement.style.cssText]), originalStyles);
    record(`overlapping-styles-dialog-listeners-scroll-lock-disposal-${cycle}`);
  }
  await p.evaluate(() => window.mountQualification('disabled', true));
  await p.locator('#disabled-viewport').waitFor();
  assert.equal(await p.locator('[data-base-ui-style]').count(), 0);
  await p.evaluate(() => window.disposeQualification('disabled'));
  record('disableStyleElements-no-injection');
  await p.evaluate(() => {
    const outer = document.body.appendChild(document.createElement('div')); outer.id = 'shadow-owner';
    const shadow = outer.attachShadow({ mode: 'open' }); const mount = shadow.appendChild(document.createElement('div'));
    window.mountQualification('shadow', false, mount);
  });
  await p.waitForFunction(() => document.querySelector('#shadow-owner').shadowRoot.querySelectorAll('style[data-base-ui-style]').length === 1);
  assert.equal(await p.locator('head style[data-base-ui-style]').count(), 0);
  await p.evaluate(() => window.disposeQualification('shadow'));
  await p.waitForFunction(() => document.querySelector('#shadow-owner').shadowRoot.querySelectorAll('style[data-base-ui-style]').length === 0);
  record('shadow-root-style-isolation-disposal');
  await p.close();
  assert.deepEqual(diagnostics, []);
} finally {
  await fs.writeFile('qualification-browser.json', JSON.stringify({ assertions, diagnostics }, null, 2));
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
