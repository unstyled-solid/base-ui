import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';
import { sourceSha, verifiedSource } from './source.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const checkout = verifiedSource(root);
const node = process.env.QUALIFICATION_REACT_NODE;
if (!node) throw new Error('Set QUALIFICATION_REACT_NODE to the isolated compatible Node 24 executable');
const versions = spawnSync('rtk', ['proxy', node, '-p', 'process.version'], { encoding: 'utf8' });
if (versions.status !== 0 || !/^v24\./.test(versions.stdout.trim())) throw new Error('Original frozen upstream runner requires isolated Node 24');
const args = process.argv.slice(2).filter((arg) => arg !== '--no-watch');
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
for (let i = 0; i < args.length; i++) {
  if (['--browsers', '--filter'].includes(args[i])) { i++; continue; }
  throw new Error(`Unknown argument ${args[i]}`);
}
const browsers = option('--browsers', 'chromium,firefox,webkit').split(',');
if (browsers.some((name) => !['chromium', 'firefox', 'webkit'].includes(name))) throw new Error('Unsupported browser');
// Original test bodies/assertions, not the independent protocol or a generated inventory.
const selections = [
  ['button', 'button/Button.test.tsx', 'custom element: applies button semantics|native button: prevents interactions but remains focusable|allows hover handlers while blocking activation'],
  ['toggle', 'toggle/Toggle.test.tsx', 'pressed state|event is canceled|is called when the pressed state changes'],
  ['form', 'form/Form.test.tsx', 'does not submit if there are errors|blocks submit and focuses the first invalid field across custom and native validation|prop: onFormSubmit'],
  ['dialog', 'dialog/root/DialogRoot.test.tsx', 'pressed Esc while|detects clicks on user backdrop|cancel\\(\\) prevents opening while uncontrolled|ignores a native click whose pointerdown opened'],
  ['select', 'select/root/SelectRoot.test.tsx', 'is not called twice on select|onOpenChange cancel\\(\\) prevents opening'],
  ['combobox', 'combobox/root/ComboboxRoot.test.tsx', 'opens, navigates with ArrowDown, and Enter selects|Escape closes the popup without committing when nothing highlighted'],
  ['tooltip', 'tooltip/root/TooltipRoot.test.tsx', 'should open when the trigger is hovered|should close when the trigger is unhovered|should open when the trigger is focused|should close when the trigger is blurred'],
].filter(([family]) => family.includes(option('--filter', '')));
if (!selections.length) throw new Error('No original source selection matches');
let failed = false;
const output = fileURLToPath(new URL('./.cache/upstream/', import.meta.url));
await mkdir(output, { recursive: true });
const evidence = { sourceSha, checkout: checkout.path, node: versions.stdout.trim(), command: process.argv, results: [] };
for (const browser of browsers) for (const [family, file, pattern] of selections) {
  console.log(`Original React ${browser} ${family} @ ${checkout.path}`);
  const result = spawnSync('rtk', ['proxy', 'env', `VITEST_ENV=${browser}`, 'TZ=UTC', node,
    resolve(checkout.path, 'node_modules/vitest/vitest.mjs'), 'run', '--project', '@base-ui/react',
    `packages/react/src/${file}`, '--testNamePattern', pattern], {
    cwd: checkout.path, encoding: 'utf8', timeout: 120_000,
  });
  process.stdout.write(result.stdout ?? '');
  process.stderr.write(result.stderr ?? '');
  if (result.error) console.error(result.error.message);
  const plain = (result.stdout ?? '').replace(/\u001b\[[0-9;]*m/g, '');
  const passed = Number(plain.match(/Tests\s+(\d+) passed/)?.[1] ?? 0);
  // Vitest can exit 0 for an unmatched name filter. Such a run is not baseline evidence.
  const ok = result.status === 0 && passed > 0;
  failed ||= !ok;
  const log = `${browser}-${family}.log`;
  await writeFile(resolve(output, log), `${result.stdout ?? ''}${result.stderr ?? ''}`);
  evidence.results.push({ browser, family, file, pattern, passed, success: ok, exitCode: result.status, error: result.error?.message, log });
}
verifiedSource(root);
evidence.success = !failed;
await writeFile(resolve(output, 'summary.json'), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Original React evidence: ${resolve(output, 'summary.json')}`);
process.exitCode = failed ? 1 : 0;
