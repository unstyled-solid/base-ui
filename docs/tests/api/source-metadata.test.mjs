import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { sourceMetadata } from '../../scripts/api/source-metadata.mjs';
import { extract } from '../../scripts/api/engine.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const partFiles = {
  CollapsibleRoot: 'collapsible/root/CollapsibleRoot',
  CollapsiblePanel: 'collapsible/panel/CollapsiblePanel',
  CollapsibleTrigger: 'collapsible/trigger/CollapsibleTrigger',
};
async function collector(project = root) {
  const nodes = {};
  for (const [name, file] of Object.entries(partFiles)) {
    const declaration = path.join(project, `packages/solid/build/types/${file}.d.ts`);
    const ast = ts.createSourceFile(declaration, await fs.readFile(declaration, 'utf8'), ts.ScriptTarget.Latest, true);
    nodes[name] = ast.statements.find(stmt => ts.isFunctionDeclaration(stmt) && stmt.name.text === name);
  }
  const metadata = await sourceMetadata(project, Object.values(nodes).map(node => node.getSourceFile().fileName));
  return { metadata, nodes, attributes: name => metadata.attributes(nodes[name]) };
}
const byName = (rows, name) => rows.find(row => row.name === name);

test('actual Collapsible Root/Panel default-state attributes retain runtime provenance', async () => {
  const c = await collector();
  for (const name of ['CollapsibleRoot', 'CollapsiblePanel']) {
    const rows = await c.attributes(name);
    const disabled = byName(rows, 'data-disabled');
    assert.ok(disabled, name);
    assert.equal(disabled.description, 'Present when disabled is truthy.');
    assert.match(disabled.source.file, new RegExp(`${name}\\.tsx$`));
    assert.equal(disabled.emissionSource.file, 'packages/solid/src/internals/getStateAttributesProps.ts');
    assert.equal(rows.filter(row => row.name === 'data-disabled').length, 1);
    assert.ok(!byName(rows, 'data-transitionstatus'), 'custom mapping must suppress the default attribute');
  }
  assert.ok(!byName(await c.attributes('CollapsibleTrigger'), 'data-disabled'), 'unrequested Trigger is not broadened');
  assert.ok(c.metadata.inputs.has(path.join(root, 'packages/solid/src/internals/getStateAttributesProps.ts')));
  const defaults = await c.metadata.defaults(c.nodes.CollapsibleRoot);
  assert.equal(defaults.get('disabled').value, 'false');
  assert.equal(defaults.has('open'), false, 'controlled state has no invented default');
});

test('actual Panel starting-style describes both transition mapping and retained find-in-page style', async () => {
  const c = await collector();
  const panel = byName(await c.attributes('CollapsiblePanel'), 'data-starting-style');
  assert.equal(panel.description, "Present when transitionStatus is 'starting'. Also retained when hiddenUntilFound is true and open is false and mounted is false and animationType() is not 'css-animation'.");
  assert.equal(panel.source.file, 'packages/solid/src/collapsible/panel/createCollapsiblePanel.ts');
  assert.equal(panel.mappingSource.file, 'packages/solid/src/internals/stateAttributesMapping.ts');
  const rootRow = byName(await c.attributes('CollapsibleRoot'), 'data-starting-style');
  assert.equal(rootRow.description, "Present when transitionStatus is 'starting'.");
});

test('in-memory API extraction exposes the two corrections without generating shared files', async () => {
  const catalog = await extract({ root, entries: [{ entrypoint: './collapsible', file: path.join(root, 'packages/solid/build/types/collapsible/index.d.ts') }] });
  const get = name => catalog.modules[0].exports.find(row => row.name === name);
  for (const name of ['Collapsible.Root', 'Collapsible.Panel']) assert.ok(byName(get(name).dataAttributes, 'data-disabled'), name);
  const starting = byName(get('Collapsible.Panel').dataAttributes, 'data-starting-style');
  assert.match(starting.description, /hiddenUntilFound is true and open is false and mounted is false/);
  assert.match(starting.descriptionSource.file, /createCollapsiblePanel\.ts$/);
  assert.equal(get('Collapsible.Root').props.find(row => row.name === 'open').default.status, 'unavailable');
  assert.equal(get('Collapsible.Panel').props.find(row => row.name === 'class').default.status, 'unavailable');
  assert.ok(catalog.inputs.some(row => row.file === 'packages/solid/src/internals/getStateAttributesProps.ts'));
});

