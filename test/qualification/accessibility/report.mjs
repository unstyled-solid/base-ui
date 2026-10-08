import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { inventory } from './inventory.mjs';
import { options, owned, cache, fixtureHash, treeHash } from './prepare.mjs';
import { gate } from './model.mjs';

const args = options(process.argv.slice(2), ['--summary', '--manual', '--output']);
const data = await inventory();
const summary = args['--summary'] ? JSON.parse(await readFile(resolve(args['--summary']), 'utf8')) : null;
const manual = args['--manual'] ? JSON.parse(await readFile(resolve(args['--manual']), 'utf8')) : [];
const failures = [];
if (!data.checkout.verified) failures.push('Canonical checkout SHA/cleanliness not verified');
if (summary) {
  if (summary.sourceDigest !== data.sourceDigest) failures.push('Source inventory changed since execution');
  if (summary.fixtureSha256 !== await fixtureHash()) failures.push('Fixtures changed since execution');
  if (!summary.inputsStable) failures.push('Execution inputs were not stable');
  if (summary.artifact?.packageSha256 !== await treeHash(summary.artifact?.packagePath)) failures.push('Installed artifact changed');
  for (const row of summary.results ?? []) if (row.status === 'pass' && (!row.browserVersion || !row.userAgent || row.disposal !== 'pass' || row.diagnostics?.length))
    failures.push(`Invalid automated pass ${row.browser}:${row.scenario}:${row.environment}`);
}
if (!Array.isArray(manual)) throw new Error('Manual input must be an array');
if (manual.some((row) => !summary || row.artifactSha256 !== summary.artifact.artifactSha256)) failures.push('Manual evidence does not bind the executed artifact');
const result = gate(data, failures.length ? [] : summary?.results ?? [], failures.length ? [] : manual);
const report = { sourceDigest: data.sourceDigest, inventory: data.accounting, familyCount: data.families.length,
  automatedExecution: summary ? 'recorded' : 'unexecuted', artifact: summary?.artifact ?? null,
  failures, ...result, passed: result.passed && failures.length === 0 };
const output = owned(resolve(args['--output'] ?? resolve(cache, 'report.json')));
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ passed: report.passed, families: report.familyCount, sourceBlockers: report.sourceBlockers,
  matrixBlockers: report.matrixBlockers, manualBlocked: report.manual.filter((r) => r.status !== 'pass').length,
  automatedUnexecuted: report.automated.filter((r) => r.status === 'unexecuted').length, failures, output }, null, 2));
process.exitCode = report.passed ? 0 : 1;
