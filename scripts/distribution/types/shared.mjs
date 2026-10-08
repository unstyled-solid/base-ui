import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import assert from 'node:assert/strict';

export const root = fileURLToPath(new URL('../../../', import.meta.url));
export const packageRoot = path.join(root, 'packages/solid');
export const typesRoot = path.join(packageRoot, 'build/types');
export const fixtureRoot = path.join(root, 'test/distribution/types');
export const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));

export async function contracts() {
  const exports = await readJson(path.join(root, 'distribution/exports.json'));
  const pkg = await readJson(path.join(root, 'distribution/package-contract.json'));
  const upstream = await readJson(path.join(root, exports.sourceManifest));
  const keys = Object.keys(exports.exports).sort();
  if (keys.length !== 79 || JSON.stringify(keys) !== JSON.stringify(Object.keys(upstream.exports).sort())) {
    throw new Error('Declaration contract must match the exact 79 pinned upstream export keys.');
  }
  return { exports, pkg };
}

export function typeTarget(entry) {
  if (!/^\.\/src\/[\w/-]+\.(ts|tsx)$/.test(entry.target)) {
    throw new Error(`Unsafe source target: ${entry.target}`);
  }
  return `./types/${entry.target.slice(6).replace(/\.tsx?$/, '.d.ts')}`;
}

export function conditionalExports(contract, pkg) {
  return Object.fromEntries(Object.entries(contract.exports).map(([key, entry]) => {
    const stem = entry.target.slice(6).replace(/\.tsx?$/, '');
    const template = entry.kind === 'types-only' ? pkg.resolution.typeOnlyTemplate : pkg.resolution.runtimeTemplate;
    return [key, Object.fromEntries(Object.entries(template).map(([condition, target]) => [condition, target.replace('{stem}', stem)]))];
  }));
}

export function assertExportMap(actual, contract, pkg) {
  const expected = conditionalExports(contract, pkg);
  assert.deepEqual(actual, expected, 'Staged manifest must match all 79 exact conditional types targets');
  for (const key of Object.keys(expected)) {
    assert.deepEqual(Object.keys(actual[key]), Object.keys(expected[key]), `${key}: types-first condition order`);
  }
}

export function assertDiagnostics(diagnostics, context) {
  if (diagnostics.length) {
    throw new Error(`${context}\n${ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (file) => file,
      getNewLine: () => '\n',
    })}`);
  }
}

// Edit only module literal spans; preserve all emitted signatures, namespaces and JSDoc verbatim.
export function portableDeclaration(file, text, files, identity) {
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits = [];
  const modules = [];
  function visit(node) {
    let literal;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) literal = node.moduleSpecifier;
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) literal = node.argument.literal;
    else if (ts.isExternalModuleReference(node)) literal = node.expression;
    else if (ts.isModuleDeclaration(node) && ts.isStringLiteral(node.name)) literal = node.name;
    if (literal && ts.isStringLiteral(literal)) {
      const specifier = literal.text;
      if (specifier.startsWith('.')) {
        const base = path.resolve(path.dirname(file), specifier.replace(/\.(?:js|jsx|ts|tsx|d\.ts)$/, ''));
        const target = [`${base}.d.ts`, path.join(base, 'index.d.ts')].find((candidate) => files.has(candidate));
        if (!target) throw new Error(`${file}: unresolved declaration module ${specifier}`);
        let relative = path.relative(path.dirname(file), target).split(path.sep).join('/').replace(/\.d\.ts$/, '.js');
        if (!relative.startsWith('.')) relative = `./${relative}`;
        edits.push({ start: literal.getStart(ast) + 1, end: literal.getEnd() - 1, text: relative });
        modules.push(relative);
      } else {
        if (specifier.startsWith('#') || path.isAbsolute(specifier) || /^(?:react(?:-dom)?(?:\/|$)|@types\/react|@base-ui\/|vitest(?:\/|$)|@vitest\/|@testing-library\/)/.test(specifier)) {
          throw new Error(`${file}: forbidden published declaration reference ${specifier}`);
        }
        const published = identity && (specifier === identity.from || specifier.startsWith(`${identity.from}/`))
          ? identity.to + specifier.slice(identity.from.length) : specifier;
        if (published !== specifier) edits.push({ start: literal.getStart(ast) + 1, end: literal.getEnd() - 1, text: published });
        modules.push(published);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (ast.referencedFiles.length || ast.typeReferenceDirectives.some((ref) => /react/.test(ref.fileName))) {
    throw new Error(`${file}: nonportable triple-slash declaration reference`);
  }
  for (const edit of edits.sort((a, b) => b.start - a.start)) text = text.slice(0, edit.start) + edit.text + text.slice(edit.end);
  return { text, modules };
}
