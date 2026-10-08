import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { compilerStatements } from './analyze.mjs';

/** @param {any} request @param {any} ts */
export function collectCompiler(request, ts) {
  const pins = new Map(request.sources.map((s) => [s.path, s.blob]));
  const pin = (path) => ({ path, blob: pins.get(path) });
  const document = { schemaVersion: 1, baseline: request.baseline, method: 'typescript-compiler-collect',
    command: request.command, toolchain: { node: process.version, typescript: ts.version },
    programPolicy: 'source-only-no-emit-pinned-test-options', configurations: [], files: [], errors: [] };
  const configs = new Set();
  const display = (d) => `${d.file ? relative(request.checkout, d.file.fileName).split(sep).join('/') + ':' + (d.start ?? 0) + ': ' : ''}TS${d.code} ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`;
  for (const pkg of ['react', 'utils']) {
    const paths = request.paths.filter((path) => path.startsWith(`packages/${pkg}/`));
    if (!paths.length) continue;
    try {
      const configPath = `packages/${pkg}/tsconfig.test.json`;
      const parseHost = { ...ts.sys, onUnRecoverableConfigFileDiagnostic: (d) => document.errors.push(display(d)),
        readFile: (file) => {
          const path = relative(request.checkout, file).split(sep).join('/');
          if (pins.has(path) && path.endsWith('.json')) configs.add(path);
          return ts.sys.readFile(file);
        } };
      const parsed = ts.getParsedCommandLineOfConfigFile(resolve(request.checkout, configPath), { noEmit: true }, parseHost);
      if (!parsed) throw new Error(`Cannot parse ${configPath}`);
      document.errors.push(...parsed.errors.map(display));
      for (const path of paths) if (!parsed.fileNames.includes(resolve(request.checkout, path))) throw new Error(`Type fixture not included by pinned config ${path}`);
      // Source-only checker: project references emit declarations in upstream builds.
      // Here no emit/build is allowed; source dependencies are checked directly.
      const options = { ...parsed.options, noEmit: true, composite: false, incremental: false,
        declaration: false, emitDeclarationOnly: false, rootDir: undefined, outDir: undefined };
      const program = ts.createProgram({ rootNames: [...paths.map((p) => resolve(request.checkout, p)),
        ...parsed.fileNames.filter((file) => file.endsWith('.d.ts'))], options });
      const checker = program.getTypeChecker();
      const optionDiagnostics = [...program.getOptionsDiagnostics(), ...program.getGlobalDiagnostics()].map(display);
      document.errors.push(...optionDiagnostics);
      for (const path of paths) {
        const source = program.getSourceFile(resolve(request.checkout, path));
        if (!source) throw new Error(`Compiler omitted ${path}`);
        const bytes = Buffer.from(source.text);
        const actual = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
        if (actual !== pins.get(path)) throw new Error(`Compiler read drifted fixture ${path}`);
        const diagnostics = [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)].map(display);
        const descriptors = compilerStatements(source, ts);
        const nodes = source.statements.filter((n) => !ts.isImportDeclaration(n) && !ts.isExportDeclaration(n));
        const scenarios = descriptors.map((item, i) => ({ ...item,
          checkedType: checker.typeToString(checker.getTypeAtLocation(nodes[i].expression ?? nodes[i])) }));
        const expectErrorLines = source.text.split('\n').flatMap((line, i) => line.includes('@ts-expect-error') ? [i + 1] : []);
        document.files.push({ ...pin(path), configuration: configPath, scenarios, expectErrorLines, diagnostics });
      }
    } catch (error) { document.errors.push(String(error.stack ?? error)); }
  }
  document.configurations = [...configs].sort().map(pin);
  document.errors = [...new Set(document.errors)];
  return document;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const request = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const { default: ts } = await import(pathToFileURL(resolve(request.checkout, 'node_modules/typescript/lib/typescript.js')).href);
  const document = collectCompiler(request, ts);
  writeFileSync(request.output, `${JSON.stringify(document, null, 2)}\n`, { flag: 'wx' });
  process.exitCode = document.errors.length || document.files.some((f) => f.diagnostics.length) ? 1 : 0;
}
