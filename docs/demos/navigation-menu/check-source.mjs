import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '../../..');
const source = resolve(root, 'upstream/base-ui/docs/src/app/(docs)/react/components/navigation-menu/demos');
const entry = readFileSync(resolve(import.meta.dirname, 'entry.ts'), 'utf8');
for (const demo of ['hero', 'nested', 'nested-inline']) {
  assert.match(readFileSync(resolve(source, demo, 'index.ts'), 'utf8'), /createDemoWithVariants/);
  assert.ok(entry.includes(`id: 'navigation-menu/${demo}'`));
  assert.ok(entry.includes(`/navigation-menu/demos/${demo}/index.ts`));
  assert.equal(readFileSync(resolve(source, demo, 'css-modules/index.module.css'), 'utf8'),
    readFileSync(resolve(import.meta.dirname, demo, 'css-modules/index.module.css'), 'utf8'));
  for (const variant of ['css-modules', 'tailwind']) {
    const tsx = readFileSync(resolve(import.meta.dirname, demo, variant, 'index.tsx'), 'utf8');
    assert.ok(tsx.includes("from 'baseui-solid2/navigation-menu'"));
    assert.ok(!/React\.|@base-ui\/react|className=| key=/.test(tsx));
    assert.ok(tsx.includes('render={(linkProps) => <a {...linkProps} />}'));
  }
}
assert.equal(readFileSync(resolve(source, 'nested-inline/data.ts'), 'utf8'),
  readFileSync(resolve(import.meta.dirname, 'nested-inline/data.ts'), 'utf8'));
for (const [, path] of entry.matchAll(/'(docs\/demos\/[^']+)'/g)) assert.ok(existsSync(resolve(root, path)), path);
console.log('PASS: 3 upstream exports, 6 Solid variants, 3 byte-identical CSS modules, byte-identical data, all registered file paths exist.');
