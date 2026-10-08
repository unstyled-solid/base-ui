import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const root = path.resolve('node_modules', input.name);
const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const available = new Set(input.inventory.map(file => file.file));
const records = [], failures = [];
const packageName = name => name.startsWith('@') ? name.split('/').slice(0, 2).join('/') : name.split('/')[0];
// Same syntax obligations as build/compiler.moduleImports and portableDeclaration:
// imports/reexports, import types, augmentations and literal dynamic imports.
for (const file of available) {
  if (!/\.(?:js|d\.ts)$/.test(file)) continue;
  const source = await fs.readFile(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('.js') ? ts.ScriptKind.JS : ts.ScriptKind.TS);
  const imports = [];
  function visit(node) {
    let literal;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) literal = node.moduleSpecifier;
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) literal = node.argument.literal;
    else if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) literal = node.name;
    else if (ts.isExternalModuleReference(node)) { failures.push(`${file}: require declaration`); literal = node.expression; }
    else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
      if (node.expression.kind !== ts.SyntaxKind.ImportKeyword || !node.arguments[0] || !ts.isStringLiteral(node.arguments[0])) failures.push(`${file}: require/nonliteral dynamic import`);
      else literal = node.arguments[0];
    }
    if (literal && ts.isStringLiteral(literal)) imports.push(literal.text);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (ast.referencedFiles.length || ast.typeReferenceDirectives.some(ref => /react/.test(ref.fileName))) failures.push(`${file}: nonportable triple-slash reference`);
  for (const name of imports) {
    if (name.startsWith('.')) {
      if (!name.endsWith('.js')) failures.push(`${file}: nonportable relative extension ${name}`);
      const relative = path.posix.normalize(path.posix.join(path.posix.dirname(file), name));
      const target = file.endsWith('.d.ts') ? relative.replace(/\.js$/, '.d.ts') : relative;
      if (!available.has(target) || target.startsWith('../')) failures.push(`${file}: missing/escaping relative target ${name}`);
    } else if (name.startsWith('#')) {
      const mapping = manifest.imports?.[name];
      if (!mapping || name === '#test-utils' || file.endsWith('.d.ts')) failures.push(`${file}: unresolved/test/declaration alias ${name}`);
      const targets = typeof mapping === 'string' ? [mapping] : Object.values(mapping ?? {});
      if (!targets.length || targets.some(target => typeof target !== 'string' || !target.startsWith('./') || !available.has(target.slice(2)))) failures.push(`${file}: invalid alias targets ${name}`);
    } else if (/^(?:react(?:-dom)?(?:\/|$)|@types\/react|@base-ui\/|vitest(?:\/|$)|@vitest\/|@testing-library\/|solid-js\/(?:web|store))/.test(name) || path.isAbsolute(name)) {
      failures.push(`${file}: forbidden import ${name}`);
    } else if (packageName(name) !== input.name && !manifest.dependencies?.[packageName(name)] && !manifest.peerDependencies?.[packageName(name)]) {
      failures.push(`${file}: undeclared external ${name}`);
    }
  }
  records.push({ file, imports });
}
await fs.writeFile('import-audit-result.json', JSON.stringify({ records, failures }, null, 2));
assert.deepEqual(failures, [], 'Packed import/declaration portability audit failed');
