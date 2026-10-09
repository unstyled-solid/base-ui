import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { enrichReference } from '../content/api/guidance.mjs';
import { renderReference } from '../scripts/site/reference.mjs';

const root = new URL('../../', import.meta.url);
const catalog = JSON.parse(fs.readFileSync(new URL('docs/generated/api/catalog.json', root), 'utf8'));
const find = (module, name) => {
  const entry = catalog.modules.find(row => row.entrypoint === module)?.exports.find(row => row.name === name);
  assert.ok(entry, `${module}:${name}`);
  return entry;
};
const source = file => fs.readFileSync(new URL(`packages/solid/src/${file}`, root), 'utf8');
const freeze = object => {
  if (object && typeof object === 'object' && !Object.isFrozen(object)) {
    Object.freeze(object);
    Object.values(object).forEach(freeze);
  }
  return object;
};

test('real class/style guidance preserves the immutable canonical contract', () => {
  const original = freeze(structuredClone(find('./button', 'Button')));
  const before = JSON.stringify(original);
  const enriched = enrichReference(original);
  assert.notEqual(enriched, original);
  assert.equal(JSON.stringify(original), before);
  assert.equal(enriched.props.length, original.props.length);
  for (const row of original.props) {
    const changed = enriched.props.find(prop => prop.name === row.name);
    assert.equal(changed.type, row.type);
    assert.deepEqual(changed.default, row.default);
    assert.equal(changed.required, row.required);
    if (row.description) assert.equal(changed.description, row.description);
  }
  for (const name of ['class', 'style']) {
    const row = enriched.props.find(prop => prop.name === name);
    assert.match(row.description, /live component state/);
    assert.match(row.description, /Solid/);
    assert.equal(row.default.status, 'unavailable');
  }
  assert.match(source('utils/resolveClass.ts'), /typeof value === 'function' \? value\(state\) : value/);
  assert.match(source('utils/resolveStyle.ts'), /typeof value === 'function' \? value\(state\) : value/);
  assert.match(source('internals/createRenderElement.tsx'), /mergeClassNames\(resolved\(\)\.class, resolveClass/);
  assert.match(source('internals/createRenderElement.tsx'), /mergeStyles\(resolved\(\)\.style, resolveStyle/);
});

test('native render helper explains live props and refs, not React cloning', () => {
  const enriched = enrichReference(find('./use-render', 'createRender'));
  const render = enriched.props.find(prop => prop.name === 'render');
  assert.match(render.description, /\(props, state\) => JSX/);
  assert.match(render.description, /merged ref callback/);
  assert.match(render.description, /not a pre-created JSX element/);
  assert.match(enriched.props.find(prop => prop.name === 'ref').description, /native input ref/);
  assert.match(source('internals/contracts/render.ts'), /props: Live<RenderedProps<Props>>, state: Live<State>/);
  assert.match(source('internals/createRenderElement.tsx'), /render\(props, state\)/);
  assert.match(source('internals/contracts/render.ts'), /Output refs are the renderer's merged callback/);
});

test('unknown defaults are unavailable, not asserted absent', () => {
  const original = find('./button', 'Button');
  const html = renderReference(original);
  assert.match(html, /Default <code>—<\/code> means unavailable/);
  assert.match(html, /It does not mean there is no default/);
  assert.match(html, /class="ApiDefault">—<\/code>/);
  assert.equal(enrichReference(original).props.find(row => row.name === 'class').default.status, 'unavailable');
});

test('attribute guidance is family-specific and proven by emitted state', () => {
  const original = find('./popover', 'Popover.Trigger');
  const enriched = enrichReference(original);
  assert.equal(enriched.dataAttributes.length, original.dataAttributes.length);
  assert.match(enriched.dataAttributes.find(row => row.name === 'data-pressed').description, /open-change reason is trigger-press/);
  assert.match(enriched.dataAttributes.find(row => row.name === 'data-disabled').description, /this trigger is disabled/);
  const runtime = source('popover/trigger/PopoverTrigger.tsx');
  assert.match(runtime, /if \(!value\) return null/);
  assert.match(runtime, /openChangeReason === 'trigger-press'/);
  assert.match(runtime, /'data-popup-open': '', 'data-pressed': ''/);
  assert.match(source('internals/getStateAttributesProps.ts'), /value === true/);
  const unknown = enrichReference({ ...original, source: { file: 'packages/solid/src/unknown/Trigger.tsx' } });
  assert.deepEqual(unknown.dataAttributes, original.dataAttributes);
  const fabricated = enrichReference({ ...original, dataAttributes: [{ name: 'data-fantasy', description: '' }] });
  assert.equal(fabricated.dataAttributes[0].description, '');
  const positioner = enrichReference(find('./popover', 'Popover.Positioner'));
  assert.match(positioner.dataAttributes.find(row => row.name === 'data-side').description, /Resolved side/);
  assert.match(source('popover/positioner/PopoverPositioner.tsx'), /get side\(\) \{ return positioning.side; \}/);
  assert.match(source('utils/createPositioner.tsx'), /stateAttributesMapping: popupStateMapping/);
});

test('recursive helper/related enrichment preserves any and does not invent ref behavior', () => {
  const row = { name: 'class', type: 'any', description: '', required: true, default: { status: 'unavailable', value: null }, source: { file: 'packages/solid/build/types/internals/contracts/render.d.ts' } };
  const entry = freeze({ name: 'Example', props: [row], properties: [row], parameters: [row], related: [{ name: 'Example.State', properties: [row] }], returnValue: { type: 'any', properties: [row, { name: 'store', type: 'any', description: '' }] } });
  const enriched = enrichReference(entry);
  for (const changed of [enriched.props[0], enriched.properties[0], enriched.parameters[0], enriched.related[0].properties[0], enriched.returnValue.properties[0]]) {
    assert.match(changed.description, /CSS classes/);
    assert.equal(changed.type, 'any');
    assert.equal(changed.required, true);
    assert.deepEqual(changed.default, row.default);
  }
  assert.equal(enriched.returnValue.type, 'any');
  assert.equal(enriched.returnValue.properties[1].description, '');
  const react = { name: 'ReactThing', props: [{ name: 'ref', type: 'React.Ref<HTMLElement>', description: '', source: { file: 'upstream/base-ui/Thing.tsx' } }, { ...row, source: { file: 'upstream/base-ui/Thing.tsx' } }] };
  assert.deepEqual(enrichReference(react), react);
  assert.equal(entry.props[0].description, '');
});

test('collapsible guidance preserves the root/trigger disabled distinction and find-in-page behavior', () => {
  const trigger = enrichReference(find('./collapsible', 'Collapsible.Trigger'));
  assert.match(trigger.props.find(row => row.name === 'disabled').description, /Overrides the root/);
  assert.deepEqual(trigger.dataAttributes.map(row => row.name), find('./collapsible', 'Collapsible.Trigger').dataAttributes.map(row => row.name));
  const declaredDisabled = enrichReference({ ...trigger, dataAttributes: [{ name: 'data-disabled', description: '' }] });
  assert.match(declaredDisabled.dataAttributes[0].description, /root’s disabled state/);
  assert.match(source('collapsible/trigger/CollapsibleTrigger.tsx'), /props.disabled \?\? context.disabled/);
  assert.match(source('collapsible/trigger/CollapsibleTrigger.tsx'), /state: context.state/);
  const panel = enrichReference(find('./collapsible', 'Collapsible.Panel'));
  assert.match(panel.props.find(row => row.name === 'hiddenUntilFound').description, /beforematch/);
  assert.match(source('collapsible/panel/createCollapsiblePanel.ts'), /p.keepMounted \|\| p.hiddenUntilFound \|\| p.mounted \|\| p.open/);
  assert.match(source('collapsible/panel/createCollapsiblePanel.ts'), /addEventListener\('beforematch'/);
});

test('real handle declarations retain canonical any fields', () => {
  const handle = find('./popover', 'Popover.Handle');
  assert.ok(handle);
  const enriched = enrichReference(handle);
  assert.deepEqual(enriched.properties.map(row => row.type), handle.properties.map(row => row.type));
  assert.ok(handle.properties.some(row => row.type === 'any'), 'fixture must exercise actual any declaration');
  assert.match(renderReference(handle), /<code class="ApiType">any<\/code>/);
});

test('only referenced state/event details render, canonical aliases do not repeat', () => {
  const common = { kind: 'type', source: { file: 'state.d.ts', line: 1 }, properties: [{ name: 'open', type: 'boolean', description: 'Whether open.', required: true }] };
  const entry = { name: 'Example', kind: 'component', props: [{ name: 'render', type: 'ComponentRenderFn<HTMLProps, ExampleState | Example.State>', description: '', links: [] }], related: [
    { ...common, name: 'ExampleState', anchor: 'state' },
    { ...common, name: 'Example.State', anchor: 'alias', canonicalAnchor: 'state', source: { file: 'alias.d.ts', line: 2 } },
    { ...common, name: 'UnrelatedState', anchor: 'unused', source: { file: 'other.d.ts', line: 1 } },
    { ...common, name: 'ExampleProps', anchor: 'props' },
  ] };
  const html = renderReference(entry);
  assert.equal((html.match(/Whether open\./g) ?? []).length, 1);
  assert.doesNotMatch(html, /<p><code>UnrelatedState<\/code>/);
  assert.doesNotMatch(html, /<p><code>ExampleProps<\/code>/);
});
