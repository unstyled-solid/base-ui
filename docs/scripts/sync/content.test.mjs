import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { transformPage, assertSiteReady } from '../../content/transforms/page.mjs';
import { cssReferences } from '../../content/transforms/parse.mjs';
import { PUBLIC_ROOT, SNAPSHOT } from '../../content/transforms/policy.mjs';
import { readSnapshot, buildPlan, writeChanged, hash, synchronize, verifyTools } from './engine.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const button = `${PUBLIC_ROOT}/components/button/page.mdx`;
const transform = (value) => transformPage(value, button, root);
function flatten(node) { return [node, ...(node.children ?? []).flatMap(flatten)]; }

test('pinned parser package versions are the versions actually resolved', verifyTools);

test('Button behavioral prose, anatomy and render semantics survive structural import mapping', async () => {
  const original = await fs.readFile(path.join(root, SNAPSHOT, button), 'utf8');
  const page = await transform(original);
  assert.equal(page.title, 'Button');
  assert.match(page.subtitle, /focusable when disabled/);
  assert.match(JSON.stringify(page.ast), /type=\\"submit\\"/);
  const snippets = flatten(page.ast).filter((n) => n.type === 'code');
  assert.match(snippets[0].value, /from 'baseui-solid2\/button'/);
  assert.match(snippets[1].value, /render=\{<div \/>\}/);
  assert(page.adaptations.some((a) => a.kind === 'react-render'));
  assert(page.imports.some((i) => i.kind === 'demo' && i.imported === 'DemoButtonHero'));
  assert(page.imports.some((i) => i.kind === 'api' && i.imported === 'TypesButton'));
  assert.throws(() => assertSiteReady(page), /not publishable/);
});

test('only parsed module literals change; comments, prose and ordinary strings do not', async () => {
  const page = await transform("# Example\n\nDo not replace @base-ui/react here.\n\n```tsx\nimport { Button } from '@base-ui/react/button';\n// import '@base-ui/react/comment'\nconst value = '@base-ui/react/string';\n<Button />;\n```\n");
  const code = flatten(page.ast).find((n) => n.type === 'code');
  assert.match(code.value, /from 'baseui-solid2\/button'/);
  assert.match(code.value, /'@base-ui\/react\/comment'/);
  assert.match(code.value, /'@base-ui\/react\/string'/);
  assert.equal(code.data.packageEdits.length, 1);
  assert.equal(page.ast.children[1].children[0].value, 'Do not replace @base-ui/react here.');
});

test('structured metadata, route links, badges, duplicate headings and explicit IDs', async () => {
  const page = await transform('# Title\n\n<Subtitle>Keep **this** guidance.</Subtitle>\n<Meta name="description" content="A description" />\n\nexport const metadata = { keywords: ["one"], robots: { index: false } };\n\n[Relative](../field/page.mdx?x=1#anatomy)\n[Absolute](/react/components/button#anatomy)\n[Historical](/react/overview/releases/v1-8-0)\n\n## Controls [Preview]\n\n## Controls\n\n<h2 id="controls-2">Explicit</h2>\n\n## Controls\n\n[//]: # "@exclude-table-of-contents"\n\n## No TOC\n');
  assert.equal(page.subtitle, 'Keep this guidance.');
  assert.deepEqual(page.metadata, { keywords: ['one'], robots: { index: false }, description: 'A description' });
  assert.deepEqual(page.links.slice(0, 3).map((l) => l.target), ['/solid/components/field?x=1#anatomy', '/solid/components/button#anatomy', '/upstream/react/overview/releases/v1-8-0']);
  assert.deepEqual(page.headings.map((h) => h.properties.id), ['title', 'controls', 'controls-1', 'controls-2', 'controls-3', 'no-toc']);
  assert.equal(page.headings[1].properties['data-heading-badge'], 'Preview');
  assert.equal(page.headings.at(-1).properties['data-exclude-toc'], '');
});

test('unknown nodes/imported custom nodes/expressions/metadata/spreads fail with source location', async () => {
  for (const source of [
    '# Title\n\n<Unknown />',
    "import Unknown from './new-renderer';\n\n<Unknown />",
    '# Title\n\n{globalThis.__docsSideEffect = true}',
    'export const metadata = globalThis.__docsSideEffect = true;',
    '# Title\n\n<kbd {...props}>K</kbd>',
    '# Title\n\n<kbd onClick="alert(1)">K</kbd>',
  ]) await assert.rejects(transform(source), /page\.mdx:\d+:\d+: (unsupported|executable)/);
  assert.equal(globalThis.__docsSideEffect, undefined);
});

test('React releases remain historical and are never package-renamed', async () => {
  const file = `${PUBLIC_ROOT}/overview/releases/v1-8-0/page.mdx`;
  const page = await transformPage("# v1.8.0\n\n```tsx\nimport { Button } from '@base-ui/react/button';\n```\n\n[Button](/react/components/button)\n", file, root);
  assert.equal(page.route, '/upstream/react/overview/releases/v1-8-0');
  assert.equal(page.disposition, 'upstream-react-history');
  assert.match(JSON.stringify(page.notice), /not releases or verified capabilities/);
  assert.match(flatten(page.ast).find((n) => n.type === 'code').value, /@base-ui\/react/);
  assert.equal(page.links[0].target, '/react/components/button');
});

