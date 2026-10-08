import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readEntries, sourceGraph, generateCatalog, readSafe, upstreamSymbols } from '../../scripts/demos/catalog.mjs';
const root = fileURLToPath(new URL('../../../', import.meta.url));
test('reads metadata without executing component imports or expressions', () => {
  const result = readEntries(`import Component from './example'; export default [{id:'button/hero',upstream:'docs/hero/index.ts',variants:[{id:'CssModules',label:'CSS Modules',component:Component,files:['docs/demos/button/example.tsx']}]}] satisfies DemoFamily;`, 'entry.ts');
  assert.equal(result[0].variants[0].component.expression, 'Component');
  assert.throws(() => readEntries('export default runArbitraryCode()', 'entry.ts'), /statically readable/);
});
test('source graph tracks package edges without traversing library internals and retains exact hashes', async () => {
  const graph = await sourceGraph(root, ['docs/tests/demos/fixtures/state.tsx', 'docs/tests/demos/fixtures/portal.tsx', 'docs/tests/demos/fixtures/style.module.css']);
  assert.deepEqual(graph.packages, ['@solidjs/web', 'solid-js']);
  assert.equal(graph.files.length, 3);
  assert.equal(graph.files[0].bytes, (await fs.readFile(new URL('./fixtures/state.tsx', import.meta.url))).length);
  assert.equal(graph.files[0].sha256.length, 64);
  await assert.rejects(sourceGraph(root, ['packages/solid/src/index.ts']), /boundary/);
  await assert.rejects(readSafe(root, '../outside'), /Unsafe/);
});
test('maps the actual pinned createDemo exports and catalog deterministically', async () => {
  const file = 'docs/src/app/(docs)/react/components/button/demos/hero/index.ts';
  assert.deepEqual(upstreamSymbols((await readSafe(root, `docs/upstream/base-ui/${file}`)).toString(), file), ['DemoButtonHero']);
  assert.deepEqual(await generateCatalog(root), await generateCatalog(root));
});
