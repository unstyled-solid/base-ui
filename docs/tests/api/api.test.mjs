import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { extract, generate, anchor, markdown } from '../../scripts/api/engine.mjs';
import { renderReference } from '../../scripts/site/reference.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const fixture = path.join(root, 'docs/tests/api/fixtures/index.d.ts');
const options = { root, entries: [{ entrypoint: './fixture', file: fixture }] };
test('checker resolves single, compound, generic, aliases, native events, namespaces and types-only exports', async () => {
  const a = await extract(options);
  const exports = a.modules[0].exports;
  const get = (n) => exports.find((e) => e.name === n);
  assert.equal(get('Action').kind, 'component');
  assert.equal(get('Compound.Root').kind, 'component');
  assert.match(get('Generic').signatures[0], /<T>/);
  assert.equal(get('AliasedAction').aliasOf, 'Action');
  assert.equal(get('OnlyType').kind, 'type');
  assert.equal(get('helper').kind, 'helper');
  assert.equal(get('helper').props[0].name, 'value');
  assert.equal(get('helper').returnValue.type, 'number');
  assert.ok(!get('Action').props.some(p => /^(prop|attr|on|oncapture|bind):/.test(p.name)));
  assert.deepEqual(get('Action').props.find((p) => p.name === 'disabled').default, { status: 'documented', value: 'false' });
  assert.match(get('ChangeDetails').properties.find((p) => p.name === 'event').type, /MouseEvent/);
  assert.ok(get('Action').inheritedDOM.includes('title'));
  assert.equal(get('Action').dataAttributes[0].name, 'data-disabled');
  assert.equal(get('Action').cssVariables[0].name, '--action-width');
  assert.ok(get('Action').props.find((p) => p.name === 'onChange').links.some((l) => l.name === 'ChangeDetails'));
  assert.ok(get('Action').source.file.endsWith('index.d.ts'));
  assert.equal(JSON.stringify(a), JSON.stringify(await extract(options)));
  const typesOnly = await extract({ root, entries: [{ entrypoint: './types', file: path.join(path.dirname(fixture), 'types.d.ts') }] });
  assert.ok(typesOnly.modules[0].exports.every((e) => e.kind === 'type'));
  const md = markdown(a.modules[0]);
  const ids = [...md.matchAll(/id="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of md.matchAll(/\]\(#([^)]*)\)/g)) assert.ok(md.includes(`id="${match[1]}"`), match[1]);
});
test('read-only paired source supplies omitted JSDoc, forwarded defaults, local metadata and exact attribute conditions', async () => {
  const scratch = await fs.mkdtemp(path.join(root, 'docs/tests/api/fixtures/scratch-'));
  try {
    const declarations = path.join(scratch, 'packages/solid/build/types/disclosure');
    const sources = path.join(scratch, 'packages/solid/src/disclosure');
    await fs.mkdir(declarations, { recursive: true });
    await fs.mkdir(sources, { recursive: true });
    const file = path.join(declarations, 'DisclosureRoot.d.ts');
    await fs.writeFile(file, `import type { JSX } from '@solidjs/web';
export declare function DisclosureRoot(props: DisclosureRootProps): JSX.Element;
export interface DisclosureRootProps { defaultOpen?: boolean; disabled?: boolean; keepMounted?: boolean; nativeButton?: boolean; dynamic?: boolean; render?: (props: {}, state: { open: boolean }) => JSX.Element }
export declare namespace DisclosureRoot { type Props = DisclosureRootProps; }
export { DisclosureRoot as Alias };
`);
    await fs.writeFile(path.join(declarations, 'DisclosureRootDataAttributes.d.ts'), `export declare const open: 'data-open';\n`);
    await fs.writeFile(path.join(sources, 'DisclosureRootDataAttributes.ts'), `/** Retained local attribute prose. */\nexport const open = 'data-open';\n`);
    await fs.writeFile(path.join(sources, 'createDisclosureRoot.ts'), `export function createDisclosureRoot(parameters: any) { return parameters.defaultOpen ?? false; }`);
    await fs.writeFile(path.join(sources, 'DisclosureRoot.tsx'), `import { createDisclosureRoot } from './createDisclosureRoot';
throw new Error('Source modules must never execute');
const stateAttributes = { open: (open: boolean) => ({ [open ? 'data-open' : 'data-closed']: '' }), transitionStatus: (status: string) => status === 'starting' ? { 'data-starting-style': '' } : status === 'ending' ? { 'data-ending-style': '' } : null, hidden: (hidden: boolean) => hidden ? { 'data-never': undefined } : null };
/** Source-only description. */
export function DisclosureRoot(props: DisclosureRootProps) {
  createDisclosureRoot(props);
  const disabled = props.disabled ?? false;
  const keepMounted = props.keepMounted ?? false;
  const native = props.nativeButton ?? true;
  const dynamic = props.dynamic ?? context.disabled;
  return createRenderElement('div', props, { stateAttributesMapping: stateAttributes });
}
export interface DisclosureRootProps {
  defaultOpen?: boolean;
  /** Ignore interaction. @default false */
  disabled?: boolean;
  keepMounted?: boolean;
  nativeButton?: boolean;
  dynamic?: boolean;
}
export namespace DisclosureRoot { export type Props = DisclosureRootProps; }
`);
    const catalog = await extract({ root: scratch, entries: [{ entrypoint: './disclosure', file }] });
    const entry = catalog.modules[0].exports.find(e => e.name === 'DisclosureRoot');
    const prop = name => entry.props.find(p => p.name === name);
    assert.equal(entry.description, 'Source-only description.');
    assert.equal(prop('disabled').description, 'Ignore interaction.');
    assert.equal(prop('disabled').default.status, 'documented');
    assert.equal(prop('defaultOpen').default.value, 'false');
    assert.match(prop('defaultOpen').default.source.file, /createDisclosureRoot.ts$/);
    assert.equal(prop('keepMounted').default.value, 'false');
    assert.equal(prop('nativeButton').default.value, 'true');
    assert.equal(prop('dynamic').default.status, 'unavailable');
    assert.deepEqual(entry.dataAttributes.map(r => r.name), ['data-open', 'data-closed', 'data-starting-style', 'data-ending-style']);
    assert.equal(entry.dataAttributes[0].description, 'Retained local attribute prose.');
    assert.equal(entry.dataAttributes[1].description, 'Present when open is false.');
    assert.equal(entry.dataAttributes[3].description, "Present when transitionStatus is 'ending'.");
    assert.ok(catalog.inputs.some(i => i.file.endsWith('createDisclosureRoot.ts')));
    assert.equal(catalog.modules[0].exports.find(e => e.name === 'Alias').props.find(p => p.name === 'defaultOpen').default.value, 'false');
    assert.equal(JSON.stringify(catalog), JSON.stringify(await extract({ root: scratch, entries: [{ entrypoint: './disclosure', file }] })));
    await fs.writeFile(path.join(sources, 'createDisclosureRoot.ts'), `export function createDisclosureRoot(parameters: any) { return parameters.defaultOpen ?? true; }`);
    const changed = await extract({ root: scratch, entries: [{ entrypoint: './disclosure', file }] });
    assert.equal(changed.modules[0].exports.find(e => e.name === 'DisclosureRoot').props.find(p => p.name === 'defaultOpen').default.value, 'true');
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
});
test('compact renderer retains compatibility anchors, full optional types and accurate callable unions without recursive tables', () => {
  const entry = { name: 'Disclosure.Root', kind: 'component', anchor: anchor('Disclosure.Root'), props: [
    { name: 'style', type: 'string | JSX.CSSProperties | JSX.RemoveAttribute | ((state: State) => string)', anchor: anchor('style'), default: { status: 'unavailable' } },
    { name: 'onChange', type: '((event: Event | undefined) => void) | undefined', anchor: anchor('onChange') },
    { name: 'render', type: 'ComponentRenderFn<Props, State> | undefined', anchor: anchor('render') },
  ], compatibilityAnchors: [anchor('Disclosure.Root.$props.prop:align')], related: [
    { name: 'Disclosure.Root.Props', anchor: anchor('Disclosure.Root.Props'), properties: [{ name: 'disabled', anchor: anchor('Disclosure.Root.Props.disabled') }] },
    { name: 'State', anchor: anchor('State'), type: 'State', properties: [{ name: 'open', type: 'boolean', required: true }] },
    { name: 'ReturnValue', anchor: anchor('ReturnValue'), compatibilityAlias: 'Toast.useToastManager', properties: [{ name: 'promise', anchor: anchor('promise') }] },
  ] };
  const html = renderReference(entry);
  assert.match(html, /string \| CSSProperties \| RemoveAttribute \| function/);
  assert.match(html, /event: Event \| undefined/);
  assert.match(html, /ToastuseToastManager-promise/);
  assert.ok(html.includes(`id="${anchor('Disclosure.Root.$props.prop:align')}"`));
  assert.equal((html.match(/class="ApiRow"/g) ?? []).length, 3);
  assert.ok(!html.includes('SiteRelatedType'));
  assert.ok(!html.includes('Props</code>'));
  assert.match(html, /open: boolean;/);
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
});
test('mutation updates tables, stable existing anchors, check detects drift, missing metadata fails', async () => {
  const scratch = await fs.mkdtemp(path.join(root, 'docs/tests/api/fixtures/scratch-'));
  try {
    const file = path.join(scratch, 'index.d.ts');
    const original = await fs.readFile(fixture, 'utf8');
    await fs.writeFile(file, original);
    const opts = { root, entries: [{ entrypoint: './fixture', file }], output: path.join(scratch, 'output') };
    const before = await generate(opts);
    await generate({ ...opts, check: true });
    await fs.writeFile(file, original.replace('disabled?: boolean;', 'disabled?: boolean;\n  /** A new property. */\n  fresh?: number;'));
    await assert.rejects(generate({ ...opts, check: true }), /Stale/);
    const after = await generate(opts);
    assert.notEqual(JSON.stringify(before), JSON.stringify(after));
    assert.equal(after.modules[0].exports.find((e) => e.name === 'Action').props.find((p) => p.name === 'fresh').anchor, anchor('Action.$props.fresh'));
    await generate({ ...opts, check: true });
    await assert.rejects(extract({ ...opts, requiredMetadata: ['cssVariables'] }), /missing required cssVariables/);
    await fs.writeFile(file, original.replace('MouseEvent', 'MissingNativeEvent'));
    await assert.rejects(extract(opts), /MissingNativeEvent/);
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
});
