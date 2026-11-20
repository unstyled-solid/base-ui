import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { inspectArchive, sha256 } from '../consumers/policy.mjs';
import { assertExportMap, contracts } from '../types/shared.mjs';
import { exportInventory } from './exports.mjs';
import { auditTarball } from '../notices/audit.mjs';
import { checkPackedMarkdown } from '../../../docs/scripts/qualification/audit-packed.mjs';
import { markdownLedger } from '../../../docs/scripts/qualification/stage-markdown.mjs';
import { readArchive } from '../notices/archive.mjs';
import { extract } from '../../../docs/scripts/api/engine.mjs';
import { census } from '../build/initialization-census.mjs';
import { filesIn, isProduction } from '../build/index.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const [kind, tarball, output] = process.argv.slice(2);
const bytes = await fs.readFile(tarball), archive = inspectArchive(bytes);
const assertions = [], detail = {};
const pass = id => assertions.push({ id, status: 'passed' });
try {
  const { exports: exportsContract, pkg } = await contracts();
  const manifest = JSON.parse(archive.files.get('package.json'));
  assertExportMap(manifest.exports, exportsContract, pkg);
  if (kind === 'source-export-completeness') {
    const inventory = await exportInventory();
    const adaptations = JSON.parse(await fs.readFile(path.join(root, 'distribution/export-adaptations.json')));
    assert.equal(adaptations.sourceSha, exportsContract.sourceSha);
    const used = new Set();
    for (const entry of inventory) {
      const target = new Set(entry.target.map(s => s.name)), declarations = new Set(entry.declarations.map(s => s.name));
      assert.deepEqual([...target].sort(), [...declarations].sort(), `${entry.key}: declaration symbols differ from source`);
      for (const symbol of entry.target) assert(symbol.declarations.length, `${entry.key}:${symbol.name}: unresolved target`);
      for (const symbol of entry.upstream) if (!target.has(symbol.name)) {
        const adaptation = adaptations.exclusions.find(a => a.entrypoint === entry.key && a.symbol === symbol.name);
        assert(adaptation?.reason && symbol.declarations.some(d => d.file === adaptation.source), `${entry.key}: missing ${symbol.name}`);
        used.add(adaptation);
      }
    }
    assert.equal(used.size, adaptations.exclusions.length, 'Stale/unnecessary exclusion');
    detail.exports = inventory; detail.adaptations = adaptations;
    pass('every-upstream-entry-and-recursive-symbol-accounted');
    pass('every-target-symbol-present-in-generated-declarations');
    let maps = 0;
    const sources = new Set();
    for (const [file, content] of archive.files) {
      if (/^(dom|server)(-dev)?\/.*\.js\.map$/.test(file)) {
        const map = JSON.parse(content);
        assert.equal(map.sources.length, 1); assert.equal(map.sourcesContent.length, 1);
        const source = 'packages/solid/src/' + map.sources[0].split('__source__/')[1];
        assert.equal(sha256(await fs.readFile(path.join(root, source))), sha256(map.sourcesContent[0]), `Stale runtime: ${file}`);
        sources.add(source); maps++;
      }
      if (file.startsWith('types/')) assert.equal(sha256(content), sha256(await fs.readFile(path.join(root, 'packages/solid/build', file))), `Stale declarations: ${file}`);
    }
    const typeOnly = new Set(Object.values(exportsContract.exports).filter(e => e.kind === 'types-only').map(e => 'packages/solid/' + e.target.slice(2)));
    const production = (await filesIn(path.join(root, 'packages/solid/src'))).filter(isProduction).map(f => 'packages/solid/src/' + f).filter(f => !typeOnly.has(f));
    detail.typeOnlySources = [...typeOnly];
    assert.deepEqual([...sources].sort(), production.sort());
    assert.equal(maps, production.length * 4);
    detail.maps = maps; detail.sources = [...sources].sort();
    pass('all-production-sources-in-four-archive-variants-current');
    pass('archive-declarations-byte-match-current-generated-types');
  } else if (kind === 'current-markdown') {
    const ledger = await markdownLedger();
    assert.deepEqual(checkPackedMarkdown(readArchive(bytes), ledger), []);
    const api = JSON.parse(await fs.readFile(path.join(root, 'docs/generated/api/catalog.json')));
    const entries = Object.entries(exportsContract.exports).map(([entrypoint, e]) => ({ entrypoint, file: path.join(root, 'packages/solid/build/types', e.target.slice(6).replace(/\.tsx?$/, '.d.ts')) }));
    assert.deepEqual(await extract({ root, entries }), api, 'API catalog is not current');
    assert.deepEqual(api.modules.map(m => m.entrypoint).sort(), Object.keys(exportsContract.exports).sort());
    const pages = JSON.parse(await fs.readFile(path.join(root, 'docs/upstream-manifest.json'))).pages;
    const canonical = (await filesIn(path.join(root, 'upstream/base-ui/docs/src/app/(docs)'))).filter(f => f.endsWith('/page.mdx')).map(f => 'docs/src/app/(docs)/' + f);
    assert.deepEqual(pages.map(p => p.source).sort(), canonical.sort());
    for (const page of pages) {
      const imported = JSON.parse(await fs.readFile(path.join(root, page.destination)));
      assert.equal(sha256(await fs.readFile(path.join(root, 'upstream/base-ui', page.source))), imported.provenance.sourceSha256);
    }
    detail.ledger = ledger;
    pass('all-canonical-pages-and-current-declaration-modules-accounted');
    pass('every-page-and-api-markdown-byte-matches-current-generator');
    pass('archive-versioned-markdown-manifest-and-all-bytes-current');
  } else if (kind === 'adopted-notices') {
    detail.audit = await auditTarball({ bytes });
    assert.deepEqual(detail.audit.failures, []);
    pass('all-required-license-and-notice-texts-packed-intact');
    pass('public-archive-identity-matches-publication-contract');
  } else if (kind === 'side-effect-audit') {
    // The installed-module audit is run separately in the isolated consumer.
    // This authored census preserves the other half of the audit, including
    // the concrete callees behind the compiled classifier's reviewed factories.
    assert.equal(manifest.sideEffects, false);
    detail.authored = await census(path.join(root, 'packages/solid/src'), true);
    detail.reviewedFactories = await Promise.all(['packages/solid/src/utils/createLogOnce.ts', 'packages/solid/src/utils/formatErrorMessage.ts', 'packages/solid/src/utils/createAnimationFrame.ts', 'packages/solid/src/scroll-area/root/stateAttributes.ts', 'node_modules/solid-js/dist/solid.js', 'node_modules/@solidjs/web/dist/web.js', 'docs/distribution-initialization-audit.md'].map(async file => ({ file, sha256: sha256(await fs.readFile(path.join(root, file))) })));
    pass('authored-initialization-census-and-reviewed-callees-retained');
  } else throw new Error(`Unknown obligation ${kind}`);
  console.log(JSON.stringify({ kind, archiveSha256: archive.sha256, assertions, detail }, null, 2));
  await fs.writeFile(output, JSON.stringify({ kind, archiveSha256: archive.sha256, assertions, detail }, null, 2));
} catch (error) {
  await fs.writeFile(output, JSON.stringify({ kind, archiveSha256: archive.sha256, assertions, failure: error.stack, detail }, null, 2));
  throw error;
}
