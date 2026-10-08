import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import solid from '@solidjs/vite-plugin';
import { chromium, firefox, webkit } from 'playwright';
import { sourceSha, verifiedSource } from '../react-oracle/source.mjs';
import { scenarios } from './scenarios.mjs';
import { observe, differences } from './observe.mjs';
import { fingerprint } from './fingerprint.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const directory = resolve(fileURLToPath(new URL('./', import.meta.url)));
const oracleDirectory = resolve(fileURLToPath(new URL('../react-oracle/', import.meta.url)));
const args = process.argv.slice(2).filter((arg) => arg !== '--no-watch');
let positionalFilter;
function option(name, fallback) {
  const index = args.indexOf(name);
  if (index < 0) return fallback;
  if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${name} needs a value`);
  return args[index + 1];
}
for (let i = 0; i < args.length; i++) {
  if (['--browsers', '--filter', '--output'].includes(args[i])) { i++; continue; }
  if (!args[i].startsWith('--') && positionalFilter === undefined) { positionalFilter = args[i]; continue; }
  if (args[i] !== '--solid-only') throw new Error(`Unknown argument ${args[i]}`);
}
const browsers = option('--browsers', 'chromium,firefox,webkit').split(',');
const engines = { chromium, firefox, webkit };
if (browsers.some((browser) => !engines[browser])) throw new Error('Browsers must be chromium,firefox,webkit');
if (positionalFilter !== undefined && args.includes('--filter')) throw new Error('Use either a positional filter or --filter');
const filter = option('--filter', positionalFilter ?? '').toLowerCase();
const selected = scenarios.filter((scenario) => scenario.id.includes(filter));
if (!selected.length) throw new Error(`No qualification scenario matches ${filter}`);
const solidOnly = args.includes('--solid-only');
const checkout = solidOnly ? null : verifiedSource(root);
const output = resolve(directory, option('--output', '.cache/latest'));
if (!output.startsWith(`${directory}/`) && output !== directory) throw new Error('Evidence output must remain under test/qualification/browser');
await mkdir(output, { recursive: true });

const servers = [];
const inputDirectories = ['packages/solid/src', 'test/qualification/browser', 'test/qualification/react-oracle'];
const inputSha256 = await fingerprint(root, inputDirectories);
const packageVersion = async (path) => JSON.parse(await readFile(resolve(path, 'package.json'), 'utf8')).version;
const evidence = { sourceSha, sourceCheckout: checkout?.path ?? null, mode: solidOnly ? 'solid-only (no React baseline)' : 'independent-react-solid',
  node: process.version, command: process.argv, inputSha256,
  toolchain: {
    solid: await packageVersion(resolve(root, 'node_modules/solid-js')),
    solidWeb: await packageVersion(resolve(root, 'node_modules/@solidjs/web')),
    solidCompiler: await packageVersion(resolve(root, 'node_modules/@solidjs/compiler')),
    solidVitePlugin: await packageVersion(resolve(root, 'node_modules/@solidjs/vite-plugin')),
    vite: await packageVersion(resolve(root, 'node_modules/vite')),
    playwright: await packageVersion(resolve(root, 'node_modules/playwright')),
    ...(checkout ? { react: await packageVersion(resolve(checkout.path, 'node_modules/react')),
      reactDom: await packageVersion(resolve(checkout.path, 'node_modules/react-dom')),
      reactVite: await packageVersion(resolve(checkout.path, 'node_modules/vite')) } : {}),
  }, started: new Date().toISOString(), results: [] };
let failed = false;
try {
  const solidServer = await createServer({
    configFile: false, root: directory, cacheDir: resolve(directory, '.cache/vite'),
    plugins: [solid({ compiler: 'babel', ssr: true, solid: { hydratable: true } })],
    server: { host: '127.0.0.1', port: 0, fs: { allow: [root] } },
  });
  servers.push(solidServer);
  await solidServer.listen();
  const hosts = [{ name: 'solid', url: solidServer.resolvedUrls.local[0] }];
  if (checkout) {
    const upstreamRequire = createRequire(resolve(checkout.path, 'package.json'));
    const { createServer: createReactServer } = await import(pathToFileURL(checkout.vite).href);
    const { default: react } = await import(pathToFileURL(upstreamRequire.resolve('@vitejs/plugin-react')).href);
    const reactServer = await createReactServer({
      configFile: false, root: oracleDirectory, cacheDir: resolve(oracleDirectory, '.cache/vite'),
      plugins: [react(), {
        name: 'qualification-identical-layout',
        configureServer(server) {
          server.middlewares.use('/fixture.css', async (_request, response) => {
            response.setHeader('Content-Type', 'text/css');
            response.end(await readFile(resolve(directory, 'fixture.css')));
          });
        },
      }],
      resolve: { alias: [
        { find: /^@base-ui\/react(?=\/|$)/, replacement: resolve(checkout.path, 'packages/react/src') },
        { find: /^@base-ui\/utils(?=\/|$)/, replacement: resolve(checkout.path, 'packages/utils/src') },
        { find: /^react-dom(?=\/|$)/, replacement: resolve(checkout.path, 'node_modules/react-dom') },
        { find: /^react(?=\/|$)/, replacement: resolve(checkout.path, 'node_modules/react') },
      ] },
      oxc: { jsx: { runtime: 'automatic', importSource: 'react' } },
      server: { host: '127.0.0.1', port: 0, fs: { allow: [root, checkout.path] } },
    });
    servers.push(reactServer);
    await reactServer.listen();
    hosts.unshift({ name: 'react', url: reactServer.resolvedUrls.local[0] });
  }
  for (const name of browsers) {
    let browser;
    try {
      browser = await engines[name].launch({ headless: true });
      for (const scenario of selected) {
        if (scenario.browsers && !scenario.browsers.includes(name)) {
          evidence.results.push({ browser: name, scenario: scenario.id, status: 'source-platform-excluded', reason: scenario.restriction });
          console.log(`SOURCE-EXCLUDED ${name} ${scenario.id}: ${scenario.restriction}`);
          continue;
        }
        const result = { browser: name, browserVersion: browser.version(), scenario: scenario.id,
          source: scenario.source, cases: scenario.cases, hosts: {}, differences: [] };
        for (const host of hosts) {
          const context = await browser.newContext({ viewport: { width: 1024, height: 768 }, locale: 'en-US', timezoneId: 'UTC' });
          const page = await context.newPage();
          page.setDefaultTimeout(5_000);
          const diagnostics = [];
          const snapshots = [];
          await page.addInitScript(() => {
            window.__qualificationNativeEvents = [];
            for (const type of ['pointerdown', 'pointerup', 'keydown', 'keyup', 'click']) {
              document.addEventListener(type, (event) => window.__qualificationNativeEvents.push({
                type: event.type, timeStamp: event.timeStamp, trusted: event.isTrusted,
                key: 'key' in event ? event.key : undefined,
                pointerType: 'pointerType' in event ? event.pointerType : undefined,
                target: event.target instanceof Element ? event.target.getAttribute('data-testid') : null,
                insidePopup: event.target instanceof Node && Boolean(document.querySelector('[data-testid="popup"]')?.contains(event.target)),
              }), { capture: true, passive: true });
            }
          });
          page.on('pageerror', (error) => diagnostics.push(error.message));
          page.on('console', (message) => {
            if (['error', 'warning'].includes(message.type())) diagnostics.push(`${message.type()}: ${message.text()}`);
          });
          async function checkpoint(label) {
            // Drain actual measurement frames and Web Animations promises, never wall-clock sleeps.
            await page.evaluate(async () => {
              await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
            });
            await page.waitForFunction(() => document.getAnimations().every((animation) => ['finished', 'idle'].includes(animation.playState)));
            await page.waitForFunction(() => !document.querySelector('[data-starting-style], [data-ending-style]'));
            snapshots.push({ label, observation: await page.evaluate(observe) });
          }
          let error;
          let nativeEvents = [];
          try {
            await page.mouse.move(900, 700);
            await page.goto(`${host.url}?scenario=${scenario.id}`);
            await page.waitForFunction(() => window.__qualification?.ready);
            await checkpoint('initial');
            await scenario.run({ page, checkpoint, id: scenario.id });
            nativeEvents = await page.evaluate(() => window.__qualificationNativeEvents);
            if (!nativeEvents.length || nativeEvents.some((event) => event.timeStamp <= 0 || !Number.isFinite(event.timeStamp)
              || (event.type !== 'click' && !event.trusted))) throw new Error('Native input must retain positive timestamps and trusted keyboard/pointer dispatch');
          } catch (cause) {
            error = cause.stack ?? String(cause);
            // Keep the real failed state as evidence rather than discarding the host's observations.
            try { snapshots.push({ label: 'failure', observation: await page.evaluate(observe) }); } catch {}
            try { nativeEvents = await page.evaluate(() => window.__qualificationNativeEvents); } catch {}
          } finally {
            try {
              await page.evaluate(() => window.__qualification?.dispose?.());
              await page.waitForFunction(() => document.querySelector('#fixture')?.children.length === 0
                && !document.querySelector('[data-base-ui-portal], [data-base-ui-focus-guard]'));
              await checkpoint('disposed');
            } catch (cause) { error ??= `Disposal: ${cause.message}`; }
            await context.close();
          }
          result.hosts[host.name] = { passed: !error && diagnostics.length === 0, error, diagnostics, nativeEvents, snapshots };
        }
        if (checkout) {
          result.differences = differences(result.hosts.react.snapshots, result.hosts.solid.snapshots);
        }
        result.passed = Object.values(result.hosts).every((host) => host.passed) && result.differences.length === 0;
        failed ||= !result.passed;
        const file = `${name}-${scenario.id}.json`;
        await writeFile(resolve(output, file), `${JSON.stringify(result, null, 2)}\n`);
        evidence.results.push({ browser: name, browserVersion: browser.version(), scenario: scenario.id,
          passed: result.passed, react: result.hosts.react?.passed ?? null, solid: result.hosts.solid.passed,
          differenceCount: result.differences.length, evidence: file });
        console.log(`${result.passed ? 'PASS' : 'FAIL'} ${name} ${scenario.id}: React=${result.hosts.react?.passed ?? 'absent'} Solid=${result.hosts.solid.passed} observable differences=${result.differences.length}`);
        if (!result.passed) {
          for (const [host, data] of Object.entries(result.hosts)) {
            if (data.error) console.log(`  ${host}: ${data.error.split('\n')[0]}`);
            if (data.diagnostics.length) console.log(`  ${host} diagnostics: ${data.diagnostics[0]}`);
          }
          const preview = (value) => {
            const serialized = JSON.stringify(value);
            return serialized && serialized.length > 200 ? `${serialized.slice(0, 200)}… (full value in evidence)` : serialized;
          };
          for (const difference of result.differences.slice(0, 3)) console.log(`  ${difference.path}: React=${preview(difference.react)} Solid=${preview(difference.solid)}`);
        }
      }
    } catch (cause) {
      failed = true;
      evidence.results.push({ browser: name, passed: false, infrastructureError: cause.stack ?? String(cause) });
      console.error(`${name}: ${cause.message}`);
    } finally { await browser?.close(); }
  }
} catch (cause) {
  failed = true;
  evidence.infrastructureError = cause.stack ?? String(cause);
  console.error(cause.message);
} finally {
  await Promise.all(servers.map((server) => server.close()));
  evidence.finalInputSha256 = await fingerprint(root, inputDirectories);
  evidence.inputsChangedDuringRun = evidence.inputSha256 !== evidence.finalInputSha256;
  if (checkout) {
    try { verifiedSource(root); }
    catch (cause) { failed = true; evidence.infrastructureError = cause.message; }
  }
  evidence.finished = new Date().toISOString();
  evidence.passed = !failed && !evidence.inputsChangedDuringRun;
  failed ||= evidence.inputsChangedDuringRun;
  evidence.finalGate = 'OPEN: representative scenarios only; all queued source cases remain required';
  await writeFile(resolve(output, 'summary.json'), `${JSON.stringify(evidence, null, 2)}\n`);
  console.log(`Evidence: ${resolve(output, 'summary.json')}`);
  console.log(evidence.finalGate);
}
process.exitCode = failed ? 1 : 0;
