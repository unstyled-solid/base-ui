import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import ts from 'typescript';
import { compile, moduleImports } from './compiler.mjs';
import { buildPackage, filesIn, isProduction, root, stagedManifest, validateArtifacts } from './index.mjs';

const readJson = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const contract = await readJson('distribution/exports.json');
const policy = await readJson('distribution/package-contract.json');
const source = await readJson('packages/solid/package.json');
async function write(file, content) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, content);
}
async function fixture(run) {
  const repository = await fs.mkdtemp(path.join(os.tmpdir(), 'opencode', 'bsolid-build-'));
  const packageDirectory = path.join(repository, 'packages/solid');
  const output = path.join(packageDirectory, 'build');
  try {
    await write(path.join(repository, 'distribution/exports.json'), JSON.stringify(contract));
    await write(path.join(repository, 'distribution/package-contract.json'), JSON.stringify(policy));
    await write(path.join(packageDirectory, 'package.json'), JSON.stringify(source));
    for (const file of ['LICENSE', 'NOTICE', 'README.md']) await write(path.join(repository, file), await fs.readFile(path.join(root, file)));
    for (const [key, entry] of Object.entries(contract.exports)) {
      const file = path.join(packageDirectory, entry.target);
      await write(file, entry.kind === 'types-only' ? 'export interface FixtureType { value: string }\n' : `// Base UI MIT fixture notice\nexport const marker = ${JSON.stringify(key)};\n`);
      const declaration = entry.target.replace('./src/', 'types/').replace(/\.tsx?$/, '.d.ts');
      await write(path.join(output, declaration), 'export declare const marker: string;\n');
    }
    await write(path.join(packageDirectory, 'src/internals/prehydrationScript.stub.ts'), 'export const script = "";');
    for (const file of ['tabs/indicator', 'slider/thumb']) await write(path.join(packageDirectory, `src/${file}/prehydrationScript.ts`), '// payload notice\nexport const script = "server-payload";');
    await write(path.join(packageDirectory, 'src/utils/formatErrorMessage.ts'), 'export const formatErrorMessage = (code: number) => `Base UI: ${code}`;');
    await run({ repository, packageDirectory, output });
  } finally { await fs.rm(repository, { recursive: true, force: true }); }
}
const digest = async output => {
  const hash = createHash('sha256');
  for (const file of await filesIn(output)) { hash.update(file); hash.update(await fs.readFile(path.join(output, file))); }
  return hash.digest('hex');
};

test('exact immutable 79-key map, ordered branches, publication identity, isolated optional peers', () => {
  const manifest = stagedManifest(source, contract, policy);
  assert.deepEqual(Object.keys(manifest.exports), Object.keys(contract.exports));
  assert.equal(Object.keys(manifest.exports).length, 79);
  assert.equal(manifest.name, '@unstyled-solid/base-ui'); assert.equal(manifest.private, false);
  assert.equal(manifest.version, '0.0.1');
  assert.equal(manifest.sideEffects, false); assert.equal(manifest.type, 'module');
  const unaudited = structuredClone(policy); unaudited.format.sideEffects.qualified = false;
  assert.equal(stagedManifest(source, contract, unaudited).sideEffects, true);
  assert.equal(manifest.devDependencies, undefined); assert.equal(manifest.scripts, undefined);
  assert.deepEqual(manifest.publishConfig, { access: 'public' }); assert.equal(manifest.repository, undefined);
  for (const [key, entry] of Object.entries(contract.exports)) {
    assert.deepEqual(Object.keys(manifest.exports[key]), entry.kind === 'types-only' ? ['types'] : ['types', 'worker', 'browser', 'deno', 'node', 'default']);
  }
  assert.equal(manifest.exports['./internals/useBaseUiId'].browser, './dom/internals/createBaseUiId.js');
  for (const peer of ['date-fns', '@date-fns/tz', 'luxon', '@types/luxon']) {
    assert.equal(manifest.peerDependenciesMeta[peer].optional, true);
    assert.equal(manifest.dependencies[peer], undefined);
  }
  assert.throws(() => stagedManifest(source, { ...contract, exports: { ...contract.exports, '.': { target: './../src/index.ts' } } }, policy), /Unsafe export target/);
});

