import { mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { release, platform } from 'node:os';
import { createServer } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium, firefox, webkit } from 'playwright';
import { browsers, environments, scenarios, sourceSha, gate } from './model.mjs';
import { root, digest, inventory as buildInventory } from './inventory.mjs';
import { options, readPrepared, owned, cache, treeHash, fixtureHash } from './prepare.mjs';
import { check } from './check.mjs';
import { runScenario } from './actions.mjs';

const args = options(process.argv.slice(2), ['--prepared', '--freeze', '--output', '--manual', '--serve']);
const preparedPath = args['--prepared'] ?? resolve(cache, 'prepared.json');
const prepared = await readPrepared(preparedPath);
if (args['--freeze'] !== prepared.artifactSha256) throw new Error('--freeze must equal the prepared archive SHA256 (external consumer: complete package tree SHA256)');
// Always syntax/unit/typecheck before any server/browser work, including manual hosting.
const inventory = await check(preparedPath);
const output = owned(resolve(args['--output'] ?? resolve(cache, `run-${Date.now()}`)));
await mkdir(output, { recursive: true });
const evidence = { schemaVersion: 1, sourceSha, sourceDigest: inventory.sourceDigest,
  artifact: prepared, fixtureSha256: prepared.fixtureSha256,
  hostPlatform: { os: platform(), version: release(), node: process.version },
  toolchain: {}, command: process.argv, started: new Date().toISOString(), results: [],
  qualification: 'DOM/keyboard assertions; no automated speech, device, product-contrast or universal WCAG claim.' };
