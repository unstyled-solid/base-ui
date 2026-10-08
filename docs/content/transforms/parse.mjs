import ts from 'typescript';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

export function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}
export function parseMdx(source, file) {
  try { return unified().use(remarkParse).use(remarkMdx).use(remarkGfm).parse(source); }
  catch (error) { throw new Error(`${file}:${error.line ?? '?'}:${error.column ?? '?'}: ${error.message}`, { cause: error }); }
}
export function parseCode(source, file = 'snippet.tsx') {
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true,
    /\.(?:ts|mts)$/.test(file) ? ts.ScriptKind.TS : ts.ScriptKind.TSX);
}
export function codeReferences(source, file) {
  const tree = parseCode(source, file);
  const refs = [];
  const unresolved = [];
  const add = (node, kind) => {
    if (node && ts.isStringLiteralLike(node)) refs.push({ value: node.text, start: node.getStart(tree) + 1, end: node.end - 1, kind });
  };
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) add(node.moduleSpecifier, 'import');
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) add(node.argument.literal, 'type-import');
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(tree) === 'require')) {
      if (!node.arguments[0] || !ts.isStringLiteralLike(node.arguments[0])) unresolved.push({ start: node.getStart(tree), expression: node.getText(tree) });
      else add(node.arguments[0], 'import');
    }
    if (ts.isNewExpression(node) && node.expression.getText(tree) === 'URL') add(node.arguments?.[0], 'asset');
    if (ts.isJsxAttribute(node) && ['src', 'poster', 'href'].includes(node.name.getText(tree))) add(node.initializer, 'asset');
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return { tree, refs, unresolved, diagnostics: tree.parseDiagnostics.map((d) => ({ start: d.start, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') })) };
}
export function cssReferences(source, file) {
  const refs = [];
  const tree = postcss.parse(source, { from: file });
  tree.walkAtRules('import', (node) => {
    const first = valueParser(node.params).nodes.find((n) => n.type !== 'space');
    if (first?.type === 'string' || first?.type === 'word') refs.push({ value: first.value, kind: 'css-import' });
  });
  const urls = (value) => valueParser(value).walk((node) => {
    if (node.type === 'function' && node.value === 'url') {
      refs.push({ value: valueParser.stringify(node.nodes).replace(/^(['"])(.*)\1$/, '$2'), kind: 'asset' });
      return false;
    }
    return undefined;
  });
  tree.walkDecls((node) => urls(node.value));
  tree.walkAtRules((node) => urls(node.params));
  return refs;
}
// Deliberately no eval/import: metadata and MDX attributes accept JSON-like ESTree only.
export function literal(node, location = 'expression') {
  if (!node) return null;
  if (node.type === 'Literal' && !node.regex && !node.bigint) return node.value;
  if (node.type === 'ArrayExpression') return node.elements.map((n) => literal(n, location));
  if (node.type === 'ObjectExpression') return Object.fromEntries(node.properties.map((p) => {
    if (p.type !== 'Property' || p.computed || p.method || p.kind !== 'init') throw new Error(`${location}: unsupported object property; provide a reviewed static mapping`);
    return [p.key.name ?? p.key.value, literal(p.value, location)];
  }));
  if (node.type === 'UnaryExpression' && node.operator === '-' && node.argument.type === 'Literal' && typeof node.argument.value === 'number') return -node.argument.value;
  throw new Error(`${location}: unsupported ${node.type}; provide a reviewed static mapping (never execute MDX)`);
}
