import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { readEntries, sourceGraph, upstreamSymbols, walk } from '../../scripts/demos/catalog.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const entries = readEntries(await fs.readFile(`${root}docs/demos/drawer/entry.ts`, 'utf8'), 'docs/demos/drawer/entry.ts');
const source = `${root}upstream/base-ui/docs/src/app/(docs)/react/components/drawer/demos`;
const upstreamFiles = await walk(source);
const factories = upstreamFiles.filter(file => file.endsWith('/index.ts'));
assert.equal(entries.length, factories.length);
assert.equal(entries[0].id, 'drawer/hero');
const ids = new Set();
let variants = 0;
let styles = 0;
for (const entry of entries) {
  assert(!ids.has(entry.id), `Duplicate ${entry.id}`);
  ids.add(entry.id);
  const text = await fs.readFile(`${root}upstream/base-ui/${entry.upstream}`, 'utf8');
  assert.equal(upstreamSymbols(text, entry.upstream).length, 1);
  assert.equal(entry.variants.length, 2);
  for (const variant of entry.variants) {
    const graph = await sourceGraph(root, variant.files);
    assert.deepEqual(graph.files.map(file => file.path).sort(), [...variant.files].sort());
    assert(graph.packages.includes('baseui-solid2'));
    for (const file of graph.files) {
      assert(file.path.startsWith('docs/demos/drawer/'));
      const local = await fs.readFile(`${root}${file.path}`, 'utf8');
      if (file.path.endsWith('.css')) {
        assert.equal(local, await fs.readFile(`${source}/${file.path.replace('docs/demos/drawer/', '')}`, 'utf8'));
        styles++;
      } else {
        assert(!/React\.|@base-ui\/react|className=|\bkey=/.test(local), file.path);
      }
    }
    variants++;
  }
}
const assets = upstreamFiles.filter(file => !/\.(tsx?|css)$/.test(file));
assert.equal(assets.length, 0, 'New upstream assets require explicit conversion');
console.log(`Drawer source/catalog check passed: ${entries.length} createDemo exports, ${variants} executable variants, ${styles} byte-identical CSS modules, ${assets.length} assets`);