for (const name of ['vite', 'playwright', '@solidjs/vite-plugin', '@solidjs/babel-plugin']) {
  evidence.toolchain[name] = JSON.parse(await readFile(resolve(root, 'node_modules', name, 'package.json'), 'utf8')).version;
}
let server;
try {
  server = await createServer({ configFile: false, root: prepared.host, cacheDir: resolve(prepared.host, 'vite-cache'),
    plugins: [solid({ compiler: 'babel' })], resolve: { dedupe: ['solid-js', '@solidjs/web', '@solidjs/signals'] },
    server: { host: args['--serve'] ? '0.0.0.0' : '127.0.0.1', port: args['--serve'] ? Number(args['--serve']) : 0,
      strictPort: true, fs: { allow: [prepared.host, prepared.packagePath, resolve(root, 'node_modules'), ...prepared.peers.map((p) => p.path)] } } });
  await server.listen();
  const url = server.resolvedUrls.local[0];
  evidence.browserResolvedImports = [];
  for (const entry of prepared.resolvedImports) {
    const result = await server.environments.client.pluginContainer.resolveId(`baseui-solid2/${entry.name}`, resolve(prepared.host, 'host.tsx'));
    const path = result?.id && await realpath(result.id.split('?')[0]);
    if (!path || !path.startsWith(`${prepared.packagePath}/`) || /\.[cm]?tsx?$/.test(path) || path.includes('/server/'))
      throw new Error(`Browser must resolve installed DOM artifact: ${entry.name} -> ${path}`);
    evidence.browserResolvedImports.push({ name: entry.name, path });
  }
  if (args['--serve']) {
    console.log(`MANUAL HOST ${url}?scenario=dialog&environment=default\nArtifact ${prepared.artifactSha256}\nServing does not count as qualification evidence. Stop with Ctrl+C.`);
    await new Promise((done) => { process.once('SIGINT', done); process.once('SIGTERM', done); });
  } else {
    for (const browserName of browsers) {
      let browser;
      try {
        browser = await ({ chromium, firefox, webkit })[browserName].launch({ headless: true });
        for (const scenario of scenarios) for (const environment of environments) {
          const row = { scenario: scenario.id, families: scenario.families, browser: browserName, browserVersion: browser.version(),
            environment, status: 'fail', snapshots: [], diagnostics: [], events: [], identity: [], screenshots: [] };
          const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, locale: 'en-US', timezoneId: 'UTC',
            reducedMotion: environment === 'reduced-motion' ? 'reduce' : 'no-preference',
            forcedColors: environment === 'forced-colors' ? 'active' : 'none' });
          const page = await context.newPage();
          page.setDefaultTimeout(6_000);
          await page.addInitScript(() => {
            window.__a11yInput = [];
            for (const type of ['keydown', 'keyup', 'click', 'pointerdown', 'pointerup']) {
              document.addEventListener(type, (event) => window.__a11yInput.push({ type, trusted: event.isTrusted,
                timeStamp: event.timeStamp, key: event.key ?? null, pointerType: event.pointerType ?? null,
                target: event.target instanceof Element ? event.target.getAttribute('data-testid') : null }), true);
            }
            window.__a11yIdentity = [];
          });
          page.on('pageerror', (error) => row.diagnostics.push({ type: 'pageerror', message: error.message }));
          page.on('console', (message) => { if (['error', 'warning'].includes(message.type())) row.diagnostics.push({ type: message.type(), message: message.text() }); });
          async function checkpoint(label) {
            await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
            const snapshot = await page.evaluate(() => {
              const nodes = [...document.querySelectorAll('[role], input, button, [aria-live], [data-testid]')];
              const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
              const violations = ids.filter((id, n) => ids.indexOf(id) !== n).map((id) => `Duplicate id ${id}`);
              for (const node of nodes) for (const name of ['aria-labelledby', 'aria-describedby', 'aria-activedescendant']) {
                for (const id of node.getAttribute(name)?.split(/\s+/).filter(Boolean) ?? []) {
                  if (!document.getElementById(id)) violations.push(`${name} references missing ${id}`);
                }
              }
              const active = document.activeElement, focus = active ? getComputedStyle(active) : null;
              const focusRect = active?.getBoundingClientRect();
              return { violations, media: { reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
                forcedColors: matchMedia('(forced-colors: active)').matches }, direction: document.documentElement.dir,
                layoutZoom: getComputedStyle(document.body).zoom, viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
                focus: { testid: active?.getAttribute('data-testid'), tag: active?.tagName, outlineStyle: focus?.outlineStyle, outlineWidth: focus?.outlineWidth,
                  inViewport: !!focusRect && focusRect.width > 0 && focusRect.height > 0 && focusRect.left >= 0 && focusRect.top >= 0 && focusRect.right <= innerWidth && focusRect.bottom <= innerHeight },
                panelTransition: document.querySelector('[data-testid="panel"]') ? getComputedStyle(document.querySelector('[data-testid="panel"]')).transitionDuration : null,
                controls: nodes.map((node) => { const r = node.getBoundingClientRect(), s = getComputedStyle(node);
                  return { tag: node.tagName, id: node.id, testid: node.getAttribute('data-testid'), role: node.getAttribute('role'),
                    attributes: Object.fromEntries([...node.attributes].filter((a) => a.name.startsWith('aria-') || ['disabled', 'readonly', 'required', 'tabindex'].includes(a.name)).map((a) => [a.name, a.value])),
                    text: node.textContent, width: r.width, height: r.height, opacity: s.opacity, display: s.display, visibility: s.visibility,
                    connected: node.isConnected, value: 'value' in node ? node.value : null,
                    selection: 'selectionStart' in node ? [node.selectionStart, node.selectionEnd] : null }; }) };
            });
            row.snapshots.push({ label, ...snapshot });
            if (snapshot.violations.length) throw new Error(snapshot.violations.join('; '));
            if (environment === 'reduced-motion' && !snapshot.media.reducedMotion) throw new Error('Reduced-motion emulation not active');
            if (environment === 'reduced-motion' && snapshot.panelTransition && snapshot.panelTransition !== '0s') throw new Error('Reduced-motion consumer transition still active');
            if (environment === 'forced-colors' && !snapshot.media.forcedColors) throw new Error('Forced-colors unavailable in this engine');
            if (environment === 'rtl' && snapshot.direction !== 'rtl') throw new Error('RTL not active');
            if (environment === 'layout-zoom-200' && Number(snapshot.layoutZoom) !== 2) throw new Error('200% layout zoom not active');
            if (snapshot.focus.tag !== 'BODY' && (snapshot.focus.outlineStyle === 'none' || parseFloat(snapshot.focus.outlineWidth) === 0)) throw new Error('Keyboard focus indicator missing');
            if (snapshot.focus.tag !== 'BODY' && !snapshot.focus.inViewport) throw new Error('Focused control is clipped/outside the viewport');
            const image = `${browserName}-${scenario.id}-${environment}-${label}.png`;
            await page.screenshot({ path: resolve(output, image), fullPage: true });
            row.screenshots.push(image);
          }
          try {
            await page.goto(`${url}?scenario=${scenario.id}&environment=${environment}`);
            await page.waitForFunction(() => window.__a11y?.ready);
            row.userAgent = await page.evaluate(() => navigator.userAgent);
            if (environment === 'layout-zoom-200') await page.evaluate(() => { document.body.style.zoom = '2'; });
            await runScenario({ page, scenario: scenario.id, environment, checkpoint, browser: browserName });
            row.events = await page.evaluate(() => window.__a11yInput);
            row.identity = await page.evaluate(() => window.__a11yIdentity);
            if (!row.events.some((event) => event.type === 'keydown') || row.events.some((event) => !event.trusted || event.timeStamp <= 0)) throw new Error('Trusted native input/timestamps missing');
            if (row.diagnostics.length) throw new Error('Unapproved runtime diagnostics');
            row.status = 'pass';
          } catch (error) {
            row.error = error.stack ?? String(error);
            try { row.events = await page.evaluate(() => window.__a11yInput); row.identity = await page.evaluate(() => window.__a11yIdentity); } catch {}
          } finally {
            try {
              await page.evaluate(() => window.__a11y?.dispose?.());
              await page.waitForFunction(() => document.getElementById('fixture')?.childElementCount === 0 &&
                !document.querySelector('[data-base-ui-portal], [data-base-ui-focus-guard]'));
              row.disposal = 'pass';
            } catch (error) { row.disposal = 'fail'; row.status = 'fail'; row.disposalError = String(error); }
            if (row.diagnostics.length) row.status = 'fail';
            await context.close();
          }
          evidence.results.push(row);
          console.log(`${row.status.toUpperCase()} ${browserName} ${scenario.id} ${environment}`);
        }
      } catch (error) {
        for (const scenario of scenarios) for (const environment of environments) {
          if (!evidence.results.some((row) => row.browser === browserName && row.scenario === scenario.id && row.environment === environment))
            evidence.results.push({ browser: browserName, browserVersion: browser?.version() ?? null, scenario: scenario.id, environment,
              status: 'blocked', error: `Engine/infrastructure unavailable: ${error.stack ?? error}` });
        }
      } finally { await browser?.close(); }
    }
  }
} catch (error) { evidence.infrastructureError = error.stack ?? String(error); }
finally {
  await server?.close();
  evidence.finalPackageSha256 = await treeHash(prepared.packagePath);
  evidence.finalFixtureSha256 = await fixtureHash();
  const finalInventory = await buildInventory();
  evidence.finalSourceDigest = finalInventory.sourceDigest;
  evidence.inputsStable = evidence.finalPackageSha256 === prepared.packageSha256 && evidence.finalFixtureSha256 === prepared.fixtureSha256 &&
    finalInventory.checkout.verified && finalInventory.sourceDigest === inventory.sourceDigest &&
    (!prepared.tarball || digest(await readFile(prepared.tarball)) === prepared.artifactSha256);
  let manual = [];
  if (args['--manual']) {
    try {
      manual = JSON.parse(await readFile(resolve(args['--manual']), 'utf8'));
      if (!Array.isArray(manual) || manual.some((row) => row.artifactSha256 !== prepared.artifactSha256)) throw new Error('Manual evidence must bind this frozen artifact');
    } catch (error) { evidence.manualError = String(error); manual = []; }
  }
  evidence.gate = gate(inventory, evidence.results, manual);
  evidence.automatedPassed = evidence.results.length === scenarios.length * browsers.length * environments.length && evidence.results.every((row) => row.status === 'pass');
  evidence.passed = evidence.inputsStable && !evidence.infrastructureError && !evidence.manualError && evidence.gate.passed;
  evidence.finished = new Date().toISOString();
  await writeFile(resolve(output, 'summary.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Evidence ${resolve(output, 'summary.json')}\nAutomated batch ${evidence.automatedPassed ? 'PASS' : 'INCOMPLETE/FAIL'}; full qualification ${evidence.passed ? 'PASS' : 'BLOCKED'}`);
  process.exitCode = evidence.passed ? 0 : 1;
}
