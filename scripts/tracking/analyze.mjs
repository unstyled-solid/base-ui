import ts from 'typescript';
import { posix } from 'node:path';

export function analyzeTests(path, content) {
  const isSpec = /\.spec\.[cm]?[jt]sx?$/.test(path);
  const isTest = /\.(test|spec)\.[cm]?[jt]sx?$/.test(path);
  const isHelper = /(?:\/test\/|\/test-utils\.)/.test(path);
  if ((!isTest && !isHelper) || !content) return null;
  const source = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  // TypeScript exposes parser diagnostics at runtime but not on public SourceFile.
  const diagnostics = /** @type {ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }} */ (source).parseDiagnostics;
  if (diagnostics.length) throw new Error(`Cannot parse test input ${path}`);
  const declarations = [];
  const unresolved = [];
  const location = (node) => {
    const { line, character } = source.getLineAndCharacterOfPosition(node.getStart(source));
    return { line: line + 1, column: character + 1 };
  };
  const base = (node, kind) => ({ id: `${path}#${kind}:${node.getStart(source)}`, ...location(node) });
  function containsRuntimeSkip(node) {
    let found = false;
    function visitSkip(child) {
      if (ts.isCallExpression(child) &&
          ((ts.isIdentifier(child.expression) && child.expression.text === 'skip') ||
           (ts.isPropertyAccessExpression(child.expression) && child.expression.name.text === 'skip'))) found = true;
      ts.forEachChild(child, visitSkip);
    }
    // Inspect callback bodies, not title strings, comments or the registration itself.
    node.arguments.filter((arg) => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)).forEach(visitSkip);
    return found;
  }
  function visit(node, suites = [], suiteRegistrations = []) {
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(source);
      // Only outer invocation with a title/callback is a declaration, not each(table).
      if (/^(?:it|test|describe|suite)(?:\.|$)/.test(callee) &&
          !/\.(?:each|skipIf|runIf)$/.test(callee)) {
        const first = node.arguments[0];
        const title = first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))
          ? first.text : null;
        const suite = /^(describe|suite)(?:\.|$)|^test\.describe\b/.test(callee);
        const dynamic = !title || [callee, ...suiteRegistrations].some((s) => /\.each\b/.test(s));
        const record = {
          ...base(node, suite ? 'suite' : 'declaration'),
          kind: 'static-declaration', title, titleExpression: first?.getText(source) ?? '',
          suites, suiteRegistrations, registration: callee,
          flags: ['skip', 'todo', 'only', 'skipIf', 'runIf', 'each', 'concurrent', 'fails']
            .filter((flag) => [callee, ...suiteRegistrations].some((s) => new RegExp(`\\.${flag}\\b`).test(s))),
          dynamic,
          runtimeSkip: containsRuntimeSkip(node),
        };
        if (!suite) declarations.push(record);
        if (dynamic) unresolved.push({ ...base(node, 'dynamic'), kind: 'unresolved-dynamic',
          reason: 'Computed title or parameterized registration requires runtime expansion.', expression: callee });
        ts.forEachChild(node, (child) => visit(child, suite ? [...suites, title ?? `<${first?.getText(source)}>`] : suites, suite ? [...suiteRegistrations, callee] : suiteRegistrations));
        return;
      }
      if (/^(describeConformance|popupConformanceTests|describeGregorianAdapter)$/.test(callee)) {
        unresolved.push({ ...base(node, 'conformance'), kind: 'unresolved-dynamic',
          reason: 'Generated conformance suite; options/conditional helpers require runtime expansion.', expression: callee });
      }
    }
    ts.forEachChild(node, (child) => visit(child, suites, suiteRegistrations));
  }
  visit(source);
  if (!isTest && !declarations.length && !unresolved.length) return null;
  // This obligation covers loops, custom helpers, imported test aliases and conditional
  // registration that static syntax cannot safely enumerate. Never infer cardinality.
  unresolved.unshift({ id: `${path}#collection`, kind: 'unresolved-dynamic',
    reason: isSpec && path.startsWith('packages/')
      ? 'Upstream Vitest excludes *.spec.* here; type scenarios require compiler-backed mapping.'
      : 'Full runtime collection not available; loops, helper calls and environment branches remain unresolved.' });
  return { kind: isSpec && path.startsWith('packages/') ? 'type-spec' : isTest ? 'test-file' : 'conformance-helper',
    collection: 'unresolved', runtimeCaseCount: null, declarations, unresolved,
    ...(isSpec && path.startsWith('packages/') ? { typeDeclarations: compilerStatements(source, ts),
      typeExpectErrorLines: content.split('\n').flatMap((line, i) => line.includes('@ts-expect-error') ? [i + 1] : []) } : {}),
    ...(!isTest ? { suiteTitles: suiteTitles(source) } : {}),
    environmentHints: [...new Set(content.match(/\b(?:isJSDOM|isWebKit|isFirefox|isChromium|isMac|isIOS|isAndroid)\b/g) ?? [])].sort(),
  };
}

