import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve(import.meta.dirname, '../../..');
const upstream = path.join(root, 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos');
const demos = fs.readdirSync(upstream);
const entry = fs.readFileSync(path.join(import.meta.dirname, 'entry.ts'), 'utf8');
assert.equal((entry.match(/id: 'autocomplete\//g) ?? []).length, demos.length);
assert.equal((entry.match(/component: Demo/g) ?? []).length, demos.length * 2);
for (const demo of demos) {
  assert(entry.includes(`autocomplete/${demo}`));
  assert(entry.includes(`${demo}/index.ts`));
  assert(fs.readFileSync(path.join(upstream, demo, 'index.ts'), 'utf8').includes('createDemoWithVariants'));
  const sourceCss = fs.readFileSync(path.join(upstream, demo, 'css-modules/index.module.css'));
  const localCss = fs.readFileSync(path.join(import.meta.dirname, demo, 'css-modules/index.module.css'));
  assert(sourceCss.equals(localCss), `${demo}: CSS must remain byte-identical`);
  for (const variant of ['css-modules', 'tailwind']) {
    const name = `${demo}/${variant}/index.tsx`;
    const text = fs.readFileSync(path.join(import.meta.dirname, name), 'utf8');
    assert(!/React\.|@base-ui\/react|className=|\bkey=/.test(text), name);
    const ast = ts.createSourceFile(name, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    assert.equal(ast.parseDiagnostics.length, 0, name);
    assert(entry.includes(`docs/demos/autocomplete/${name}`));
  }
}
assert(entry.indexOf('autocomplete/hero') < entry.indexOf('autocomplete/async'));
console.log(`${demos.length} upstream createDemo exports; ${demos.length * 2} TSX variants; ${demos.length} byte-identical CSS modules; hero first; source checks passed.`);