test('excludes authored test/spec/browser/proof/diagnostic/generation utilities', () => {
  for (const file of ['Button.test.tsx', 'Button.test-utils.tsx', 'Button.spec.ts', 'Button.browser.tsx', 'Foo.types.ts', 'Avatar.typecheck.mjs',
    'avatar/testImage.ts', 'FieldHydrationFixture.tsx', 'Tooltip.hydration-fixture.tsx', 'Menubar.fixtures.tsx', 'fixtures/prod.tsx', 'proof/Foo.tsx', 'generation/Foo.ts', 'diagnostics/Foo.ts', 'scripts/build.ts',
    'internals/temporal/describeGregorianAdapter/utils.ts', 'internals/contracts/proof/Bootstrap.tsx', 'Foo.template.js']) assert.equal(isProduction(file), false, file);
  for (const file of ['button/Button.tsx', 'utils/merge.ts', 'internals/types.ts', 'floating-ui-react/types.ts']) assert.equal(isProduction(file), true, file);
});

test('reproducible module output, cleanup preserves declarations, license/maps/aliases/Markdown', async () => fixture(async options => {
  await write(path.join(options.packageDirectory, 'src/button/index.ts'), `// Base UI MIT fixture notice\nimport {script} from '#prehydration/slider/thumb';\nexport {formatErrorMessage} from '#formatErrorMessage';\nexport {leaf} from './leaf';\nexport const body = script;`);
  await write(path.join(options.packageDirectory, 'src/button/leaf.tsx'), `// Inherited third-party MIT notice\nexport const leaf = (props: { value: string }) => <button>{props.value}</button>;`);
  await write(path.join(options.output, 'types/independent-agent-sentinel.d.ts'), 'leave me byte-for-byte');
  await write(path.join(options.output, 'dom/stale.js'), 'stale');
  await write(path.join(options.output, 'server/stale.js'), 'stale');
  await write(path.join(options.packageDirectory, 'src/button/Button.test-utils.tsx'), `import 'vitest'; export const Test = () => <div/>;`);
  await write(path.join(options.repository, 'docs/public/components/button.md'), '# Actual generated Markdown\n');
  await write(path.join(options.repository, 'docs/public/markdown-manifest.json'), JSON.stringify({ schemaVersion: 1, version: policy.identity.version }));
  await write(path.join(options.repository, 'docs/public/ignored.mdx'), '# MDX not staged');
  await write(path.join(options.repository, 'CHANGELOG.md'), '# Fixture changelog\n');
  const first = await buildPackage({ ...options, stageDocs: true });
  assert.deepEqual(first.missing, []); assert.equal(first.docs, 1);
  assert.equal(await fs.readFile(path.join(options.output, 'types/independent-agent-sentinel.d.ts'), 'utf8'), 'leave me byte-for-byte');
  const files = await filesIn(options.output);
  assert(!files.some(file => /stale|test-utils|\.tsx$|\.mdx$/.test(file)));
  assert(!files.includes('dom/slider/thumb/prehydrationScript.js'));
  assert(files.includes('server/slider/thumb/prehydrationScript.min.js'));
  for (const target of ['dom', 'server']) {
    const code = await fs.readFile(path.join(options.output, target, 'button/leaf.js'), 'utf8');
    assert(code.includes('Inherited third-party MIT notice'));
    assert(moduleImports(code, 'leaf.js').includes('@solidjs/web'));
    const map = JSON.parse(await fs.readFile(path.join(options.output, target, 'button/leaf.js.map'), 'utf8'));
    assert(map.mappings.length > 0); assert(map.sourcesContent[0].includes('props: { value: string }'));
    assert(!JSON.stringify(map).includes(options.repository));
    const imports = moduleImports(await fs.readFile(path.join(options.output, target, 'button/index.js'), 'utf8'), 'index.js');
    assert(imports.every(value => value.endsWith('.js')));
    assert(imports.includes('./leaf.js'));
    assert(imports.includes(target === 'dom' ? '../internals/prehydrationScript.stub.js' : '../slider/thumb/prehydrationScript.min.js'));
  }
  for (const name of ['LICENSE', 'NOTICE', 'CHANGELOG.md']) assert.deepEqual(await fs.readFile(path.join(options.output, name)), await fs.readFile(path.join(options.repository, name)));
  const hash = await digest(options.output);
  await buildPackage({ ...options, stageDocs: true });
  assert.equal(await digest(options.output), hash);
  await buildPackage({ ...options, stageDocs: false });
  assert(!(await filesIn(options.output)).some(file => file.startsWith('docs/')));
}));

test('complete build fails missing declarations and sources, runtime-only reports genuine gaps', async () => fixture(async options => {
  await fs.rm(path.join(options.output, 'types/button/index.d.ts'));
  await assert.rejects(buildPackage(options), /Missing artifact \.\/button: \.\/types\/button\/index\.d\.ts/);
  const result = await buildPackage({ ...options, validate: false });
  assert.deepEqual(result.missing, ['./button: ./types/button/index.d.ts']);
  await fs.rm(path.join(options.packageDirectory, 'src/button/index.ts'));
  await assert.rejects(buildPackage({ ...options, validate: false }), /Missing export source \.\/button.*bsolid-c-button/);
}));

