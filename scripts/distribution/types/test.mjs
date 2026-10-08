import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { buildTypes } from './build.mjs';
import { assertDiagnostics, assertExportMap, conditionalExports, contracts, fixtureRoot, packageRoot, readJson, typesRoot } from './shared.mjs';

const temporaryRoot = '/var/folders/k1/dqkw16gn09q6492v5jn1x_jc0000gn/T/opencode';
const optional = new Set(['date-fns', '@date-fns/tz', 'luxon', '@types/luxon']);

// Copy installed peer/dependency artifacts, never workspace links. Each consumer has
// its own node_modules outside repository/ancestor dependency resolution.
async function copyDependencies(directory, names) {
  const copied = new Map();
  async function copy(name, from) {
    assert(!/^(react|react-dom|@types\/react)/.test(name), `React dependency ${name}`);
    const require = createRequire(path.join(from, 'package.json'));
    let packageFile;
    try { packageFile = require.resolve(`${name}/package.json`); }
    catch {
      let location = path.dirname(require.resolve(name));
      while (true) {
        try {
          const candidate = path.join(location, 'package.json');
          if ((await readJson(candidate)).name === name) { packageFile = candidate; break; }
        } catch { /* Continue to the installed package boundary. */ }
        const parent = path.dirname(location);
        if (parent === location) throw new Error(`Cannot locate installed dependency ${name}`);
        location = parent;
      }
    }
    const source = await fs.realpath(path.dirname(packageFile));
    const metadata = await readJson(path.join(source, 'package.json'));
    if (copied.has(name)) { assert.equal(copied.get(name), metadata.version, `Conflicting installed versions of ${name}`); return; }
    copied.set(name, metadata.version);
    const target = path.join(directory, 'node_modules', name);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.cp(source, target, { recursive: true, dereference: true, filter: (file) => !path.relative(source, file).split(path.sep).includes('node_modules') });
    const dependencies = { ...metadata.dependencies, ...Object.fromEntries(Object.entries(metadata.peerDependencies ?? {}).filter(([peer]) => !metadata.peerDependenciesMeta?.[peer]?.optional)) };
    for (const dependency of Object.keys(dependencies)) await copy(dependency, source);
  }
  for (const name of names) await copy(name, packageRoot);
  return copied;
}

function options(mode) {
  return {
    target: ts.ScriptTarget.ES2022,
    lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    module: mode === 'NodeNext' ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
    moduleResolution: mode === 'NodeNext' ? ts.ModuleResolutionKind.NodeNext : ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve, jsxImportSource: '@solidjs/web',
    strict: true, skipLibCheck: false, types: [], noEmit: true, verbatimModuleSyntax: true,
  };
}

function check(files, mode) {
  const program = ts.createProgram(files, options(mode));
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const sources = program.getSourceFiles().map((source) => source.fileName);
  for (const source of sources) {
    assert(!source.startsWith(packageRoot), `Consumer reached checkout source: ${source}`);
    assert(!/node_modules\/(?:@types\/react|react|react-dom)(?:\/|$)/.test(source), `Consumer loaded React: ${source}`);
  }
  return { program, diagnostics, sources };
}

async function assertNegative(directory, mode, name, source, expectedCodes) {
  const file = path.join(directory, `${name}.tsx`);
  await fs.writeFile(file, source);
  const { diagnostics } = check([file], mode);
  assert(diagnostics.length > 0, `${mode}: ${name} must reject invalid API usage`);
  assertDiagnostics(diagnostics.filter((diagnostic) => diagnostic.file?.fileName !== file || !expectedCodes.includes(diagnostic.code)), `${mode}: unexpected negative-fixture diagnostic`);
}

