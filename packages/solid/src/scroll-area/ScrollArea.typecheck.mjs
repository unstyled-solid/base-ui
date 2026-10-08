import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const directory = path.dirname(fileURLToPath(import.meta.url));
const workspace = path.resolve(directory, '../../../..');
const configPath = path.join(workspace, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const files = parsed.fileNames.filter((file) => file.startsWith(`${directory}/`));
// Use the current harness's real matcher augmentation and strict compiler
// options. Injecting the old jest-dom /vitest type entry conflicts with native
// Vitest browser asymmetric matchers and bypasses the setup-owned integration.
const matcher = path.join(path.dirname(configPath), 'test/harness/matchers.ts');
const program = ts.createProgram([...files, matcher], parsed.options);
const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (file) => file,
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  console.log(`ScrollArea: ${files.length} owned source/test roots, strict types and dependencies passed (skipLibCheck=false).`);
}
