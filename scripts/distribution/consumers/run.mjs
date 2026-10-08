import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { contracts, assertExportMap } from '../types/shared.mjs';
import { command } from './process.mjs';
import { pins, optionalPins, peerSets, temporaryRoot, sha256, parseArgs, inside, inspectArchive, assertInventory,
  conditionSets, validateQualification, assertCoverage, requiredQualifications } from './policy.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const templates = path.join(root, 'test/distribution/consumers/templates');
const readJson = async file => JSON.parse(await fs.readFile(file, 'utf8'));
const node = process.execPath;
const templateNames = ['installation.mjs', 'initialization.mjs', 'types.mjs', 'resolution.mjs', 'analysis.mjs', 'import-audit.mjs', 'temporal.mjs', 'runtime-accounting.mjs', 'fixture-types.mjs', 'bundle.mjs', 'browser.mjs', 'shaking-browser.mjs', 'app.tsx', 'client.tsx', 'server.tsx'];

async function main(argv) {
  const args = parseArgs(argv);
  const approved = await fs.realpath(temporaryRoot);
  // Evidence/output is also external; never permit generated output in the checkout.
  const parent = await fs.realpath(path.dirname(args.output));
  assert(inside(approved, parent) && !inside(root, parent), '--output parent must exist under the approved external temporary root');
  assert.equal((await fs.lstat(args.tarball)).isFile(), true, '--tarball must be a regular archive, not a link');
  await fs.mkdir(args.output); // exclusive: a previous run cannot lend green evidence.
  const output = await fs.realpath(args.output);
  const report = { schemaVersion: 1, owner: 'bsolid-dist-pack', status: 'running', started: new Date().toISOString(),
    tarball: args.tarball, output, stages: {}, consumers: {}, blockers: [], commands: [],
    acceptance: 'complete archive gate; any unexecuted mandatory obligation blocks; no reduced acceptance',
    runtimeProvenance: { consumer: 'independent stock registry RC13', workspacePatch: 'absent in consumers', workspace: 'not used for consumer runtime resolution' } };
  let work;
  const persist = () => fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  async function stage(owner, name, run) {
    owner.stages[name] = { status: 'running' }; await persist();
    try { const detail = await run(); owner.stages[name] = { status: 'passed', ...detail }; return true; }
    catch (error) {
      owner.stages[name] = { status: 'failed', message: error.message, stack: error.stack };
      report.blockers.push({ stage: name, consumer: owner.kind, message: error.message }); return false;
    } finally { await persist(); }
  }
  async function execute(directory, label, executable, parameters, options) {
    const record = await command(directory, path.join(output, 'logs'), label, executable, parameters, { ...options, allowFailure: true });
    report.commands.push(record); await persist();
    assert(record.code === 0 && !record.timedOut && !record.spawnError, `Failed ${label}; full diagnostics: ${record.stdout}, ${record.stderr}`);
    if (options?.strictDiagnostics) {
      assert.equal((await fs.readFile(record.stderr)).length, 0, `Unexpected stderr diagnostic in ${label}; preserved at ${record.stderr}`);
      assert.equal((await fs.readFile(record.stdout)).length, 0, `Unexpected stdout diagnostic in ${label}; preserved at ${record.stdout}`);
    }
    return record;
  }
  async function retain(directory, names, prefix) {
    const destination = path.join(output, prefix); await fs.mkdir(destination, { recursive: true });
    for (const name of names) {
      try { await fs.copyFile(path.join(directory, name), path.join(destination, name)); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
  }
  try {
    const { exports: exportContract, pkg: packageContract } = await contracts();
    report.nodeVersion = process.versions.node;
    assert.equal(process.versions.node, packageContract.toolchain.node, 'Runner Node must match supported pinned toolchain');
    const archive = inspectArchive(await fs.readFile(args.tarball));
    const manifest = JSON.parse(archive.files.get('package.json'));
    report.archiveSha256 = archive.sha256;
    report.sourceSha = exportContract.sourceSha;
    report.inventory = archive.inventory;
    report.exportContract = exportContract;
    report.package = manifest;
    report.contractHashes = { exports: sha256(JSON.stringify(exportContract)), package: sha256(JSON.stringify(packageContract)) };
    await fs.writeFile(path.join(output, 'inventory.json'), JSON.stringify(archive.inventory, null, 2));
    const valid = await stage(report, 'inventory', async () => {
      assertExportMap(manifest.exports, exportContract, packageContract);
      assertInventory(archive, manifest, packageContract);
      for (const entry of Object.values(manifest.exports)) for (const target of Object.values(entry)) assert(archive.files.has(target.slice(2)), `Export target absent in archive: ${target}`);
      return { files: archive.inventory.length, runtimeKeys: Object.values(exportContract.exports).filter(entry => entry.kind === 'runtime').length,
        typeOnlyKeys: Object.keys(exportContract.exports).filter(key => exportContract.exports[key].kind === 'types-only') };
    });
    if (!valid) return;
    // Snapshot archive and every fixture/contract before installs. Later checkout
    // writes cannot change this run, and an input archive mutation is detected.
    work = await fs.realpath(await fs.mkdtemp(path.join(approved, 'bsolid-packed-')));
    report.temporaryDirectory = work;
    // The approved directory may be shared with other tasks. Reject ancestor
    // node_modules rather than accidentally satisfying absent peers from them.
    report.ancestorResolutionAudit = [];
    for (let ancestor = path.dirname(work);; ancestor = path.dirname(ancestor)) {
      const modules = path.join(ancestor, 'node_modules');
      const present = await fs.lstat(modules).then(() => true, error => { if (error.code === 'ENOENT') return false; throw error; });
      report.ancestorResolutionAudit.push({ modules, present });
      assert(!present, `External consumer ancestor contains node_modules: ${modules}`);
      if (path.dirname(ancestor) === ancestor) break;
    }
    const frozenTarball = path.join(work, 'package.tgz');
    await fs.writeFile(frozenTarball, await fs.readFile(args.tarball));
    assert.equal(sha256(await fs.readFile(frozenTarball)), archive.sha256, 'Archive changed during snapshot');
    const frozen = new Map();
    for (const name of templateNames) frozen.set(name, await fs.readFile(path.join(templates, name), 'utf8'));
    frozen.set('attw.mjs', await fs.readFile(new URL('../types/attw.mjs', import.meta.url), 'utf8'));
    frozen.set('ordinary.tsx', await fs.readFile(path.join(root, 'test/distribution/types/ordinary.fixture.txt'), 'utf8'));
    for (const name of ['core', 'date-fns', 'luxon', 'both']) frozen.set(`temporal-${name}.mts`, await fs.readFile(path.join(root, `packages/solid/src/internals/temporal/consumers/${name}.fixture.mts`), 'utf8'));
    report.fixtureHashes = Object.fromEntries([...frozen].map(([name, source]) => [name, sha256(source)]));
    const workspaceConfig = await fs.readFile(path.join(root, 'pnpm-workspace.yaml'), 'utf8');
    const patchLines = workspaceConfig.split('\n').filter(line => /patch|@solidjs.*\.patch/.test(line));
    report.runtimeProvenance.workspacePatchDeclaration = patchLines;
    report.runtimeProvenance.workspaceConfigSha256 = sha256(workspaceConfig);
    // This reads patch provenance only, never installs or applies it to consumers.
    report.runtimeProvenance.workspaceSignalsPatchSha256 = await fs.readFile(path.join(root, 'docs/patches/@solidjs__signals@2.0.0-rc.13.patch')).then(sha256).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
    const browserMasks = conditionSets().map((conditions, mask) => ({ conditions, mask })).filter(({ conditions }) => conditions.includes('browser') && !conditions.includes('worker') && !conditions.includes('types')).map(({ mask }) => mask);
    const workerMasks = conditionSets().map((conditions, mask) => ({ conditions, mask })).filter(({ conditions }) => conditions.includes('browser') && conditions.includes('worker') && !conditions.includes('types')).map(({ mask }) => mask);
    for (const [kind, peers] of Object.entries(peerSets)) {
      const consumer = report.consumers[kind] = { kind, stages: {}, peerSet: peers, runtimeProvenance: 'stock RC13; workspace patch absent' };
      const directory = await fs.mkdtemp(path.join(work, `${kind}-`));
      await fs.mkdir(path.join(directory, 'home'));
      await fs.writeFile(path.join(directory, 'empty.npmrc'), '');
      await fs.writeFile(path.join(directory, 'empty-global.npmrc'), '');
      for (const [name, source] of frozen) {
        // Rebase only the package identity in fixtures, never a package/source path.
        await fs.writeFile(path.join(directory, name), source.replaceAll('baseui-solid2', manifest.name));
      }
      const dependencies = { ...pins, ...Object.fromEntries(peers.map(name => [name, optionalPins[name]])), [manifest.name]: frozenTarball };
      const overrides = { ...pins, ...optionalPins, '@floating-ui/core': '1.8.0', '@floating-ui/utils': '0.2.12' };
      await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: `packed-consumer-${kind}`, private: true, type: 'module', dependencies, overrides }, null, 2));
      const input = { name: manifest.name, version: manifest.version, exports: manifest.exports, contract: exportContract.exports,
        inventory: archive.inventory, kind, peers, pins, optionalPins, tarball: frozenTarball, conditionSets: conditionSets(), executeRuntime: false };
      await fs.writeFile(path.join(directory, 'input.json'), JSON.stringify(input, null, 2));
      const installed = await stage(consumer, 'installation', async () => {
        await execute(directory, `${kind}-install`, 'npm', ['install', '--ignore-scripts', '--legacy-peer-deps', '--no-audit', '--no-fund', '--install-strategy=hoisted'], { timeout: 600_000 });
        await execute(directory, `${kind}-installation-audit`, node, ['installation.mjs']);
        const result = await readJson(path.join(directory, 'installation-result.json'));
        consumer.installation = result;
        return { archive: result.archive, patch: result.workspacePatch };
      });
      await retain(directory, ['package.json', 'package-lock.json', 'input.json', 'installation-result.json'], kind);
      if (!installed) {
        for (const name of ['types', 'resolution', 'runtime', 'browser', 'shaking']) consumer.stages[name] = { status: 'blocked', reason: 'Independent archive install failed' };
        continue;
      }
      await stage(consumer, 'import-audit', () => execute(directory, `${kind}-import-audit`, node, ['import-audit.mjs']));
      await stage(consumer, 'initialization', () => execute(directory, `${kind}-initialization-audit`, node, ['initialization.mjs'], { strictDiagnostics: true }));
      const typed = await stage(consumer, 'types', async () => {
        await execute(directory, `${kind}-types`, node, ['types.mjs']);
        const result = await readJson(path.join(directory, 'types-result.json'));
        consumer.typeKeys = result.keys; consumer.typeModes = result.modes;
        return { keys: result.keys.length, modes: result.modes, skipLibCheck: false };
      });
      input.executeRuntime = typed;
      await fs.writeFile(path.join(directory, 'input.json'), JSON.stringify(input, null, 2));
      let resolutionCount = 0;
      const resolved = await stage(consumer, 'resolution', async () => {
        const failures = [];
        for (const [mask, conditions] of conditionSets().entries()) {
          try { await execute(directory, `${kind}-conditions-${mask}`, node, [...conditions.map(condition => `--conditions=${condition}`), 'resolution.mjs', String(mask)], { strictDiagnostics: true }); resolutionCount++; }
          catch (error) { failures.push(error.message); }
        }
        consumer.resolutionSets = resolutionCount;
        assert.deepEqual(failures, [], 'Condition/runtime matrix failed; all 64 exact results retained');
        return { sets: resolutionCount, builtinNodeCondition: true };
      });
      consumer.stages.runtime = typed && resolved ? { status: 'passed', conditions: '24 server sets including browser+worker; import type-only rejection and missing-adapter locality' } : { status: 'blocked', reason: 'Strict types or condition execution failed' };
      if (kind === 'both') await stage(report, 'analysis', () => execute(directory, 'archive-publint-attw', node, ['analysis.mjs']));
      const fixtureTyped = typed && resolved && consumer.stages['import-audit'].status === 'passed' &&
        await stage(consumer, 'fixture-types', () => execute(directory, `${kind}-fixture-types`, node, ['fixture-types.mjs'], { strictDiagnostics: true }));
      if (!fixtureTyped) {
        consumer.stages['fixture-types'] ??= { status: 'blocked', reason: 'Prior strict types, resolution or portability failed' };
        consumer.stages.browser = consumer.stages.shaking = { status: 'blocked', reason: 'Strict package/fixture types, resolution or import portability failed; no expensive runtime compilation executed' };
      } else {
        await stage(consumer, 'temporal', () => execute(directory, `${kind}-temporal-runtime`, node, ['temporal.mjs'], { strictDiagnostics: true }));
        await stage(consumer, 'shaking', () => execute(directory, `${kind}-tree-shaking`, node, ['bundle.mjs', 'shaking']));
        const serverBuilt = await stage(consumer, 'ssr', async () => {
          await execute(directory, `${kind}-server-build`, node, ['bundle.mjs', 'server']);
          await execute(directory, `${kind}-node-ssr`, node, ['bundles/server/server.mjs'], { strictDiagnostics: true });
        });
        if (serverBuilt) await stage(consumer, 'worker-ssr', async () => {
          for (const mask of workerMasks) {
            await execute(directory, `${kind}-worker-server-build-${mask}`, node, ['bundle.mjs', 'server', String(mask)]);
            await execute(directory, `${kind}-worker-ssr-${mask}`, node, [...conditionSets()[mask].map(condition => `--conditions=${condition}`), 'bundles/server/server.mjs'], { strictDiagnostics: true });
          }
          return { sets: workerMasks.length, masks: workerMasks, stockRC13: true };
        });
        if (serverBuilt) await stage(consumer, 'browser', async () => {
          await execute(directory, `${kind}-chromium-install`, node, ['node_modules/playwright/cli.js', 'install', 'chromium'], { timeout: 600_000 });
          const failures = [];
          for (const mask of browserMasks) {
            try {
              await execute(directory, `${kind}-client-build-${mask}`, node, ['bundle.mjs', 'client', String(mask)]);
              await execute(directory, `${kind}-browser-${mask}`, node, ['browser.mjs', String(mask)]);
            } catch (error) { failures.push(error.message); }
          }
          assert.deepEqual(failures, [], 'Production browser matrix failures; all attempted builds/diagnostics retained');
          return { sets: browserMasks.length, masks: browserMasks, stockRC13: true };
        });
        else consumer.stages.browser = { status: 'blocked', reason: 'Independent Node SSR failed' };
        if (consumer.stages.shaking.status === 'passed' && serverBuilt && consumer.stages.browser.status === 'passed') {
          await stage(consumer, 'optimized-behavior', async () => {
            await execute(directory, `${kind}-optimized-events`, node, ['shaking-browser.mjs']);
            await execute(directory, `${kind}-optimized-hydration-styles`, node, ['browser.mjs', '0', '--optimized']);
          });
        } else consumer.stages['optimized-behavior'] = { status: 'blocked', reason: 'Bundle, SSR or browser prerequisites failed' };
      }
      const results = (await fs.readdir(directory)).filter(name => name.endsWith('.json'));
      await retain(directory, results, kind);
      // Reproducible optimized artifacts live only in external evidence output.
      await fs.cp(path.join(directory, 'bundles'), path.join(output, kind, 'bundles'), { recursive: true }).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
    for (const [global, local] of [['production-browser', 'browser'], ['tree-shaking', 'shaking']]) {
      report.stages[global] = { status: Object.keys(report.consumers).length === 4 && Object.values(report.consumers).every(consumer => consumer.stages[local]?.status === 'passed') ? 'passed' : 'blocked',
        reason: 'Every independent peer set and mandatory condition fixture must pass' };
    }
    await stage(report, 'qualifications', async () => {
      assert(args.qualification, `Missing coordinator qualification evidence: ${requiredQualifications.join(', ')}`);
      const qualification = await readJson(args.qualification), artifacts = new Map();
      for (const entry of Object.values(qualification.obligations ?? {})) for (const artifact of entry.artifacts ?? []) artifacts.set(artifact.path, await fs.readFile(artifact.path));
      validateQualification(qualification, archive.sha256, artifacts);
      const evidenceDirectory = path.join(output, 'qualification-artifacts');
      await fs.mkdir(evidenceDirectory);
      for (const bytes of artifacts.values()) await fs.writeFile(path.join(evidenceDirectory, sha256(bytes)), bytes);
      const packedMarkdown = archive.inventory.filter(file => file.file.startsWith('docs/') && file.file.endsWith('.md'));
      assert.deepEqual(Object.fromEntries(packedMarkdown.map(file => [file.file, file.sha256])), qualification.markdown, 'Packed Markdown inventory is stale/incomplete');
      for (const notice of qualification.notices) {
        assert(notice.sourceSha && notice.license && notice.packedFile && notice.requiredText?.length, 'Incomplete adopted-source notice mapping');
        const content = archive.files.get(notice.packedFile)?.toString();
        assert(content && notice.requiredText.every(text => content.includes(text)), `Adopted notice missing: ${notice.packedFile}`);
      }
      await fs.writeFile(path.join(output, 'qualification.json'), JSON.stringify(qualification, null, 2));
      return { required: requiredQualifications };
    });
    await stage(report, 'immutable-archive', async () => assert.equal(sha256(await fs.readFile(args.tarball)), archive.sha256, 'Input archive changed during qualification'));
    await stage(report, 'complete-accounting', async () => assertCoverage(report, exportContract));
  } catch (error) {
    report.blockers.push({ stage: 'runner', message: error.message, stack: error.stack });
  } finally {
    report.status = report.blockers.length || report.stages['complete-accounting']?.status !== 'passed' ? 'blocked' : 'passed';
    const consumerStages = ['installation', 'import-audit', 'initialization', 'types', 'fixture-types', 'resolution', 'runtime', 'temporal', 'ssr', 'worker-ssr', 'browser', 'shaking', 'optimized-behavior'];
    report.packageVerificationStatus = Object.keys(report.consumers).length === 4 &&
      ['inventory', 'analysis', 'immutable-archive'].every(name => report.stages[name]?.status === 'passed') &&
      Object.values(report.consumers).every(consumer => consumerStages.every(name => consumer.stages[name]?.status === 'passed')) ? 'passed' : 'blocked';
    report.ended = new Date().toISOString();
    await persist();
    // Keep independently installed graphs and browser caches for diagnosis. The
    // report records their exact mkdtemp path; no workspace build output is touched.
    console.log(`${report.status.toUpperCase()}: ${path.join(output, 'report.json')}`);
    console.log(`Packed package verification: ${report.packageVerificationStatus}; full qualification: ${report.status}`);
    if (report.status !== 'passed') process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.stack); process.exitCode = 1; });
}