test('optional adapter or undeclared React/test runtime leaks fail closed', async () => fixture(async options => {
  await write(path.join(options.packageDirectory, 'src/button/index.ts'), `export { DateTime } from 'luxon';`);
  await assert.rejects(buildPackage(options), /optional peer leaked/);
  await write(path.join(options.packageDirectory, 'src/button/index.ts'), `export { useState } from 'react';`);
  await assert.rejects(buildPackage(options), /Undeclared\/workspace-only runtime import react/);
}));

test('optional Markdown opt-in fails when no generated Markdown exists', async () => fixture(async options => {
  await fs.mkdir(path.join(options.repository, 'docs/public'), { recursive: true });
  await assert.rejects(buildPackage({ ...options, stageDocs: true }), /No Markdown/);
}));

test('equivalent TS/TSX source spelling preserves exact artifact stems; collisions fail', async () => fixture(async options => {
  const file = path.join(options.packageDirectory, 'src/internals/resolveValueLabel.tsx');
  await fs.rename(file, file.replace(/\.tsx$/, '.ts'));
  const result = await buildPackage(options);
  assert.deepEqual(result.missing, []);
  assert.equal(result.manifest.exports['./internals/resolveValueLabel'].browser, './dom/internals/resolveValueLabel.js');
  await write(file, 'export const duplicate = 1;');
  await assert.rejects(buildPackage(options), /Multiple source modules emit internals\/resolveValueLabel\.js/);
}));

test('actual RC13 generic declaration probe proves native SSR defect and tested Babel fallback', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'opencode', 'bsolid-compiler-'));
  try {
    await fs.symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'dir');
    await write(path.join(directory, 'package.json'), '{"type":"module"}');
    const source = await fs.readFile(path.join(root, 'test/harness/GenericFixture.tsx'), 'utf8');
    for (const compiler of ['native', 'babel']) {
      const output = compile(source, 'GenericFixture.tsx', 'ssr', value => value, compiler);
      await write(path.join(directory, `${compiler}.mjs`), output.code);
    }
    await write(path.join(directory, 'probe.mjs'), `
      import assert from 'node:assert/strict'; import {renderToString,isServer} from '@solidjs/web';
      const native=await import('./native.mjs'), babel=await import('./babel.mjs');
      assert.equal(isServer,true);
      assert.throws(()=>renderToString(()=>native.GenericFixture({value:'native'}),{onError:e=>{throw e}}),/Value is not defined/);
      const html=renderToString(()=>babel.GenericFixture({value:'babel'}));assert(html.includes('babel'));
      console.log('PASS: native type-only Value capture fails; Babel actual typed JSX SSR succeeds');
    `);
    const output = execFileSync('rtk', ['proxy', process.execPath, path.join(directory, 'probe.mjs')], { encoding: 'utf8' });
    assert(output.includes('PASS: native type-only Value capture fails'));
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('production emitted map uses meaningful authored sources and no missing runtime dependency', async () => {
  const output = path.join(root, 'packages/solid/build');
  const manifest = await readJson('packages/solid/build/package.json');
  const missing = await validateArtifacts(output, manifest);
  assert(missing.every(file => file.includes('./types/')), missing.join('\n'));
  for (const target of ['dom', 'server']) {
    const files = new Set(await filesIn(path.join(output, target)));
    for (const file of files) {
      if (!file.endsWith('.js')) continue;
      assert(!/test-utils|testImage|\.test\.|\.spec\.|\/proof\/|describeGregorianAdapter/.test(file), file);
      const code = await fs.readFile(path.join(output, target, file), 'utf8');
      for (const specifier of moduleImports(code, file)) {
        if (specifier.startsWith('.')) assert(files.has(path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier))), `${target}/${file}: ${specifier}`);
      }
      const map = JSON.parse(await fs.readFile(path.join(output, target, `${file}.map`), 'utf8'));
      assert.equal(map.sourcesContent.length, 1); assert(map.sourcesContent[0].length > 0);
      assert(!JSON.stringify(map).includes(root));
    }
  }
});

