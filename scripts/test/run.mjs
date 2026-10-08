import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { runIsolatedBrowserFiles } from './browser-batch.mjs';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../', import.meta.url));
const [command, ...raw] = process.argv.slice(2);
const args = raw.filter((arg) => arg !== '--no-watch');
const vitest = join(dirname(require.resolve('vitest/package.json')), 'vitest.mjs');
let artifactDirectory;
function run(entry, extra = [], env = {}) {
  // Pinned upstream test:_unit launches with TZ=UTC, including fixture compilation.
  const result = spawnSync(process.execPath, [entry, ...extra], { cwd: root, stdio: 'inherit', env: { ...process.env, TZ: 'UTC', ...env } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
function tests(target) {
  const native = target === 'chromium-native';
  const browser = target === 'browsers' || target === 'chromium' || native;
  // CLI reporter selection replaces config reporters. Keep crash attribution
  // alongside the requested reporter (including the parent's --reporter=dot).
  const reporters = args.some((arg) => arg === '--reporter' || arg.startsWith('--reporter='))
    ? ['--reporter', './scripts/test/worker-reporter.ts'] : [];
  run(vitest, ['run', '--config', browser ? 'vitest.browser.config.ts' : 'vitest.config.ts', ...args, ...reporters], {
    HARNESS_TARGET: browser ? 'browser' : target,
    ...(target === 'chromium' || native ? { HARNESS_BROWSERS: 'chromium' } : {}),
    HARNESS_NATIVE_DOCUMENT: native ? '1' : '',
    HARNESS_CACHE_DIR: join(artifactDirectory, 'vite'),
    HARNESS_SSR_ARTIFACT: join(artifactDirectory, 'html.json'),
  });
}
function types() { run(require.resolve('typescript/bin/tsc'), ['--noEmit', '-p', 'test/contracts/tsconfig.json', ...args]); }
function prepareSSR() {
  const parent = join(root, 'test/ssr-harness/.generated');
  mkdirSync(parent, { recursive: true });
  artifactDirectory = mkdtempSync(join(parent, 'suite-'));
  run(join(root, 'scripts/test/ssr-fixture.mjs'), [], { HARNESS_SSR_ARTIFACT: join(artifactDirectory, 'html.json') });
}
// Exit handlers cover failed subprocesses too; another runner never loses its artifact/cache.
process.on('exit', () => { if (artifactDirectory) rmSync(artifactDirectory, { recursive: true, force: true }); });
switch (command) {
  case 'types': types(); break;
  case 'jsdom': prepareSSR(); tests('jsdom'); break;
  case 'ssr': prepareSSR(); tests('ssr'); break;
  case 'browsers': case 'chromium': case 'chromium-native':
    if (process.env.HARNESS_BATCH_FILE) { prepareSSR(); tests(command); }
    else process.exitCode = runIsolatedBrowserFiles(command, args);
    break;
  case 'contracts':
    types();
    run(join(root, 'packages/solid/src/internals/contracts/proof/identity.mjs'));
    run(join(root, 'packages/solid/src/internals/contracts/proof/compiler.mjs'));
    prepareSSR();
    tests('jsdom');
    tests('ssr');
    run(join(root, 'scripts/test/negative-probes.mjs'));
    break;
  default:
    console.error('Usage: node scripts/test/run.mjs jsdom|ssr|types|contracts|browsers|chromium|chromium-native <args>');
    process.exitCode = 1;
}
