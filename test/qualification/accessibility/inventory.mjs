import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { sourceSha, scenarios, makeMatrix, gate } from './model.mjs';

export const root = fileURLToPath(new URL('../../../', import.meta.url));
export const directory = fileURLToPath(new URL('./', import.meta.url));
export const digest = (value) => createHash('sha256').update(value).digest('hex');
export async function files(path) {
  const result = [];
  for (const entry of (await readdir(path, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const name = resolve(path, entry.name);
    if (entry.isDirectory()) result.push(...await files(name));
    else if (entry.isFile()) result.push(name);
  }
  return result;
}

// Inventory call sites, enclosing suites, literal parameter domains, guards and generator invocations.
// Dynamic generators are deliberately retained as unresolved, never counted as one expanded test.
export function parseTests(text, path) {
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const rows = [];
  const fileRestrictions = [];
  const strings = (node) => node ? node.getText(sf) : '';
  const base = (node) => {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node)) return base(node.expression);
    if (ts.isCallExpression(node) || ts.isTaggedTemplateExpression(node)) return base(node.expression ?? node.tag);
    return '';
  };
  const unwrap = (node) => {
    while (node && (ts.isAsExpression(node) || ts.isParenthesizedExpression(node) || ts.isSatisfiesExpression(node))) node = node.expression;
    return node;
  };
  const declarations = new Map();
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const existing = declarations.get(node.name.text) ?? [];
      declarations.set(node.name.text, [...existing, node.initializer]);
    }
    ts.forEachChild(node, collect);
  }
  collect(sf);
  function domain(node, seen = new Set()) {
    node = unwrap(node);
    if (!node) return null;
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(strings);
    if (ts.isIdentifier(node) && !seen.has(node.text) && declarations.get(node.text)?.length === 1) {
      return domain(declarations.get(node.text)[0], new Set([...seen, node.text]));
    }
    return null;
  }
  function visit(node, suites = [], parameters = [], guards = []) {
    let nextSuites = suites, nextParameters = parameters, nextGuards = guards;
    if (ts.isIfStatement(node)) nextGuards = [...guards, strings(node.expression)];
    if (ts.isForOfStatement(node)) nextParameters = [...parameters,
      { expression: strings(node.expression), values: domain(node.expression), binding: strings(node.initializer) }];
    if (ts.isCallExpression(node)) {
      const name = base(node.expression), expression = strings(node.expression);
      const isSuite = name === 'describe' || name === 'context';
      const isCase = ['it', 'test', 'specify'].includes(name);
      // Only outer test registration, not it.each(...) or it.skipIf(...) setup calls.
      const callback = node.arguments.find((arg) => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
      const noBodyRegistration = /\.todo$/.test(expression) || (/\.skip$/.test(expression) && node.arguments.length === 1 &&
        (ts.isStringLiteral(node.arguments[0]) || ts.isNoSubstitutionTemplateLiteral(node.arguments[0])));
      if (!callback && isCase && /\.skip$/.test(expression) && !noBodyRegistration) fileRestrictions.push(strings(node));
      if ((callback || noBodyRegistration) && (isSuite || isCase) && node.arguments.length) {
        if (ts.isCallExpression(node.expression) && /\.each$/.test(strings(node.expression.expression))) {
          nextParameters = [...parameters, { expression: strings(node.expression.arguments[0]),
            values: domain(node.expression.arguments[0]), binding: callback?.parameters.map(strings).join(',') ?? '' }];
        } else if (/\.each/.test(expression)) {
          nextParameters = [...parameters, { expression, values: null, binding: 'dynamic/tagged each' }];
        }
        if (isSuite) {
          nextSuites = [...suites, strings(node.arguments[0])];
          if (expression !== name) nextGuards = [...guards, expression];
        }
        if (isCase) add('case', node, nextSuites, nextParameters, nextGuards);
      }
      if (ts.isPropertyAccessExpression(node.expression) && ['forEach', 'map'].includes(node.expression.name.text) && callback) {
        nextParameters = [...parameters, { expression: strings(node.expression.expression),
          values: domain(node.expression.expression), binding: callback.parameters.map(strings).join(',') }];
      }
      if (/^describe[A-Z]/.test(name)) add('generator', node, suites, parameters, guards);
    }
    ts.forEachChild(node, (child) => visit(child, nextSuites, nextParameters, nextGuards));
  }
  function add(kind, node, suites, parameters, guards) {
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart(sf));
    const domainsResolved = parameters.every((p) => p.values !== null);
    const literalMultiplicity = domainsResolved ? parameters.reduce((n, p) => n * p.values.length, 1) : null;
    const combinations = domainsResolved ? parameters.reduce((previous, p) => previous.flatMap((combo) => p.values.map((value) =>
      [...combo, { binding: p.binding, value }])), [[]]) : null;
    rows.push({ id: `${path}:${line + 1}:${kind}:${node.getStart(sf)}`, path, line: line + 1, kind,
      suite: suites, title: strings(node.arguments[0]), registration: strings(node.expression),
      parameters, literalMultiplicity, literalInstances: combinations,
      generatorInvocation: kind === 'generator' ? strings(node) : null,
      expansion: kind === 'generator' ? 'generated-suite-unresolved' :
        domainsResolved ? 'literal-domains-accounted' : 'dynamic-expansion-unresolved',
      guards, status: 'blocked', blocker: 'Canonical call site retained; exact outcome/expanded-instance mapping pending.' });
  }
  visit(sf);
  return { rows, fileRestrictions, parseErrors: sf.parseDiagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')) };
}