// Syntax descriptors are NOT cases until a retained compiler program actually
// visits the statements. Imports are fixture setup; each remaining top-level
// statement is a compiler scenario, including assertions inside its function body.
export function compilerStatements(source, compiler = ts) {
  return source.statements.filter((node) => !compiler.isImportDeclaration(node) && !compiler.isExportDeclaration(node))
    .map((node) => ({ start: node.getStart(source), end: node.end, syntaxKind: compiler.SyntaxKind[node.kind] }));
}

function suiteTitles(source) {
  const titles = new Set();
  function visit(node) {
    if (ts.isCallExpression(node) && /^(describe|suite)(?:\.|$)/.test(node.expression.getText(source))) {
      const title = node.arguments[0];
      if (title && (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title))) titles.add(title.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return [...titles].sort();
}

export function dependencyGraph(entries) {
  const paths = new Set(entries.map((e) => e.path));
  const reverse = new Map(entries.map((e) => [e.path, new Set()]));
  const details = new Map();
  const candidates = (stem) => [stem, ...['.ts', '.tsx', '.js', '.mjs', '.mts', '.json', '/index.ts', '/index.tsx'].map((ext) => stem + ext)];
  for (const entry of entries) {
    if (!entry.content || !/\.[cm]?[jt]sx?$/.test(entry.path)) continue;
    const imports = ts.preProcessFile(entry.content, true, true).importedFiles.map((x) => x.fileName);
    const dependencies = [];
    const unresolvedImports = [];
    for (const specifier of new Set(imports)) {
      let stem;
      if (specifier.startsWith('.')) stem = posix.normalize(posix.join(posix.dirname(entry.path), specifier));
      else if (specifier === '#test-utils') stem = 'packages/react/test/index';
      else if (specifier === '#formatErrorMessage') stem = 'packages/utils/src/formatErrorMessage';
      else if (specifier.startsWith('@base-ui/utils/')) stem = `packages/utils/src/${specifier.slice(15)}`;
      else if (specifier === '@base-ui/react') stem = 'packages/react/src/index';
      else if (specifier.startsWith('@base-ui/react/')) stem = `packages/react/src/${specifier.slice(15)}`;
      else if (specifier.startsWith('#prehydration/')) {
        const part = specifier.slice('#prehydration/'.length);
        for (const dependency of ['packages/react/src/internals/prehydrationScript.stub.ts', `packages/react/src/${part}/prehydrationScript.min.ts`]) {
          if (paths.has(dependency)) { dependencies.push(dependency); reverse.get(dependency).add(entry.path); }
        }
        continue;
      }
      if (stem) {
        const dependency = candidates(stem).find((p) => paths.has(p));
        if (dependency) { dependencies.push(dependency); reverse.get(dependency).add(entry.path); }
        else unresolvedImports.push(specifier);
      } else if (specifier.startsWith('#') || specifier.startsWith('@/')) unresolvedImports.push(specifier);
    }
    details.set(entry.path, { dependencies: [...new Set(dependencies)].sort(), unresolvedImports: unresolvedImports.sort() });
  }
  function consumers(path) {
    const found = new Set();
    const pending = [...reverse.get(path)];
    while (pending.length) {
      const next = pending.pop();
      if (next === path || found.has(next)) continue;
      found.add(next);
      pending.push(...reverse.get(next));
    }
    return [...found].sort();
  }
  return { details, consumers };
}
