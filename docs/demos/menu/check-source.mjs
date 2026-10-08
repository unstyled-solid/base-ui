import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../../..');
const upstream = 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos';
const entry = readFileSync(resolve(import.meta.dirname, 'entry.ts'), 'utf8');
const names = readdirSync(resolve(root, upstream), { withFileTypes: true }).filter((file) => file.isDirectory()).map((file) => file.name);
let variants = 0;
let styles = 0;
for (const name of names) {
  assert(entry.includes(`id: 'menu/${name}'`));
  assert(entry.includes(`upstream: '${upstream}/${name}/index.ts'`));
  assert(readFileSync(resolve(root, upstream, name, 'index.ts'), 'utf8').includes('createDemoWithVariants'));
  for (const variant of ['css-modules', 'tailwind']) {
    const path = `docs/demos/menu/${name}/${variant}/index.tsx`;
    assert(entry.includes(path));
    const source = readFileSync(resolve(root, path), 'utf8');
    assert(source.includes("from 'baseui-solid2/menu'"));
    assert(!/React\.|@base-ui\/react|className=| key=/.test(source));
    variants += 1;
    for (const file of readdirSync(resolve(root, upstream, name, variant))) {
      if (!file.endsWith('.css')) continue;
      assert.equal(readFileSync(resolve(root, upstream, name, variant, file), 'utf8'), readFileSync(resolve(import.meta.dirname, name, variant, file), 'utf8'));
      assert(entry.includes(`docs/demos/menu/${name}/${variant}/${file}`));
      styles += 1;
    }
  }
}
assert.equal(readFileSync(resolve(root, upstream, '_index.module.css'), 'utf8'), readFileSync(resolve(import.meta.dirname, '_index.module.css'), 'utf8'));
for (const path of entry.matchAll(/"(docs\/demos\/menu\/[^"\n]+)"/g)) assert(existsSync(resolve(root, path[1])));
assert(entry.indexOf("id: 'menu/hero'") < entry.indexOf("id: 'menu/arrow'"));
console.log(`PASS: ${names.length} entries, ${variants} executing TSX variants, ${styles + 1} byte-identical CSS modules; source paths exist, hero first, no React remnants.`);
