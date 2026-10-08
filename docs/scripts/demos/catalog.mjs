import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
import { demoDispositions } from '../../content/demo-dispositions.mjs';

export const sourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export async function walk(dir) {
  try {
    const result = [];
    for (const entry of (await fs.readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isSymbolicLink()) throw new Error(`Symlink not allowed: ${dir}/${entry.name}`);
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) result.push(...await walk(file));
      else result.push(file);
    }
    return result;
  } catch (error) { if (error.code === 'ENOENT') return []; throw error; }
}
export async function readSafe(root, relative) {
  if (path.isAbsolute(relative) || relative.split('/').includes('..')) throw new Error(`Unsafe source path: ${relative}`);
  const target = path.resolve(root, relative);
  const real = await fs.realpath(target);
  if (real !== target) throw new Error(`Symlink source: ${relative}`);
  return fs.readFile(target);
}
function parse(source, file) { return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS); }
function unwrap(node) {
  while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
  return node;
}
export function readEntries(source, file) {
  const ast = parse(source, file);
  const declarations = new Map();
  for (const statement of ast.statements) if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) declarations.set(declaration.name.getText(ast), declaration.initializer);
  function literal(node, key = '') {
    node = unwrap(node);
    if (key === 'component') return { expression: node.getText(ast) };
    if (node && ts.isIdentifier(node) && declarations.has(node.text)) return literal(declarations.get(node.text), key);
    if (node && ts.isStringLiteralLike(node)) return node.text;
    if (node && ts.isArrayLiteralExpression(node)) return node.elements.map(element => literal(element));
    if (node && ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(property => {
      if (!ts.isPropertyAssignment(property)) throw new Error(`${file}: metadata must use explicit properties`);
      const name = property.name.text;
      return [name, literal(property.initializer, name)];
    }));
    throw new Error(`${file}: ${key || 'metadata'} must be statically readable; component may be an imported identifier`);
  }
  const exported = ast.statements.find(ts.isExportAssignment);
  if (!exported) throw new Error(`${file}: missing default DemoFamily export`);
  const entries = literal(exported.expression);
  if (!Array.isArray(entries)) throw new Error(`${file}: default export must be an array`);
  return entries;
}
export async function sourceGraph(root, files) {
  const records = new Map();
  const packages = new Set();
  async function visit(file) {
    if (records.has(file)) return;
    if (!file.startsWith('docs/demos/') && !file.startsWith('docs/tests/demos/fixtures/')) throw new Error(`Demo graph crosses source boundary: ${file}`);
    const bytes = await readSafe(root, file);
    const text = bytes.toString('utf8');
    const imports = /\.[cm]?[jt]sx?$/.test(file) ? ts.preProcessFile(text, true, true).importedFiles.map(item => item.fileName) : [];
    if (file.endsWith('.css')) {
      for (const match of text.matchAll(/(?:@import\s+["']([^"']+)["']|url\(\s*["']?([^"')\s]+))/g)) imports.push(match[1] ?? match[2]);
    }
    const record = { path: file, sha256: hash(bytes), bytes: bytes.length, imports: [], assets: !/\.(tsx?|jsx?|css|json|svg)$/.test(file) };
    records.set(file, record);
    for (const specifier of imports) {
      if (/^(https?:|data:|#)/.test(specifier)) { record.imports.push({ specifier, external: true }); continue; }
      if (!specifier.startsWith('.')) {
        packages.add(specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0]);
        record.imports.push({ specifier, package: true });
        continue; // Package implementation is never displayed or traversed.
      }
      const base = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      let resolved;
      for (const candidate of [base, ...['.tsx', '.ts', '.jsx', '.js', '.css', '/index.tsx', '/index.ts'].map(ext => base + ext)]) {
        try { if ((await fs.stat(path.join(root, candidate))).isFile()) { resolved = candidate; break; } } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      if (!resolved) throw new Error(`${file}: unresolved dependency ${specifier}`);
      record.imports.push({ specifier, path: resolved });
      await visit(resolved);
    }
  }
  for (const file of files) await visit(file);
  return { files: [...records.values()], packages: [...packages].sort() };
}
export function upstreamSymbols(source, file) {
  const symbols = [];
  const ast = parse(source, file);
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement) || !statement.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.initializer && ts.isCallExpression(declaration.initializer) && /^createDemo(?:WithVariants)?$/.test(declaration.initializer.expression.getText(ast))) symbols.push(declaration.name.getText(ast));
    }
  }
  return symbols;
}
export async function generateCatalog(root) {
  const entries = [];
  const references = {};
  const ids = new Set();
  const upstreamToId = new Map();
  for (const file of await walk(path.join(root, 'docs/demos'))) {
    if (!/\/[^/]+\/entry\.ts$/.test(file) || file.includes('/shared/')) continue;
    const relative = path.relative(root, file).split(path.sep).join('/');
    for (const entry of readEntries(await fs.readFile(file, 'utf8'), relative)) {
      entry.upstream = entry.upstream.replace(/^(?:docs\/)?upstream\/base-ui\//, '');
      if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(entry.id) || ids.has(entry.id)) throw new Error(`Invalid or duplicate demo id: ${entry.id}`);
      if (entry.id.split('/')[0] !== path.basename(path.dirname(file))) throw new Error(`${entry.id}: family differs from entry directory`);
      if (!entry.variants?.length) throw new Error(`${entry.id}: missing variants`);
      ids.add(entry.id);
      if (upstreamToId.has(entry.upstream)) throw new Error(`Duplicate upstream demo: ${entry.upstream}`);
      upstreamToId.set(entry.upstream, entry.id);
      const upstream = await readSafe(root, `docs/upstream/base-ui/${entry.upstream}`);
      const symbols = upstreamSymbols(upstream.toString('utf8'), entry.upstream);
      if (!symbols.length) throw new Error(`${entry.id}: upstream source has no createDemo export`);
      for (const symbol of symbols) {
        for (const source of new Set([entry.upstream, entry.upstream.replace(/\.[cm]?[jt]sx?$/, ''), entry.upstream.replace(/\/index\.[cm]?[jt]sx?$/, '')])) references[`demo:${source}#${symbol}`] = entry.id;
      }
      const variantIds = new Set();
      const variants = [];
      for (const variant of entry.variants) {
        if (!variant.id || variantIds.has(variant.id) || !variant.label || !variant.component || !variant.files?.length) throw new Error(`${entry.id}: invalid variant`);
        variantIds.add(variant.id);
        const graph = await sourceGraph(root, variant.files);
        const omitted = graph.files.filter(record => !variant.files.includes(record.path));
        if (omitted.length) throw new Error(`${entry.id}/${variant.id}: files omits executed dependencies: ${omitted.map(record => record.path).join(', ')}`);
        variants.push({ id: variant.id, label: variant.label, ...graph });
      }
      entries.push({ id: entry.id, upstream: entry.upstream, module: relative, variants });
    }
  }
  const missing = [];
  const exclusions = [];
  for (const file of await walk(path.join(root, 'docs/upstream/generated/pages'))) {
    if (!file.endsWith('.json')) continue;
    const page = JSON.parse(await fs.readFile(file, 'utf8'));
    for (const binding of page.imports ?? []) {
      const reference = binding.reference;
      if (typeof reference === 'string' && reference.startsWith('demo:') && !references[reference]) {
        const disposition = reference.includes('/handbook/') && demoDispositions[reference.split('#')[0].split('/').at(-1)];
        if (disposition) exclusions.push({ reference, ...disposition });
        else missing.push(reference);
      }
    }
  }
  return { schemaVersion: 1, sourceSha, package: 'baseui-solid2', runtime: { 'solid-js': '2.0.0-rc.13', '@solidjs/web': '2.0.0-rc.13' }, entries, references, exclusions, missing: [...new Set(missing)].sort() };
}
