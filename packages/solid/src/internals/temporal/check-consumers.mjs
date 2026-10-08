import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

// Source-stage subpath seam. The package export map and packed consumers are
// distribution-owned; these explicit mappings do NOT claim that export gate passed.
const directory = path.dirname(fileURLToPath(import.meta.url));
const config = ts.readConfigFile(path.join(directory, 'tsconfig.json'), ts.sys.readFile);
assert.equal(config.error, undefined);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, directory);
const format = (diagnostics) => ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: (name) => name,
  getCurrentDirectory: () => directory,
  getNewLine: () => '\n',
});
assert.equal(parsed.errors.length, 0, format(parsed.errors));
for (const name of ['core', 'date-fns', 'luxon', 'both']) {
  const options = { ...parsed.options, noEmit: false, declaration: true, emitDeclarationOnly: true,
    outDir: path.join(directory, '.consumer-emission'), types: [] };
  const program = ts.createProgram([path.join(directory, 'consumers', `${name}.fixture.mts`)], options);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(diagnostics.length, 0, format(diagnostics));
  const emissions = new Map();
  const result = program.emit(undefined, (filename, text) => emissions.set(filename, text));
  assert.equal(result.emitSkipped, false);
  assert.equal(result.diagnostics.length, 0, format(result.diagnostics));
  const graph = program.getSourceFiles().map((file) => file.fileName).join('\n');
  const declarations = [...emissions.values()].join('\n');
  assert.doesNotMatch(declarations, /@base-ui\/react|@ts-nocheck|['"]react['"]/);
  if (name === 'core') {
    assert.doesNotMatch(graph, /node_modules.*(?:date-fns|luxon)|temporal-adapter-(?:date-fns|luxon)/);
    assert.doesNotMatch(declarations, /from ['"](?:date-fns|@date-fns|luxon)/);
  } else if (name === 'date-fns') {
    assert.doesNotMatch(graph, /node_modules.*luxon|temporal-adapter-luxon/);
  } else if (name === 'luxon') {
    assert.doesNotMatch(graph, /node_modules.*date-fns|temporal-adapter-date-fns/);
  }
  if (name !== 'core') assert.match(declarations, /declare module ['"]baseui-solid2\/internals\/temporal['"]/);
  console.log(`PASS: ${name} isolated subpath types, negative fixtures, declaration emit and dependency isolation`);
}
