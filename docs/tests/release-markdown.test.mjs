import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { markdownPage } from '../scripts/site/markdown.mjs';
import { adaptPage } from '../content/handbooks/overlays.mjs';

const text = value => ({ type: 'text', value });
const paragraph = value => ({ type: 'paragraph', children: [text(value)] });
function fixture(children, records = []) {
  return { source: 'fixture.mdx', route: '/solid/components/button', headings: [], sourceNodes: records, ast: { type: 'root', children } };
}
function component(handler, name, reference, line = 1) {
  return [{ type: 'mdxJsxFlowElement', name, position: { start: { line, column: 1 } }, data: { handler }, children: [] }, { location: `fixture.mdx:${line}:1`, name, handler, reference, attributes: {} }];
}

test('retains React context and safely fences literal code', () => {
  const output = markdownPage(fixture([{ type: 'code', lang: 'tsx', value: 'const x = "```";\nReact.useState();', data: { frameworkContext: 'Upstream React integration code' } }]));
  assert.match(output, /\*\*Upstream React integration code\*\*/);
  assert.match(output, /````tsx\nconst x = "```";\nReact.useState\(\);\n````/);
});

test('excluded and missing demos never masquerade as mounted demos', () => {
  const [node, record] = component('demo', 'Demo', '/handbook/react-hook-form');
  const output = markdownPage(fixture([node], [record]));
  assert.match(output, /not a Solid interactive demo/);
  assert.match(output, /\[Solid documentation\]\(\/solid\/components\/form\)/);
  assert.doesNotMatch(output, /Open mounted|Interactive example/);
  record.reference = 'missing';
  assert.match(markdownPage(fixture([node], [record])), /No mounted Solid demo is registered/);
  record.reference = 'button/hero';
  assert.match(markdownPage(fixture([node], [record]), { demos: [{ id: 'button/hero', variants: [{}], anchor: 'hero' }] }), /\[Open mounted Solid demo: button\/hero\]\(\/solid\/components\/button#hero\)/);
});

test('reference definitions, table alignment, task and ordered lists survive', () => {
  const output = markdownPage(fixture([
    { type: 'paragraph', children: [{ type: 'linkReference', identifier: 'docs', children: [text('Docs')] }] },
    { type: 'definition', identifier: 'docs', url: '/solid/overview', title: 'Overview' },
    { type: 'table', align: ['left', 'right'], children: ['Header', 'a|b\nc'].map(value => ({ type: 'tableRow', children: [value, 'Other'].map(v => ({ type: 'tableCell', children: [text(v)] })) })) },
    { type: 'list', ordered: true, start: 3, children: [{ type: 'listItem', checked: true, children: [paragraph('Done'), { type: 'list', children: [{ type: 'listItem', children: [paragraph('Nested')] }] }] }] },
  ]));
  assert.match(output, /\[Docs\]\[docs\]/);
  assert.match(output, /\[docs\]: \/solid\/overview "Overview"/);
  assert.match(output, /\| :--- \| ---: \|/);
  assert.match(output, /a\\\|b<br>c/);
  assert.match(output, /3\. \[x\] Done/);
  assert.match(output, /\n   - Nested/);
});

test('Solid APIs include defaults, requiredness, metadata, helpers and related declarations once', () => {
  const [node, record] = component('api', 'TypesButton.Root', 'button');
  const props = [{ name: 'value', type: 'string | number', required: true, default: { status: 'unavailable' }, description: 'Line one\nLine two' }];
  const api = { modules: [{ entrypoint: './button', exports: [
    { name: 'Button.Root', kind: 'helper', anchor: 'button-root', props, type: '(value: string) => Result', returnValue: { type: 'Result', properties: props }, dataAttributes: [{ name: 'data-active', description: 'Active' }], cssVariables: [{ name: '--size', description: 'Size' }] },
    { name: 'Button.RootState', kind: 'type', type: '{ active: boolean }', properties: [] },
  ] }] };
  const output = markdownPage(fixture([node, node], [record]), { api });
  assert.match(output, /\| value \| `string \\\| number` \| Yes \| Unavailable \| Line one<br>Line two \|/);
  for (const value of ['Parameters', 'Return value', 'data-active', '--size', 'Related exported type: Button.RootState', '{ active: boolean }']) assert.ok(output.includes(value), value);
  assert.equal(output.split('### Button.Root\n').length, 2);
});

test('captured adapted Button page uses real generated Solid declarations', async () => {
  const page = adaptPage(JSON.parse(await fs.readFile(new URL('../upstream/generated/pages/react/components/button/page.json', import.meta.url), 'utf8')));
  const api = JSON.parse(await fs.readFile(new URL('../generated/api/catalog.json', import.meta.url), 'utf8'));
  const output = markdownPage(page, { api });
  assert.match(output, /Required \| Default/);
  assert.match(output, /packages\/solid\/build\/types/);
  assert.match(output, /Data attributes/);
  assert.doesNotMatch(output, /Interactive example/);
});

test('all captured page ASTs have bounded Markdown handlers', async () => {
  const root = new URL('../upstream/generated/pages/', import.meta.url);
  const files = await fs.readdir(root, { recursive: true });
  const api = JSON.parse(await fs.readFile(new URL('../generated/api/catalog.json', import.meta.url), 'utf8'));
  const catalog = JSON.parse(await fs.readFile(new URL('../generated/demos/catalog.json', import.meta.url), 'utf8'));
  for (const file of files.filter(file => file.endsWith('.json'))) {
    const page = adaptPage(JSON.parse(await fs.readFile(new URL(file, root), 'utf8')));
    assert.doesNotThrow(() => markdownPage(page, { api, demos: catalog.entries, demoReferences: catalog.references }), file);
  }
});
