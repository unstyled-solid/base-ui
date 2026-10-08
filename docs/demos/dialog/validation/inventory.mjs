import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../../../..');
const upstream = 'docs/src/app/(docs)/react/components/dialog/demos';
const family = 'docs/demos/dialog';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const entry = read(`${family}/entry.ts`);
const names = fs.readdirSync(path.join(root, 'upstream/base-ui', upstream)).filter(name => fs.existsSync(path.join(root, 'upstream/base-ui', upstream, name, 'index.ts'))).sort();
const ids = [...entry.matchAll(/id: 'dialog\/([^']+)'/g)].map(match => match[1]);
assert.equal(ids[0], 'hero');
assert.deepEqual([...ids].sort(), names);
const imports = new Map([...entry.matchAll(/import (\w+) from '([^']+)'/g)].map(match => [match[1], path.posix.normalize(`${family}/${match[2]}.tsx`)]));
const variants = [...entry.matchAll(/component: (\w+), files: (\[[^\]]+\])/g)];
assert.equal(variants.length, names.length * 2);
const cssFiles = new Set();
for (const [, component, json] of variants) {
  const files = JSON.parse(json);
  assert.equal(files[0], imports.get(component), 'Displayed source must be the executed component');
  for (const file of files) assert.ok(fs.existsSync(path.join(root, file)), `Missing source ${file}`);
  const text = read(files[0]);
  assert.doesNotMatch(text, /React\.|@base-ui\/react|className=|use client/);
  const css = text.match(/import styles from '([^']+)'/);
  if (css) {
    const file = path.posix.normalize(path.posix.join(path.posix.dirname(files[0]), css[1]));
    assert.ok(files.includes(file), `Displayed source omits imported CSS ${file}`);
    assert.equal(read(file), read(`upstream/base-ui/${upstream}/${file.slice(family.length + 1)}`), 'CSS must match pinned upstream byte for byte');
    cssFiles.add(file);
  }
}
for (const [, file] of entry.matchAll(/upstream: '([^']+)'/g)) {
  assert.match(read(`upstream/base-ui/${file}`), /createDemoWithVariants/);
}
console.log(`PASS inventory: ${names.length} demos, ${variants.length} executed variants, ${cssFiles.size} byte-identical CSS modules; hero first, complete source paths.`);
