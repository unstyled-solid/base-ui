import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const cwd = await fs.realpath('.');
const results = [], failures = [];
const specifier = key => input.name + (key === '.' ? '' : key.slice(1));
const keys = Object.keys(input.contract).filter(key => !key.includes('temporal-adapter-') || input.kind === 'both' || key.endsWith(`temporal-adapter-${input.kind}`));
await fs.writeFile('entrypoints.ts', keys.map((key, index) => `import type * as Entry${index} from ${JSON.stringify(specifier(key))};\nexport type Public${index} = typeof Entry${index};`).join('\n'));
function options(mode) {
  return { target: ts.ScriptTarget.ES2022, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    module: mode === 'NodeNext' ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
    moduleResolution: mode === 'NodeNext' ? ts.ModuleResolutionKind.NodeNext : ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.Preserve, jsxImportSource: '@solidjs/web', strict: true, skipLibCheck: false,
    types: [], noEmit: true, verbatimModuleSyntax: true };
}
function check(files, mode) {
  const program = ts.createProgram(files.map(file => path.join(cwd, file)), options(mode));
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const sources = program.getSourceFiles().map(file => file.fileName);
  const formatted = ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => cwd, getCanonicalFileName: file => file, getNewLine: () => '\n' });
  const exact = diagnostics.map(diagnostic => ({ code: diagnostic.code, category: diagnostic.category, file: diagnostic.file?.fileName,
    start: diagnostic.start, length: diagnostic.length, message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n') }));
  assert(sources.every(file => file.startsWith(`${cwd}/`)), 'Type consumer escaped isolated directory');
  assert(!sources.some(file => /node_modules\/(?:react|react-dom|@types\/react)(?:\/|$)/.test(file)), 'React ambient type leak');
  for (const adapter of ['date-fns', 'luxon']) {
    if (input.kind !== 'both' && input.kind !== adapter && files.includes('entrypoints.ts')) {
      assert(!sources.some(file => file.includes(`temporal-adapter-${adapter}`)), `Unrequested adapter graph: ${adapter}`);
    }
  }
  return { program, diagnostics, sources, exact, formatted };
}
for (const mode of ['Bundler', 'NodeNext']) {
  const files = ['entrypoints.ts', 'ordinary.tsx', `temporal-${input.kind === 'ordinary' ? 'core' : input.kind}.mts`];
  const checked = check(files, mode);
  results.push({ mode, files, sources: checked.sources, diagnostics: checked.exact, formatted: checked.formatted, options: options(mode) });
  if (checked.diagnostics.length) failures.push(`${mode}: positive consumer failed`);
  for (const key of keys) {
    for (const conditions of input.conditionSets) {
      const resolved = ts.resolveModuleName(specifier(key), path.join(cwd, 'entrypoints.ts'), { ...options(mode), customConditions: conditions }, ts.sys).resolvedModule;
      const expected = path.join(cwd, 'node_modules', input.name, input.exports[key].types);
      if (resolved?.resolvedFileName !== expected) failures.push(`${mode}: ${key} (${conditions.join(',')}) -> ${resolved?.resolvedFileName}; expected ${expected}`);
    }
  }
  const negative = [
    ['native-ref', `import { Button } from '${input.name}/button';\nconst wrong: Button.Props = { ref: (element: SVGSVGElement) => {} };`, [2322]],
    ['generic', `import { Combobox } from '${input.name}/combobox';\nconst wrong: Combobox.Root.Props<{ id: number }, true> = { multiple: true, value: { id: 1 } };`, [2322, 2353]],
    ['hidden-export', `import type * as Hidden from '${input.name}/internals/contracts';\nexport type Wrong = typeof Hidden;`, [2307]],
  ];
  for (const [name, source, codes] of negative) {
    await fs.writeFile(`negative-${name}.tsx`, source);
    const checked = check([`negative-${name}.tsx`], mode);
    results.push({ mode, negative: name, diagnostics: checked.exact, formatted: checked.formatted });
    if (!checked.diagnostics.length || checked.diagnostics.some(d => !codes.includes(d.code) || d.file?.fileName !== path.join(cwd, `negative-${name}.tsx`))) failures.push(`${mode}: unexpected negative ${name}`);
  }
  for (const adapter of ['date-fns', 'luxon']) {
    if (input.kind === 'both' || input.kind === adapter) continue;
    const name = adapter === 'luxon' ? 'TemporalAdapterLuxon' : 'TemporalAdapterDateFns';
    const file = `missing-${adapter}.ts`;
    await fs.writeFile(file, `import { ${name} } from '${input.name}/internals/temporal-adapter-${adapter}';\nnew ${name}();`);
    const checked = check([file], mode);
    results.push({ mode, missingAdapter: adapter, diagnostics: checked.exact, formatted: checked.formatted });
    if (!checked.diagnostics.length || !checked.exact.some(d => d.code === 2307 && d.message.includes(adapter)) || checked.diagnostics.some(d => d.code !== 2307)) failures.push(`${mode}: missing ${adapter} peer did not fail locally as specified`);
  }
  // Replay the temporal emission contract in memory; do not emit into workspace.
  const emission = ts.createProgram([path.join(cwd, `temporal-${input.kind === 'ordinary' ? 'core' : input.kind}.mts`)], {
    ...options(mode), noEmit: false, declaration: true, emitDeclarationOnly: true, outDir: path.join(cwd, 'declarations'),
  });
  const emitted = [];
  const result = emission.emit(undefined, (file, text) => emitted.push({ file, text }));
  results.push({ mode, temporalEmission: emitted, emitDiagnostics: result.diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n')) });
  if (result.emitSkipped || result.diagnostics.length) failures.push(`${mode}: temporal declaration emission failed`);
}
await fs.writeFile('types-result.json', JSON.stringify({ keys, modes: ['Bundler', 'NodeNext'], results, failures }, null, 2));
assert.deepEqual(failures, [], 'Strict consumer failures; exact diagnostics in types-result.json');
