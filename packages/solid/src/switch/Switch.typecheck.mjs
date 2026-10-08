import ts from 'typescript';
import { dirname, resolve, sep } from 'node:path';

// Use the canonical strict harness options and its ambient declarations. The
// program still checks every transitive dependency and installed declaration.
const root = process.cwd();
const configPath = resolve(root, 'test/contracts/tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, dirname(configPath));
const family = resolve(root, 'packages/solid/src/switch') + sep;
const files = parsed.fileNames.filter((file) => file.startsWith(family) || file.endsWith('.d.ts'));
if (!files.some((file) => file.startsWith(family))) throw new Error('No Switch source files selected. Run from the project root.');
const program = ts.createProgram(files, parsed.options);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: (file) => file,
  getCurrentDirectory: () => root,
  getNewLine: () => '\n',
}));
console.log(`Switch strict source/tests/consumers: ${files.length} roots, ${diagnostics.length} diagnostics; strict=${parsed.options.strict}, skipLibCheck=${parsed.options.skipLibCheck}`);
process.exitCode = diagnostics.length ? 1 : 0;
