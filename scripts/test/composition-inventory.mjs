import ts from 'typescript';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
const options = ts.parseJsonConfigFileContent(config.config, ts.sys, root).options;
const entry = path.join(root, 'packages/solid/src/index.ts');
const program = ts.createProgram([entry], options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
const groups = new Map();
function runtimeExports(file, seen = new Set()) {
  if (seen.has(file.fileName)) return new Set();
  seen.add(file.fileName);
  const names = new Set();
  for (const statement of file.statements) {
    if (!ts.isExportDeclaration(statement) || statement.isTypeOnly) continue;
    if (statement.exportClause) {
      if (ts.isNamespaceExport(statement.exportClause)) names.add(statement.exportClause.name.text);
      else for (const item of statement.exportClause.elements) if (!item.isTypeOnly) names.add(item.name.text);
    } else if (statement.moduleSpecifier) {
      const resolved = ts.resolveModuleName(statement.moduleSpecifier.text, file.fileName, options, ts.sys).resolvedModule;
      if (resolved) for (const name of runtimeExports(program.getSourceFile(resolved.resolvedFileName), seen)) names.add(name);
    }
  }
  return names;
}
const runtimeNames = runtimeExports(source);
function inspect(symbol, name, depth = 0) {
  const type = checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration ?? symbol.declarations?.[0] ?? source);
  for (const signature of type.getCallSignatures()) {
    const argument = signature.parameters[0];
    if (!argument || !checker.getTypeOfSymbolAtLocation(argument, argument.valueDeclaration ?? source).getProperty('render')) continue;
    // These return an imperative render API, not a component/host part.
    if (name === 'createRender' || name === 'useRender') continue;
    const declaration = signature.declaration;
    const file = path.relative(root, declaration.getSourceFile().fileName);
    const key = `${file}:${declaration.pos}`;
    const group = groups.get(key) ?? { source: file, exports: [] };
    group.exports.push(name);
    groups.set(key, group);
    break;
  }
  if (depth === 0) for (const child of checker.getPropertiesOfType(type)) inspect(child, `${name}.${child.name}`, 1);
}
for (const symbol of checker.getExportsOfModule(checker.getSymbolAtLocation(source))) if (runtimeNames.has(symbol.name)) inspect(symbol, symbol.name);
const parts = [...groups.values()].map((group) => {
  const family = group.source.split('/src/')[1].split('/')[0].replaceAll('-', '');
  const id = group.exports.find((name) => name.includes('.') && name.split('.')[0].toLowerCase() === family)
    ?? group.exports.find((name) => name.includes('.')) ?? group.exports[0];
  return { id, ...group, exports: group.exports.sort() };
}).sort((a, b) => a.id.localeCompare(b.id));
const output = JSON.stringify({ generatedBy: 'scripts/test/composition-inventory.mjs', parts }, null, 2) + '\n';
const destination = path.join(root, 'test/harness/composition-parts.generated.json');
if (process.argv.includes('--check')) {
  if (readFileSync(destination, 'utf8') !== output) throw new Error('Composition inventory is stale; run node scripts/test/composition-inventory.mjs');
} else writeFileSync(destination, output);
console.log(`${parts.length} distinct render-bearing component signatures; ${parts.reduce((sum, part) => sum + part.exports.length, 0)} public export spellings`);
