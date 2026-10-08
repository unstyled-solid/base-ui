import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, directory, files, inventory, digest } from './inventory.mjs';
import { readPrepared, owned } from './prepare.mjs';

export async function check(preparedPath) {
  const mjs = (await files(directory)).filter((p) => p.endsWith('.mjs') && !p.includes('/.cache/'));
  const stages = mjs.map((p) => ['syntax', ['node', '--check', p]]);
  stages.push(['unit', ['node', '--test', resolve(directory, 'model.test.mjs')]]);
  let prepared;
  if (preparedPath) prepared = await readPrepared(preparedPath);
  stages.push(['fixture-types', ['node', resolve(root, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p',
    resolve(prepared?.host ?? directory, 'tsconfig.json')]]);
  for (const [name, command] of stages) {
    const result = spawnSync('rtk', ['proxy', ...command], { cwd: root, encoding: 'utf8' });
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
    if (result.status !== 0) throw new Error(`${name} failed (${result.status}); runtime forbidden`);
  }
  const data = await inventory();
  if (data.parseErrors.length) throw new Error(`Source inventory syntax failures: ${JSON.stringify(data.parseErrors)}`);
  if (!data.checkout.verified) throw new Error(`Canonical checkout mismatch or tracked changes: ${JSON.stringify(data.checkout)}`);
  console.log(`CHECK PASS: ${data.families.length} families, ${data.cases.length} canonical registrations; release gate remains blocked.`);
  if (prepared) await writeFile(owned(resolve(prepared.host, 'checked.json')), JSON.stringify({ artifactSha256: prepared.artifactSha256,
    fixtureSha256: prepared.fixtureSha256, sourceDigest: data.sourceDigest, hostDigest: digest(await readFile(resolve(prepared.host, 'host.tsx'))),
    checked: new Date().toISOString() }));
  return data;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--prepared')) throw new Error('Usage: check.mjs [--prepared path]');
  await check(args[1]);
}
