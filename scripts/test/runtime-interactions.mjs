import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const evidence = path.join(root, 'docs/generated/browser/runtime-gate');
await fs.mkdir(evidence, { recursive: true });
const results = [];
async function run(name, args, env = {}) {
  const child = spawn('rtk', args, { cwd: root, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });
  const log = path.join(evidence, `${name}.log`);
  await fs.writeFile(log, output);
  const summary = output.split('\n').filter(line => /HARNESS_FINAL|Test Files|Tests |PASS:|Demo catalog:|Evidence:/.test(line));
  const result = { name, passed: code === 0, code, command: `rtk ${args.join(' ')}`, log, summary };
  results.push(result);
  console.log(JSON.stringify(result));
  return result;
}

// One coordinated gate: retain every failure and continue to gather the complete
// correction set. No diagnostic filters, runtime configuration changes or retries.
const types = await run('types', ['pnpm', 'typescript']);
if (!types.passed) {
  await fs.writeFile(path.join(evidence, 'summary.json'), JSON.stringify(results, null, 2) + '\n');
  console.error('Typecheck failed; runtime gates were not started. See types.log.');
  process.exit(1);
}
await run('catalog', ['pnpm', 'docs:generate:demos']);
await run('docs', ['pnpm', 'docs:check']);
await run('jsdom', ['pnpm', 'test:jsdom', 'merge-props', 'getStateAttributesProps', 'createRenderElement', 'useButton',
  'number-field', 'tabs', 'accordion', 'collapsible', 'radio', 'tooltip', 'popover', 'menu', 'select', 'slider',
  'otp-field', 'avatar', 'combobox', 'createPopup.test', '--no-watch']);
await run('ssr', ['pnpm', 'test:ssr', 'createRenderElement', 'NumberField', 'Tabs', 'Tooltip', 'Avatar', 'Accordion',
  'Collapsible', 'Select', 'Slider', 'OTPField', 'Combobox', '--no-watch']);
await run('chromium', ['pnpm', 'test:chromium', 'createRenderElement', 'Events.test', 'getStateAttributesProps',
  'NumberField.reactivity', 'RadioIndicator.test', 'RadioGroup.field', 'SelectField.test', 'TabsActivation.browser',
  'createPopup.test', '--no-watch']);

let server;
let serverOutput = '';
try {
  let origin = process.env.DOCS_TEST_URL ?? 'http://127.0.0.1:5173';
  const responds = async () => {
    try { return (await fetch(`${origin}/solid/components/number-field`, { signal: AbortSignal.timeout(2000) })).ok; }
    catch { return false; }
  };
  if (!await responds()) {
    if (process.env.DOCS_TEST_URL) throw new Error(`Explicit DOCS_TEST_URL does not respond: ${origin}`);
    origin = 'http://127.0.0.1:5187';
    server = spawn('rtk', ['pnpm', 'exec', 'vite', '--config', 'docs/vite.config.ts', '--host', '127.0.0.1', '--port', '5187', '--strictPort'], {
      cwd: root, detached: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    server.stdout.on('data', chunk => { serverOutput += chunk; });
    server.stderr.on('data', chunk => { serverOutput += chunk; });
    const started = Date.now();
    while (!await responds()) {
      if (server.exitCode !== null || Date.now() - started > 30000) throw new Error(`Owned docs server did not start: ${serverOutput}`);
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  await run('interactions', ['pnpm', 'docs:test:interactions'], { DOCS_TEST_URL: origin });
} catch (error) {
  results.push({ name: 'interactions', passed: false, error: String(error) });
} finally {
  if (server) {
    process.kill(-server.pid, 'SIGTERM');
    await new Promise(resolve => server.once('close', resolve));
    await fs.writeFile(path.join(evidence, 'server.log'), serverOutput);
  }
}
await fs.writeFile(path.join(evidence, 'summary.json'), JSON.stringify(results, null, 2) + '\n');
console.log(`Integrated gate: ${results.filter(result => result.passed).length}/${results.length} stages passed. Evidence: ${evidence}`);
if (results.some(result => !result.passed)) process.exitCode = 1;