test('actual staged exports resolve all 64 condition sets, types-only remain unexported at runtime', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'opencode', 'bsolid-built-resolution-'));
  try {
    const staged = await fs.realpath(path.join(root, 'packages/solid/build'));
    const manifest = JSON.parse(await fs.readFile(path.join(staged, 'package.json'), 'utf8'));
    await fs.mkdir(path.join(directory, 'node_modules'), { recursive: true });
    await fs.symlink(staged, path.join(directory, 'node_modules/baseui-solid2'), 'dir');
    const keys = Object.keys(manifest.exports);
    await write(path.join(directory, 'resolve.mjs'), `const keys=${JSON.stringify(keys)};console.log(JSON.stringify(keys.map(key=>{try{return import.meta.resolve(key==='.'?'baseui-solid2':'baseui-solid2'+key.slice(1))}catch(e){return e.code}})));`);
    const dimensions = ['types', 'browser', 'node', 'worker', 'deno', 'development'];
    for (let mask = 0; mask < 64; mask++) {
      const conditions = dimensions.filter((_, i) => mask & (1 << i));
      const values = JSON.parse(execFileSync('rtk', ['proxy', process.execPath, ...conditions.map(condition => `--conditions=${condition}`), path.join(directory, 'resolve.mjs')], { encoding: 'utf8' }));
      keys.forEach((key, index) => {
        const entry = manifest.exports[key];
        const target = conditions.includes('types') ? entry.types : conditions.includes('worker') ? entry.worker : conditions.includes('browser') ? entry.browser : entry.default;
        assert.equal(values[index], target ? new URL(target, `file://${staged}/`).href : 'ERR_PACKAGE_PATH_NOT_EXPORTED', `${key}: ${conditions}`);
      });
    }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('production probe typechecks against actual emitted RC13 package declarations', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'opencode', 'bsolid-built-types-'));
  try {
    await fs.mkdir(path.join(directory, 'node_modules'), { recursive: true });
    await fs.symlink(path.join(root, 'packages/solid/build'), path.join(directory, 'node_modules/baseui-solid2'), 'dir');
    for (const name of ['solid-js', '@solidjs/web']) {
      await fs.mkdir(path.dirname(path.join(directory, 'node_modules', name)), { recursive: true });
      await fs.symlink(path.join(root, 'node_modules', name), path.join(directory, 'node_modules', name), 'dir');
    }
    const file = path.join(directory, 'fixture.tsx');
    await write(file, await fs.readFile(new URL('./fixture.tsx', import.meta.url), 'utf8'));
    await write(path.join(directory, 'package.json'), '{"type":"module"}');
    for (const mode of [ts.ModuleResolutionKind.Bundler, ts.ModuleResolutionKind.NodeNext]) {
      const options = { strict: true, skipLibCheck: false, noEmit: true, target: ts.ScriptTarget.ES2022,
        moduleResolution: mode, module: mode === ts.ModuleResolutionKind.NodeNext ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.Preserve, jsxImportSource: '@solidjs/web', types: [] };
      const resolution = ts.resolveModuleName('baseui-solid2', file, options, ts.sys).resolvedModule;
      assert(resolution.resolvedFileName.endsWith('/build/types/index.d.ts'));
      const program = ts.createProgram([file], options);
      const diagnostics = ts.getPreEmitDiagnostics(program);
      assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => directory, getCanonicalFileName: f => f, getNewLine: () => '\n' }));
      assert(!program.getSourceFiles().some(source => source.fileName.startsWith(`${root}/packages/solid/src/`)), 'Declaration probe must not resolve source');
    }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});

test('actual package import aliases evaluate browser stubs/server bodies and owned error formatter', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'opencode', 'bsolid-built-aliases-'));
  try {
    const staged = path.join(root, 'packages/solid/build');
    const manifest = await readJson('packages/solid/build/package.json');
    const script = path.join(directory, 'aliases.mjs');
    await write(script, `import {createRequire} from 'node:module'; const req=createRequire(${JSON.stringify(path.join(staged, 'package.json'))}); const records=[];for(const name of ${JSON.stringify(Object.keys(manifest.imports))}){const target=req.resolve(name); const module=await import(target); records.push({name,target,script:module.script,formatter:typeof module.default});}console.log(JSON.stringify(records));`);
    for (const conditions of [[], ['browser']]) {
      const records = JSON.parse(execFileSync('rtk', ['proxy', process.execPath, ...conditions.map(condition => `--conditions=${condition}`), script], { encoding: 'utf8' }));
      for (const record of records) {
        const branch = conditions.includes('browser') && !conditions.includes('worker') ? 'browser' : 'default';
        assert.equal(record.target, path.join(staged, manifest.imports[record.name][branch]));
        if (record.name.startsWith('#prehydration/')) {
          assert.equal(typeof record.script, 'string');
          assert.equal(record.script.length === 0, branch === 'browser');
        } else assert.equal(record.formatter, 'function');
      }
    }
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
