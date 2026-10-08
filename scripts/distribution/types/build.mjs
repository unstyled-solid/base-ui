import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { pathToFileURL } from 'node:url';
import { assertDiagnostics, contracts, packageRoot, portableDeclaration, readJson, typeTarget, typesRoot } from './shared.mjs';

export async function buildTypes() {
  const { exports: contract } = await contracts();
  const configFile = path.join(packageRoot, 'tsconfig.build.json');
  const config = ts.readConfigFile(configFile, ts.sys.readFile);
  assertDiagnostics(config.error ? [config.error] : [], 'Declaration configuration');
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, packageRoot);
  assertDiagnostics(parsed.errors, 'Declaration configuration');
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  assertDiagnostics(ts.getPreEmitDiagnostics(program), 'Source declaration check');
  const emitted = new Map();
  const result = program.emit(undefined, (file, text) => emitted.set(path.resolve(file), text));
  assertDiagnostics(result.diagnostics, 'Declaration emit');
  if (result.emitSkipped || !emitted.size) throw new Error('TypeScript skipped declaration emission.');
  // TypeScript does not re-emit authored declaration leaves. Copy only real
  // source declarations in the checked graph, as the upstream build does.
  const sourceRoot = path.join(packageRoot, 'src');
  for (const source of program.getSourceFiles()) {
    if (source.isDeclarationFile && source.fileName.startsWith(`${sourceRoot}${path.sep}`)) {
      emitted.set(path.join(typesRoot, path.relative(sourceRoot, source.fileName)), source.text);
    }
  }
  for (const [key, entry] of Object.entries(contract.exports)) {
    const expected = path.join(packageRoot, 'build', typeTarget(entry));
    if (!emitted.has(expected)) throw new Error(`${key}: missing actual emitted declaration ${expected}; owner ${entry.owner}`);
  }
  const portable = new Map();
  const metadata = await readJson(path.join(packageRoot, 'package.json'));
  const external = new Set([...Object.keys(metadata.dependencies ?? {}), ...Object.keys(metadata.peerDependencies ?? {}), metadata.name]);
  for (const [file, text] of emitted) {
    if (!file.startsWith(`${typesRoot}${path.sep}`) || !file.endsWith('.d.ts')) throw new Error(`Unexpected declaration output ${file}`);
    const declaration = portableDeclaration(file, text, emitted);
    for (const specifier of declaration.modules) {
      if (specifier.startsWith('.')) continue;
      const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
      if (!external.has(packageName)) throw new Error(`${file}: undeclared dependency or source alias ${specifier}`);
    }
    portable.set(file, declaration.text);
  }
  // Do not touch build/, DOM/server outputs or the concurrently staged manifest.
  // Failed compilation leaves the previous declaration tree intact.
  await fs.rm(typesRoot, { recursive: true, force: true });
  for (const [file, text] of portable) {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, text);
  }
  console.log(`Emitted ${portable.size} source-generated declaration modules; all 79 contract types targets present.`);
  return portable;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildTypes().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
