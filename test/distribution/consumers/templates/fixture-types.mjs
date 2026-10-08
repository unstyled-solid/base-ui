import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { staticRuntimeSource, namespaceOracle } from './runtime-accounting.mjs';
const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const consumerRoot = input.consumerRoot ?? process.cwd();
namespaceOracle(input, JSON.parse(await fs.readFile('resolution-0.json', 'utf8')));
await fs.writeFile('all-runtime.mjs', staticRuntimeSource(input));
const results = [];
for (const mode of ['Bundler', 'NodeNext']) {
  const options = { target: ts.ScriptTarget.ES2022, lib: ['lib.es2022.d.ts', 'lib.dom.d.ts', 'lib.dom.iterable.d.ts'],
    module: mode === 'NodeNext' ? ts.ModuleKind.NodeNext : ts.ModuleKind.ESNext,
    moduleResolution: mode === 'NodeNext' ? ts.ModuleResolutionKind.NodeNext : ts.ModuleResolutionKind.Bundler,
    allowJs: true, checkJs: true, strict: true, skipLibCheck: false, noEmit: true,
    jsx: ts.JsxEmit.Preserve, jsxImportSource: '@solidjs/web', types: [], verbatimModuleSyntax: true };
  const program = ts.createProgram(['all-runtime.mjs', 'client.tsx', 'app.tsx'].map(file => path.resolve(file)), options);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  const sources = program.getSourceFiles().map(source => source.fileName);
  assert(sources.every(file => file.startsWith(`${consumerRoot}/`)), 'New fixture types escaped retained consumer');
  results.push({ mode, options, sources, diagnostics: diagnostics.map(d => ({ code: d.code, file: d.file?.fileName, start: d.start, length: d.length, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') })),
    formatted: ts.formatDiagnosticsWithColorAndContext(diagnostics, { getCurrentDirectory: () => process.cwd(), getCanonicalFileName: file => file, getNewLine: () => '\n' }) });
}
await fs.writeFile('fixture-types-result.json', JSON.stringify({ results }, null, 2));
assert(results.every(result => !result.diagnostics.length), 'New frozen fixture strict types failed; full diagnostics retained');