test('CSS dependency parser handles nested values and preserves URL meaning', () => {
  assert.deepEqual(cssReferences('@import "./theme.css" layer(theme); .a { background: url("./image (1).svg"); src: url(/fonts/example.woff2) }', 'fixture.css').map((r) => r.value), ['./theme.css', './image (1).svg', '/fonts/example.woff2']);
});

test('entire offline snapshot verifies and two builds are byte-identical', async () => {
  const snapshot = await readSnapshot(root);
  const first = await buildPlan(root, snapshot);
  const second = await buildPlan(root, snapshot);
  assert.deepEqual(first, second);
  assert.equal(snapshot.records.filter((r) => r.kind === 'page').length, 84);
  assert(snapshot.records.filter((r) => r.kind === 'react-generated-api').every((r) => r.destination === null));
  for (const [file, content] of first) assert.equal(await fs.readFile(path.join(root, file), 'utf8'), content, file);
});

test('fixture mutation regenerates only its page and reports, preserving authored component docs and other mtimes', async (t) => {
  const snapshot = await readSnapshot(root);
  const before = await buildPlan(root, snapshot);
  const after = await buildPlan(root, snapshot, async (file) => {
    const value = await fs.readFile(path.join(root, file), 'utf8');
    return file === `${SNAPSHOT}/${button}` ? value.replace('# Button\n', '# Button fixture mutation\n') : value;
  });
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bsolid-content-mutation-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const authored = path.join(dir, 'docs/components/button/authored.mdx');
  await fs.mkdir(path.dirname(authored), { recursive: true });
  await fs.writeFile(authored, 'Authored component input — never regenerate.');
  for (const [file, value] of before) await writeChanged(dir, file, value);
  const unrelated = path.join(dir, 'docs/upstream/generated/pages/react/components/field/page.json');
  const beforeStat = await fs.stat(unrelated);
  const changed = [];
  for (const [file, value] of after) if (await writeChanged(dir, file, value)) changed.push(file);
  assert.deepEqual(changed, ['docs/upstream/generated/pages/react/components/button/page.json', 'docs/upstream-manifest.json']);
  assert.equal((await fs.stat(unrelated)).mtimeMs, beforeStat.mtimeMs);
  assert.equal(await fs.readFile(authored, 'utf8'), 'Authored component input — never regenerate.');
  await assert.rejects(writeChanged(dir, 'docs/components/button/authored.mdx', 'overwrite'), /Outside.*ownership/);
  await assert.rejects(writeChanged(dir, 'docs/upstream/../../components/button/authored.mdx', 'overwrite'), /Outside.*ownership/);
});

test('check is read-only, stale content and symlink escapes fail', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bsolid-content-check-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const target = 'docs/upstream/generated/fixture.json';
  await writeChanged(dir, target, 'old');
  await assert.rejects(writeChanged(dir, target, 'new', true), /Stale or missing/);
  assert.equal(await fs.readFile(path.join(dir, target), 'utf8'), 'old');
  const outside = path.join(dir, 'outside');
  await fs.mkdir(outside);
  await fs.symlink(outside, path.join(dir, 'docs/upstream/generated/escape'));
  await assert.rejects(writeChanged(dir, 'docs/upstream/generated/escape/file.json', 'escape'), /Refusing symlink/);
  await assert.rejects(writeChanged(dir, 'docs/upstream/generated/../../components/escape.json', 'escape'), /Unsafe path/);
  await assert.rejects(synchronize(dir, { check: true, importSource: true }), /mutually exclusive/);
  assert.equal(hash('old'), hash(await fs.readFile(path.join(dir, target))));
});

test('offline check succeeds without a checkout, then detects corruption and obsolete output', async (t) => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'bsolid-content-offline-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  await fs.cp(path.join(root, 'docs/upstream'), path.join(dir, 'docs/upstream'), { recursive: true });
  await fs.cp(path.join(root, 'docs/content/transforms'), path.join(dir, 'docs/content/transforms'), { recursive: true });
  await fs.mkdir(path.join(dir, 'docs/scripts/sync'), { recursive: true });
  await fs.copyFile(path.join(root, 'docs/scripts/sync/engine.mjs'), path.join(dir, 'docs/scripts/sync/engine.mjs'));
  await fs.copyFile(path.join(root, 'docs/upstream-manifest.json'), path.join(dir, 'docs/upstream-manifest.json'));
  // Only parser package resolution is shared. No canonical checkout, network, or source runtime.
  await fs.symlink(path.join(root, 'node_modules'), path.join(dir, 'node_modules'));
  await assert.rejects(fs.access(path.join(dir, 'upstream/base-ui')), /ENOENT/);
  assert.deepEqual((await synchronize(dir, { check: true })).changed, []);
  const originalPath = path.join(dir, SNAPSHOT, button);
  const original = await fs.readFile(originalPath);
  await fs.appendFile(originalPath, '\nCorruption\n');
  await assert.rejects(synchronize(dir, { check: true }), /Snapshot hash mismatch/);
  await fs.writeFile(originalPath, original);
  await fs.writeFile(path.join(dir, 'docs/upstream/generated/obsolete.json'), '{}');
  await assert.rejects(synchronize(dir, { check: true }), /Uninventoried generated file/);
  assert.equal(await fs.readFile(path.join(dir, 'docs/upstream/generated/obsolete.json'), 'utf8'), '{}');
});
