import ts from 'typescript';
import { resolve } from 'node:path';

// Uses the repository's real RC13 contract; reports owned and dependency errors
// separately without muting either category or changing shared configuration.
const root = resolve('.');
const config = ts.readConfigFile(resolve(root, 'tsconfig.json'), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, '\n'));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const prefix = resolve(root, 'packages/solid/src/select') + '/';
const roots = [...parsed.fileNames.filter(file => file.startsWith(prefix)),
  resolve(root, 'packages/solid/test/types.d.ts'), resolve(root, 'test/harness/matchers.ts')];
const program = ts.createProgram(roots, parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);
const own = diagnostics.filter(item => item.file?.fileName.startsWith(prefix));
const shared = diagnostics.filter(item => !item.file?.fileName.startsWith(prefix));
const host = { getCurrentDirectory: () => root, getCanonicalFileName: value => value, getNewLine: () => '\n' };
console.log(ts.formatDiagnostics(own, host));
console.log(`Select-owned diagnostics: ${own.length}; imported dependency diagnostics: ${shared.length}`);
console.log([...new Set(shared.map(item => item.file?.fileName.replace(root + '/', '') ?? 'configuration'))].join('\n'));
process.exitCode = diagnostics.length > 0 ? 1 : 0;
