import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// Keep the repository's strict declarations, conditions and ambient harness types.
// Only the program's entrypoints are narrowed; transitive diagnostics still fail.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const configPath = resolve(root, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const family = resolve(root, 'packages/solid/src/toolbar') + '/';
const roots = parsed.fileNames.filter((path) => path.startsWith(family) || path.endsWith('.d.ts'));
const program = ts.createProgram(roots, parsed.options);
const diagnostics = [
  ...(config.error ? [config.error] : []),
  ...parsed.errors,
  ...ts.getPreEmitDiagnostics(program),
];
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCurrentDirectory: () => root,
  getCanonicalFileName: (path) => path,
  getNewLine: () => '\n',
}));
console.log(`Toolbar strict check: ${roots.length} roots, ${diagnostics.length} diagnostics`);
process.exitCode = diagnostics.length ? 1 : 0;