export async function inventory() {
  const upstream = resolve(root, 'upstream/base-ui');
  const head = spawnSync('rtk', ['proxy', 'git', '-C', upstream, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  const status = spawnSync('rtk', ['proxy', 'git', '-C', upstream, 'status', '--porcelain', '--untracked-files=no'], { encoding: 'utf8' });
  if (head.status !== 0 || status.status !== 0) throw new Error('Cannot verify canonical upstream checkout through RTK');
  const checkout = { actualSha: head.stdout.trim(), trackedChanges: status.stdout.trim(),
    verified: head.stdout.trim() === sourceSha && status.stdout.trim() === '' };
  const manifest = JSON.parse(await readFile(resolve(upstream, 'packages/react/package.json'), 'utf8'));
  const families = Object.keys(manifest.exports).filter((key) => /^\.\/[^/]+$/.test(key)).map((key) => key.slice(2)).sort();
  const targets = (await readdir(resolve(root, 'packages/solid/src'), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !['internals', 'utils', 'floating-ui-react'].includes(entry.name)).map((entry) => entry.name);
  const extras = targets.filter((f) => !families.includes(f));
  const allFamilies = [...new Set([...families, ...extras])].sort();
  const inputs = (await files(resolve(upstream, 'packages/react/src')))
    .filter((path) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(path));
  // Include helper generators independently, and screen-reader specs; do not import React harness.
  inputs.push(...(await files(resolve(upstream, 'packages/react/test'))).filter((path) => /\.[jt]sx?$/.test(path)));
  inputs.push(...(await files(resolve(upstream, 'test/screen-reader'))).filter((path) => /\.[jt]sx?$/.test(path)));
  const sourceFiles = [], cases = [], parseErrors = [];
  for (const path of [...new Set(inputs)].sort()) {
    const text = await readFile(path, 'utf8');
    const name = relative(upstream, path);
    const parsed = parseTests(text, name);
    sourceFiles.push({ path: name, sha256: digest(text), registrationCount: parsed.rows.length, restrictions: parsed.fileRestrictions });
    const family = name.startsWith('packages/react/src/') ? name.split('/')[3] : 'shared-generators-and-AT';
    cases.push(...parsed.rows.map((row) => ({ ...row, family,
      candidateScenarios: scenarios.filter((s) => s.sourceTests.includes(name)).map((s) => s.id) })));
    parseErrors.push(...parsed.parseErrors.map((error) => ({ path: name, error })));
  }
  // Hash actual source tree test inputs; the checkout's claimed SHA is not execution proof.
  const result = { schemaVersion: 1, ticket: 'bsolid-accessibility', sourceSha, checkout,
    owns: ['test/qualification/accessibility/**', 'tracking/qualification/accessibility.json', 'docs/accessibility-evidence.md'],
    docsConsulted: { library: 'solidjs', version: '2', pages: ['https://v2.solidjs.com/guides/testing',
      'https://v2.solidjs.com/migration/from-solid-1', 'https://v2.solidjs.com/concepts/reactivity'] },
    families: allFamilies, upstreamFamilies: families, solidOnlyFamilies: extras,
    sourceFiles, sourceDigest: digest(JSON.stringify(sourceFiles)), cases, parseErrors,
    matrix: makeMatrix(allFamilies), scenarios,
    accounting: { policy: 'Conservative full source registration denominator; no title-keyword exclusions. Literal loop/each domains retained. Dynamic expansions, generators, skip/todo/guards remain blockers, not fabricated expanded counts.',
      sourceRegistrations: cases.length, literalCaseInstances: cases.filter((r) => r.kind === 'case' && r.literalMultiplicity !== null)
        .reduce((n, r) => n + r.literalMultiplicity, 0), unresolvedExpansions: cases.filter((r) =>
          r.kind === 'generator' || r.literalMultiplicity === null).length,
      matrixRows: allFamilies.length * 9 },
    execution: { status: 'unexecuted', reason: 'Coordinator executes after exact archive freeze; no shared browsers launched by this batch.' } };
  result.gate = gate(result);
  return result;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = await inventory();
  const output = resolve(root, 'tracking/qualification/accessibility.json');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(data, null, 2)}\n`);
  console.log(JSON.stringify({ families: data.families.length, ...data.accounting, parseErrors: data.parseErrors, passed: data.gate.passed, output }, null, 2));
  if (data.parseErrors.length) process.exitCode = 1;
}
