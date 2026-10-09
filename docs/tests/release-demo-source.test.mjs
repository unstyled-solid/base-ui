import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describePublicSource, generateCatalog, sourceGraph, walk } from '../scripts/demos/catalog.mjs';
import { applyPublicSource, publicModuleSpecifier } from '../demos/shared/public-source.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
test('only AST module specifiers receive the display/copy package identity adaptation', () => {
  const source = `// import Fake from 'baseui-solid2/comment';
/* export * from 'baseui-solid2/comment'; */
const ordinary = 'baseui-solid2/string';
const template = \`import('baseui-solid2/template')\`;
import {
  Button,
} from 'baseui-solid2/button';
import type { Thing } from "baseui-solid2";
export { Accordion } from 'baseui-solid2/accordion';
export type { Other } from 'baseui-solid2/types';
const lazy = import(/* untouched */ 'baseui-solid2/dialog');
type Ref = import('baseui-solid2/ref').Ref;
import Legacy = require('baseui-solid2/legacy');
import Other from 'baseui-solid2-other/button';
const jsx = <p>baseui-solid2/visible</p>;
`;
  const record = describePublicSource(source, 'example.tsx');
  assert.equal(record.edits.length, 7);
  const displayed = applyPublicSource(source, record.edits);
  let restored = displayed;
  for (const edit of [...record.edits].reverse()) {
    const offset = record.edits.filter(other => other.start < edit.start).reduce((total, other) => total + other.replacement.length - other.original.length, 0);
    const start = edit.start + offset;
    restored = restored.slice(0, start) + edit.original + restored.slice(start + edit.replacement.length);
  }
  assert.equal(restored, source, 'all bytes outside declared literal ranges are identical');
  assert.match(displayed, /from '@unstyled-solid\/base-ui\/button'/);
  assert.match(displayed, /import\(\/\* untouched \*\/ '@unstyled-solid\/base-ui\/dialog'\)/);
  assert.ok(displayed.includes("const ordinary = 'baseui-solid2/string'"));
  assert.equal(hash(displayed), record.sha256);
  assert.equal(Buffer.byteLength(displayed), record.bytes);
  assert.equal(publicModuleSpecifier('baseui-solid2-other'), 'baseui-solid2-other');
  assert.throws(() => applyPublicSource(source.replace('baseui-solid2/button', 'changed/button'), record.edits), /Stale or invalid/);
  assert.deepEqual(describePublicSource(source, 'example.css').edits, []);
  const escaped = String.raw`export * from 'baseui\u002dsolid2/button';`;
  assert.equal(applyPublicSource(escaped, describePublicSource(escaped, 'escaped.ts').edits), "export * from '@unstyled-solid/base-ui/button';");
});

test('executing graph keeps actual original bytes and hashes alongside public display provenance', async () => {
  const file = 'docs/demos/accordion/hero/css-modules/index.tsx';
  const graph = await sourceGraph(root, [file]);
  const record = graph.files.find(item => item.path === file);
  const original = await fs.readFile(new URL(`../../${file}`, import.meta.url));
  assert.equal(record.bytes, original.length);
  assert.equal(record.sha256, hash(original));
  assert.ok(graph.packages.includes('baseui-solid2'));
  const displayed = applyPublicSource(original.toString(), record.publicSource.edits);
  assert.equal(record.publicSource.sha256, hash(displayed));
  assert.equal(record.publicSource.bytes, Buffer.byteLength(displayed));
  assert.notEqual(record.sha256, record.publicSource.sha256);
  assert.deepEqual(record.publicSource.adaptation, { kind: 'module-specifier-identity', version: 1, from: 'baseui-solid2', to: '@unstyled-solid/base-ui' });
  for (const dependency of graph.files.filter(item => !item.assets)) assert.ok(dependency.publicSource);
});

test('demo product claims and project support links target the Solid port, not upstream marketing', async () => {
  for (const file of await walk(new URL('../demos/', import.meta.url).pathname)) {
    if (!file.endsWith('.tsx') || file.includes('/shared/') || file.includes('.test.')) continue;
    const source = await fs.readFile(file, 'utf8');
    assert.doesNotMatch(source, /unstyled React components|https:\/\/github\.com\/mui\/base-ui|https:\/\/mui\.com\/store/, file);
  }
});

test('every catalog display graph has independently verifiable original and public hashes', async () => {
  const catalog = await generateCatalog(root);
  assert.deepEqual(catalog.publicPackage, { name: '@unstyled-solid/base-ui', version: '0.0.1' });
  const files = new Map(catalog.entries.flatMap(entry => entry.variants.flatMap(variant => variant.files)).map(file => [file.path, file]));
  let adapted = 0;
  for (const file of files.values()) {
    const original = await fs.readFile(new URL(`../../${file.path}`, import.meta.url));
    assert.equal(hash(original), file.sha256, file.path);
    assert.equal(original.length, file.bytes, file.path);
    if (file.assets) continue;
    const displayed = applyPublicSource(original.toString('utf8'), file.publicSource.edits);
    assert.equal(hash(displayed), file.publicSource.sha256, file.path);
    assert.equal(Buffer.byteLength(displayed), file.publicSource.bytes, file.path);
    assert.deepEqual(describePublicSource(displayed, file.path).edits, [], file.path);
    if (file.publicSource.edits.length) adapted++;
  }
  assert.ok(adapted > 0);
});

test('form-action source panels describe local simulation and native submission without framework directives', async () => {
  for (const variant of ['css-modules', 'tailwind']) {
    const file = `docs/demos/form/form-action/${variant}/index.tsx`;
    const source = await fs.readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
    const graph = await sourceGraph(root, [file]);
    for (const record of graph.files.filter(item => /\.[cm]?[jt]sx?$/.test(item.path))) {
      const actual = await fs.readFile(new URL(`../../${record.path}`, import.meta.url), 'utf8');
      const displayed = applyPublicSource(actual, record.publicSource.edits);
      assert.doesNotMatch(displayed, /Next\.js|\bReact\b|use server|Server Function|server action/i, record.path);
      assert.equal(record.sha256, hash(actual), record.path);
      assert.equal(record.publicSource.sha256, hash(displayed), record.path);
    }
    assert.match(source, /Called by the native submit handler; validation runs locally, without a network request\./);
    assert.match(source, /Simulate an asynchronous server response with a one-second delay\./);
    assert.match(source, /Explicitly reset native form fields after the simulated response resolves\./);
    assert.match(source, /onSubmit=\{async \(event\) =>/);
    assert.match(source, /event\.preventDefault\(\)/);
    assert.match(source, /await submitForm\(state\(\), formData\)/);
    assert.match(source, /form\.reset\(\)/);
    assert.match(source, /setTimeout\(resolve, 1000\)/);
  }
});