async function consumer(kind, contract, pkg, metadata) {
  const directory = await fs.realpath(await fs.mkdtemp(path.join(temporaryRoot, `bsolid-types-${kind}-`)));
  try {
    const installed = path.join(directory, 'node_modules', pkg.identity.workspaceName);
    await fs.mkdir(installed, { recursive: true });
    await fs.cp(typesRoot, path.join(installed, 'types'), { recursive: true });
    const exports = conditionalExports(contract, pkg);
    // Test-local contract manifest. No modification of the concurrent build manifest.
    await fs.writeFile(path.join(installed, 'package.json'), JSON.stringify({ name: pkg.identity.workspaceName, version: pkg.identity.version, private: true, type: 'module', exports }));
    await fs.writeFile(path.join(directory, 'package.json'), JSON.stringify({ private: true, type: 'module' }));
    const baseline = [...Object.keys(metadata.dependencies ?? {}), 'solid-js', '@solidjs/web'];
    const additions = kind === 'date-fns' ? ['date-fns', '@date-fns/tz'] : kind === 'luxon' ? ['luxon', '@types/luxon'] : [];
    const dependencies = await copyDependencies(directory, [...baseline, ...additions]);
    for (const peer of optional) assert.equal(dependencies.has(peer), additions.includes(peer), `${kind}: optional peer isolation ${peer}`);
    const fixture = path.join(directory, 'consumer.tsx');
    await fs.copyFile(path.join(fixtureRoot, `${kind}.fixture.txt`), fixture);
    const keys = Object.entries(contract.exports).filter(([key]) => kind === 'ordinary' ? !key.includes('temporal-adapter-') : key === `./internals/temporal-adapter-${kind}`);
    const all = path.join(directory, 'entrypoints.ts');
    await fs.writeFile(all, keys.map(([key], index) => `import type * as Entry${index} from '${pkg.identity.workspaceName}${key === '.' ? '' : key.slice(1)}';\nexport type Public${index} = typeof Entry${index};`).join('\n'));
    for (const mode of ['Bundler', 'NodeNext']) {
      const { diagnostics, sources } = check([fixture, all], mode);
      assertDiagnostics(diagnostics, `${kind} ${mode} independent consumer`);
      if (kind === 'ordinary') {
        assert(!sources.some((source) => /temporal-adapter-(luxon|date-fns)|node_modules\/(luxon|date-fns|@date-fns|@types\/luxon)(?:\/|$)/.test(source)), `${mode}: root/ordinary graph traverses optional adapters`);
        await assertNegative(directory, mode, 'generic', "import { Combobox } from 'baseui-solid2/combobox';\nconst props: Combobox.Root.Props<{ id: number }, true> = { multiple: true, value: { id: 1 } };", [2353, 2322]);
        await assertNegative(directory, mode, 'native-ref', "import { Button } from 'baseui-solid2/button';\nconst props: Button.Props = { ref: (element: SVGSVGElement) => {} };", [2322]);
        await assertNegative(directory, mode, 'event-discrimination', "import type { BaseUIChangeEventDetails } from 'baseui-solid2/types';\nfunction invalid(details: BaseUIChangeEventDetails<'escape-key' | 'trigger-focus'>) { if (details.reason === 'escape-key') { const wrong: FocusEvent = details.event; } }", [2741, 2739, 2322]);
        await assertNegative(directory, mode, 'render-state', "import { Button } from 'baseui-solid2/button';\nconst props: Button.Props = { render: (props, state) => { const wrong: string = state.disabled; return null; } };", [2322]);
        await assertNegative(directory, mode, 'private-export', "import type * as Private from 'baseui-solid2/internals/contracts';\nexport type Hidden = typeof Private;", [2307]);
        for (const adapter of ['date-fns', 'luxon']) {
          const file = path.join(directory, `missing-${adapter}.ts`);
          await fs.writeFile(file, `import { TemporalAdapter${adapter === 'luxon' ? 'Luxon' : 'DateFns'} } from 'baseui-solid2/internals/temporal-adapter-${adapter}';\nnew TemporalAdapter${adapter === 'luxon' ? 'Luxon' : 'DateFns'}();`);
          const missing = check([file], mode).diagnostics;
          assert(missing.some((diagnostic) => diagnostic.code === 2307 && /luxon|date-fns/.test(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))), `${mode}: imported ${adapter} without peers must fail`);
          assertDiagnostics(missing.filter((diagnostic) => diagnostic.code !== 2307), `${mode}: unexpected missing adapter diagnostic`);
        }
      }
      // Every public module must resolve to the exact types-first conditional path.
      for (const [key] of keys) {
        const specifier = `${pkg.identity.workspaceName}${key === '.' ? '' : key.slice(1)}`;
        const conditions = ['types', 'browser', 'node', 'worker', 'deno', 'development'];
        for (let mask = 0; mask < 64; mask++) {
          const customConditions = conditions.filter((_, bit) => mask & (1 << bit));
          const resolved = ts.resolveModuleName(specifier, all, { ...options(mode), customConditions }, ts.sys).resolvedModule;
          assert.equal(resolved?.resolvedFileName, path.join(installed, exports[key].types), `${mode}: ${specifier} conditional types target`);
        }
      }
      console.log(`${kind}: ${mode} strict generated-artifact consumers passed (${keys.length} public paths).`);
    }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
}

async function main() {
  await buildTypes();
  const { exports: contract, pkg } = await contracts();
  const metadata = await readJson(path.join(packageRoot, 'package.json'));
  const staged = path.join(packageRoot, 'build/package.json');
  try {
    const manifest = await readJson(staged);
    assertExportMap(manifest.exports, contract, pkg);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const declarations = await fs.readFile(path.join(typesRoot, 'button/Button.d.ts'), 'utf8');
  assert(declarations.includes('A button that triggers actions.') && declarations.includes('@default false'), 'Emitted JSDoc lost');
  assert(declarations.includes('namespace Button'), 'Emitted component namespace lost');
  for (const kind of ['ordinary', 'date-fns', 'luxon']) await consumer(kind, contract, pkg, metadata);
  console.log('All 79 type entrypoints qualified in Bundler and NodeNext without React ambient types or source aliases.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
