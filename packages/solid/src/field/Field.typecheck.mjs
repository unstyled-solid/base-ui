import ts from 'typescript';
import { fileURLToPath } from 'node:url';

// Check every owned source, runtime test and type fixture, plus their real
// dependency closure. Preserve the canonical strict options and diagnostics.
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const configPath = ts.findConfigFile(root, ts.sys.fileExists, 'tsconfig.json');
if (!configPath) throw new Error('Field strict check requires the workspace tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const roots = parsed.fileNames.filter((file) => file.includes('/src/field/') || file.endsWith('.d.ts'));
const program = ts.createProgram(roots, parsed.options);
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
console.log(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
  getCanonicalFileName: (file) => file,
  getCurrentDirectory: () => root,
  getNewLine: () => '\n',
}));
console.log(`Field strict dependency closure: ${roots.length} roots, ${diagnostics.length} diagnostics; strict=${parsed.options.strict}, skipLibCheck=${parsed.options.skipLibCheck}`);
process.exitCode = diagnostics.length ? 1 : 0;
