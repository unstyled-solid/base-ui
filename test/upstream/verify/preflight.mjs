import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { verifierWorkerProgram } from './fixtures.mjs';

const files = ['scripts/upstream/cli.mjs', ...[
  'scripts/upstream/git', 'scripts/upstream/verify', 'test/upstream/git', 'test/upstream/verify',
].flatMap((directory) => readdirSync(directory).filter((name) => name.endsWith('.mjs')).map((name) => `${directory}/${name}`))];
function run(args, input) {
  const result = spawnSync('rtk', ['proxy', process.execPath, ...args], { encoding: 'utf8', input });
  if (result.error || result.signal || result.status !== 0) {
    process.stderr.write(result.stderr || String(result.error)); process.exit(1);
  }
}
for (const file of files) run(['--check', file]);
run(['--check', '--input-type=module'], verifierWorkerProgram({ root: '/fixture',
  core: new URL('../../../scripts/upstream/verify/core.mjs', import.meta.url).href,
  toolchain: { node: process.version, pnpm: 'fixture-only', solid: '2.0.0-rc.13' },
  issues: [{ id: 'fixture-owner', status: 'closed', metadata: {} }], evidencePath: 'proof/evidence.json', evidenceHash: 'a'.repeat(64) }));
run(['node_modules/typescript/bin/tsc', '--noEmit', '--allowJs', '--checkJs', 'false', '--strict',
  '--module', 'nodenext', '--moduleResolution', 'nodenext', '--target', 'es2024',
  'test/upstream/verify/interfaces.types.mts']);
process.stdout.write(`${JSON.stringify({ syntaxFiles: files.length, generatedWorkerSyntax: 'passed', typedCommandConsumers: 'passed' })}\n`);
