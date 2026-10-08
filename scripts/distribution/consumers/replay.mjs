import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { temporaryRoot, inside, sha256, inspectArchive } from './policy.mjs';
import { command, isolatedEnvironment } from './process.mjs';
import { parseReplayArgs, assertPriorReport, priorEvidence, verifyRetainedConsumer, failureCensus } from './replay-evidence.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const templates = path.join(root, 'test/distribution/consumers/templates');
const names = ['runtime-accounting.mjs', 'fixture-types.mjs', 'bundle.mjs', 'browser.mjs', 'client.tsx', 'server.tsx', 'app.tsx'];
export async function replay(argv) {
  const args = parseReplayArgs(argv), approved = await fs.realpath(temporaryRoot);
  const parent = await fs.realpath(path.dirname(args.output));
  assert(inside(approved, parent) && !inside(root, parent), 'Replay output must be external under approved root');
  const consumerRoot = await fs.realpath(args.consumer);
  assert(inside(approved, consumerRoot) && !inside(root, consumerRoot), 'Replay consumer must be external under approved root');
  assert(!inside(consumerRoot, args.output), 'Replay evidence output must be separate from retained consumer');
  await fs.mkdir(args.output); // unique output; never overwrite old evidence.
  const output = await fs.realpath(args.output);
  assert(!inside(consumerRoot, output), 'Replay evidence output must be separate from retained consumer');
  const result = { schemaVersion: 1, owner: 'bsolid-dist-pack', mode: 'consumer-replay', status: 'blocked',
    started: new Date().toISOString(), archiveSha256: null, output, consumerRoot, masks: args.masks, selection: args.conditions,
    fullGateStatus: 'blocked', inheritedResults: 'validated provenance only; not rerun', stages: {}, commands: [], rows: [],
    blockers: [{ owner: 'coordinator', reason: 'Replay is scoped condition execution; original full qualification evidence is not supplied by replay' }],
    runtimeProvenance: 'byte-verified retained stock registry RC13; workspace patch absent' };
  const persist = () => fs.writeFile(path.join(output, 'report.json'), JSON.stringify(result, null, 2));
  let session;
  async function execute(label, parameters, { strict = false } = {}) {
    const env = isolatedEnvironment(consumerRoot); env.TMPDIR = session;
    const record = await command(session, path.join(output, 'logs'), label, process.execPath, parameters, { env, allowFailure: true });
    result.commands.push(record); await persist();
    assert(record.code === 0 && record.signal === null && !record.timedOut && !record.spawnError, `Replay ${label} failed; full diagnostics ${record.stderr}`);
    if (strict) for (const file of [record.stdout, record.stderr]) assert.equal((await fs.readFile(file)).length, 0, `Replay ${label} emitted unexpected diagnostics: ${file}`);
    return record;
  }
  try {
    const sourceBytes = await fs.readFile(args.report), original = JSON.parse(sourceBytes);
    assert.equal((await fs.lstat(args.tarball)).isFile(), true, 'Replay tarball must be a regular file');
    const archive = inspectArchive(await fs.readFile(args.tarball));
    result.archiveSha256 = archive.sha256;
    assertPriorReport(original, archive);
    const provenance = await priorEvidence(original, args.report, approved);
    const retained = await verifyRetainedConsumer(original, archive, consumerRoot, provenance.sourceOutput, approved);
    result.kind = retained.kind;
    result.sourceReport = { path: await fs.realpath(args.report), sha256: sha256(sourceBytes), originalStatus: original.status };
    result.prerequisiteProvenance = { artifacts: provenance.artifacts, selectedConsumer: retained.proof, allFourPriorStages: Object.fromEntries(Object.entries(original.consumers).map(([kind, consumer]) => [kind, {
      types: consumer.stages.types, resolution: consumer.stages.resolution, temporal: consumer.stages.temporal.status, ssr: consumer.stages.ssr.status }])) };
    result.stages.provenance = { status: 'passed' };
    const census = await failureCensus(original, provenance.sourceOutput);
    await fs.writeFile(path.join(output, 'prior-failure-census.json'), JSON.stringify(census, null, 2));
    result.priorFailureCounts = census.causeCounts;
    // Freeze before any build: a fresh exclusive child directory inherits only
    // the verified consumer's independent node_modules through ordinary lookup.
    session = await fs.mkdtemp(path.join(consumerRoot, 'packed-browser-replay-'));
    result.session = session;
    result.fixtureHashes = {};
    for (const name of names) {
      const bytes = await fs.readFile(path.join(templates, name));
      result.fixtureHashes[name] = sha256(bytes);
      if (name === 'app.tsx') assert.equal(sha256(bytes), original.fixtureHashes[name], 'SSR App changed: inherited SSR cannot be reused');
      await fs.writeFile(path.join(session, name), bytes.toString().replaceAll('baseui-solid2', retained.input.name));
    }
    for (const name of ['ssr-result.json', 'resolution-0.json']) await fs.copyFile(path.join(consumerRoot, name), path.join(session, name));
    const input = { ...retained.input, consumerRoot, replayArchiveSha256: archive.sha256, sourceReportSha256: sha256(sourceBytes) };
    await fs.writeFile(path.join(session, 'input.json'), JSON.stringify(input, null, 2));
    await fs.writeFile(path.join(output, 'frozen-fixtures.json'), JSON.stringify({ fixtureHashes: result.fixtureHashes, session, sourceReportSha256: sha256(sourceBytes) }, null, 2));
    await persist();
    // New fixtures must typecheck before any runtime compilation. Previously
    // passing full package types/resolution are inherited, not replayed 256 times.
    await execute('corrected-fixture-types', ['fixture-types.mjs'], { strict: true });
    result.stages['fixture-types'] = { status: 'passed', modes: ['Bundler', 'NodeNext'], strict: true, skipLibCheck: false };
    for (const mask of args.masks) {
      const worker = input.conditionSets[mask].includes('worker');
      const row = { mask, conditions: input.conditionSets[mask], lane: worker ? 'worker-ssr' : 'browser-hydration', build: 'pending', execution: 'pending' };
      result.rows.push(row);
      try {
        await execute(`${worker ? 'worker-server' : 'client'}-build-${mask}`, ['bundle.mjs', worker ? 'server' : 'client', String(mask)]);
        row.build = 'passed';
        await execute(`${worker ? 'worker-ssr' : 'browser'}-${mask}`, worker
          ? [...input.conditionSets[mask].map(condition => `--conditions=${condition}`), 'bundles/server/server.mjs']
          : ['browser.mjs', String(mask)], { strict: worker });
        row.execution = 'passed';
      } catch (error) {
        if (row.build !== 'passed') { row.build = 'failed'; row.execution = 'blocked'; }
        else row.execution = 'failed';
        row.failure = { message: error.message, stack: error.stack };
      } finally { await persist(); }
    }
    // Revalidate immutable archive, installed library and cached stock runtime
    // bytes after the complete bounded matrix. No old report or template is edited.
    assert.equal(sha256(await fs.readFile(args.tarball)), archive.sha256, 'Replay archive changed');
    assert.equal(sha256(await fs.readFile(args.report)), result.sourceReport.sha256, 'Original report changed during replay');
    await verifyRetainedConsumer(original, archive, consumerRoot, provenance.sourceOutput, approved);
    result.stages.immutable = { status: 'passed' };
    result.replayStatus = result.rows.every(row => row.build === 'passed' && row.execution === 'passed') ? 'passed' : 'failed';
    result.stages['condition-matrix'] = { status: result.replayStatus, rows: result.rows.length, requiredFullRows: 16, completeMatrix: args.masks.length === 16 };
  } catch (error) {
    result.replayStatus = 'failed';
    result.blockers.push({ owner: 'consumer-replay', message: error.message, stack: error.stack });
  } finally {
    if (session) {
      const evidence = path.join(output, 'artifacts'); await fs.mkdir(evidence);
      for (const file of await fs.readdir(session)) {
        if (/\.(?:json|mjs|tsx)$/.test(file)) await fs.copyFile(path.join(session, file), path.join(evidence, file));
      }
      await fs.cp(path.join(session, 'bundles'), path.join(evidence, 'bundles'), { recursive: true }).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
    result.ended = new Date().toISOString(); await persist();
    console.log(`BLOCKED full gate; ${result.replayStatus ?? 'failed'} scoped replay: ${path.join(output, 'report.json')}`);
  }
  // Even a passing 16-row browser replay does not close inherited audit/manual gaps.
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  replay(process.argv.slice(2)).then(() => { process.exitCode = 2; }).catch(error => { console.error(error.stack); process.exitCode = 1; });
}