// Mutations happen only in a temporary copy of the actual source; never in the
// library, pinned upstream, declarations or generated catalog in the workspace.
async function scratchSource(run) {
  const scratch = await fs.mkdtemp('/private/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode/collapsible-metadata-');
  try {
    const files = [
      ...Object.values(partFiles).map(file => `packages/solid/build/types/${file}.d.ts`),
      ...Object.values(partFiles).map(file => `packages/solid/src/${file}.tsx`),
      ...['internals/createRenderElement.tsx', 'internals/getStateAttributesProps.ts', 'internals/stateAttributesMapping.ts', 'internals/TransitionStatusDataAttributes.ts', 'collapsible/root/stateAttributesMapping.ts', 'collapsible/panel/createCollapsiblePanel.ts'].map(file => `packages/solid/src/${file}`),
    ];
    for (const file of files) {
      await fs.mkdir(path.dirname(path.join(scratch, file)), { recursive: true });
      await fs.copyFile(path.join(root, file), path.join(scratch, file));
    }
    const change = async (file, from, to) => {
      const target = path.join(scratch, `packages/solid/src/${file}`);
      const original = await fs.readFile(target, 'utf8');
      assert.ok(original.includes(from), from);
      await fs.writeFile(target, original.replace(from, to));
    };
    await run(scratch, change);
  } finally { await fs.rm(scratch, { recursive: true, force: true }); }
}

test('default attributes require actual state members, an uncustomized mapping and the traversed emitter', async () => {
  await scratchSource(async (scratch, change) => {
    await change('collapsible/root/CollapsibleRoot.tsx', 'get disabled() { return disclosure.disabled; },', '');
    assert.ok(!byName(await (await collector(scratch)).attributes('CollapsibleRoot'), 'data-disabled'));
  });
  await scratchSource(async (scratch, change) => {
    await change('collapsible/root/stateAttributesMapping.ts', '  ...transitionStatusMapping,', '  disabled: null,\n  ...transitionStatusMapping,');
    assert.ok(!byName(await (await collector(scratch)).attributes('CollapsiblePanel'), 'data-disabled'));
  });
  await scratchSource(async (scratch, change) => {
    await change('internals/getStateAttributesProps.ts', 'data-${key.toLowerCase()}', 'data-derived-${key.toLowerCase()}');
    await change('internals/getStateAttributesProps.ts', 'data-${key.toLowerCase()}', 'data-derived-${key.toLowerCase()}');
    const rows = await (await collector(scratch)).attributes('CollapsibleRoot');
    assert.ok(!byName(rows, 'data-disabled'));
    assert.ok(byName(rows, 'data-derived-disabled'), 'spelling must come from the emitter template');
  });
  await scratchSource(async (scratch, change) => {
    await change('internals/createRenderElement.tsx', 'getStateAttributesProps(state as', 'notTheEmitter(state as');
    assert.ok(!byName(await (await collector(scratch)).attributes('CollapsibleRoot'), 'data-disabled'));
  });
});

test('retained-style explanation requires the actual predicate and forwarded panel props', async () => {
  await scratchSource(async (scratch, change) => {
    await change('collapsible/panel/createCollapsiblePanel.ts', 'p.hiddenUntilFound && hidden() &&', 'unprovenRuntimeCondition() && hidden() &&');
    const row = byName(await (await collector(scratch)).attributes('CollapsiblePanel'), 'data-starting-style');
    assert.equal(row.description, "Present when transitionStatus is 'starting'.");
  });
  await scratchSource(async (scratch, change) => {
    await change('collapsible/panel/CollapsiblePanel.tsx', '      panel.props,', '      unrelatedProps,');
    const row = byName(await (await collector(scratch)).attributes('CollapsiblePanel'), 'data-starting-style');
    assert.equal(row.description, "Present when transitionStatus is 'starting'.");
  });
});
