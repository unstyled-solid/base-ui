import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Executable, code-only ledger. This inventories tests; it does not mark any
// component scenario passed when its shared foundation is still pending.
const sourceSha = '19511bb171f3b360b006c94cf6d07e53cb446505';
const sourceRoot = 'upstream/base-ui/packages/react/src/tooltip';
const targetRoot = 'packages/solid/src/tooltip';
interface SourceCase {
  source: string;
  line: number;
  title: string;
  environment: 'jsdom' | 'browser' | 'hydration' | 'types';
  target: string;
  stage: 'bsolid-c-tooltip' | 'bsolid-c-tooltip-handles';
  status: 'authored-pending-foundation' | 'queued-browser' | 'queued-hydration' | 'authored-types';
  issue: string;
  sourceSha: string;
}

function files(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)]);
}
function baseName(node: ts.Node): string | undefined {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isPropertyAccessExpression(node)) return baseName(node.expression);
  if (ts.isCallExpression(node)) return baseName(node.expression);
  return undefined;
}
function title(node: ts.Node | undefined): string | undefined {
  return node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined;
}
function parameters(node: ts.Expression): string[] {
  if (!ts.isCallExpression(node)) return [];
  if (ts.isPropertyAccessExpression(node.expression) && ['each', 'for'].includes(node.expression.name.text)) {
    const array = node.arguments[0];
    if (array && ts.isArrayLiteralExpression(array)) return array.elements.map(element => {
      if (ts.isObjectLiteralExpression(element)) {
        const name = element.properties.find(property => ts.isPropertyAssignment(property) && property.name.getText() === 'name');
        if (name && ts.isPropertyAssignment(name)) return title(name.initializer) ?? element.getText();
      }
      return element.getText();
    });
  }
  return parameters(node.expression);
}
function route(source: string, line: number, environment: SourceCase['environment']) {
  if (environment === 'types') return 'Tooltip.spec.tsx';
  if (environment === 'hydration') return 'Tooltip.hydration-fixture.tsx';
  if (environment === 'browser') return 'Tooltip.browser.test.tsx';
  if (source.includes('provider/')) return 'provider/TooltipProvider.test.tsx';
  if (source.includes('detached-triggers')) return 'root/TooltipRoot.detached-triggers.test.tsx';
  if (source.includes('root/')) return line >= 1611 ? 'root/TooltipRoot.nested.test.tsx' : 'root/TooltipRoot.test.tsx';
  return 'Tooltip.parts.test.tsx';
}
function inventory() {
  const cases: SourceCase[] = [];
  const generated = ['propForwarding', 'refForwarding', 'renderProp', 'className'].flatMap(name => {
    const path = `upstream/base-ui/packages/react/test/conformanceTests/${name}.tsx`;
    const ast = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const result: string[] = [];
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node) && baseName(node.expression) === 'it') {
        const value = title(node.arguments[0]);
        if (value) result.push(`${name}:${ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1}/${value}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
    return result;
  });
  for (const path of files(sourceRoot).filter(file => /\.(test|spec)\.tsx$/.test(file))) {
    const source = path.slice('upstream/base-ui/'.length);
    const ast = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function add(line: number, caseTitle: string, environment: SourceCase['environment'], targetOverride?: string) {
      const target = targetOverride ?? route(source, line, environment);
      cases.push({ source, line, title: caseTitle, environment, target, sourceSha,
        stage: /detached-triggers|viewport/.test(source) || environment === 'hydration' ? 'bsolid-c-tooltip-handles' : 'bsolid-c-tooltip',
        status: environment === 'browser' ? 'queued-browser' : environment === 'hydration' ? 'queued-hydration'
          : environment === 'types' ? 'authored-types' : 'authored-pending-foundation',
        issue: environment === 'browser' ? 'bsolid-browser' : environment === 'hydration' ? 'bsolid-hydration'
          : environment === 'types' ? 'bsolid-integration' : 'bsolid-popup',
      });
    }
    function walk(node: ts.Node, suites: string[], variants: string[], inheritedGate: SourceCase['environment']) {
      if (ts.isCallExpression(node)) {
        const name = baseName(node.expression); const caseTitle = title(node.arguments[0]);
        if ((name === 'it' || name === 'describe') && caseTitle !== undefined) {
          const gateText = node.expression.getText(ast);
          const gate = gateText.includes('!isJSDOM') ? 'hydration' : gateText.includes('isJSDOM') ? 'browser' : inheritedGate;
          const params = parameters(node.expression);
          const nextVariants = params.length ? variants.flatMap(parent => params.map(value => `${parent}[${value}]`)) : variants;
          if (name === 'it') {
            for (const variant of nextVariants) add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
              [...suites, `${caseTitle}${variant}`].join(' / '), gate);
            return;
          }
          const callback = node.arguments.find(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg));
          if (callback) ts.forEachChild(callback, child => walk(child, [...suites, caseTitle], nextVariants, gate));
          return;
        }
        if (name === 'describeConformance') {
          // The native harness preserves generated host/render/ref/class/style,
          // callback freshness, prevention/order and host-identity variants.
          for (const generatedTitle of generated) {
            add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
              [...suites, `describeConformance[${generatedTitle}; JSX cloning becomes owned render callback/ref composition]`].join(' / '), 'jsdom');
          }
          return;
        }
        if (name === 'popupConformanceTests') {
          add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, 'Popup conformance[controlled open]', 'jsdom');
          add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, 'Popup conformance[no exit animation]', 'browser', 'root/TooltipRoot.test.tsx');
          add(ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, 'Popup conformance[animation finished; upstream unconditional skip retained]', 'browser', 'root/TooltipRoot.test.tsx');
          return;
        }
      }
      ts.forEachChild(node, child => walk(child, suites, variants, inheritedGate));
    }
    if (path.endsWith('.spec.tsx')) {
      ast.statements.forEach(statement => {
        if (ts.isExpressionStatement(statement)) add(ast.getLineAndCharacterOfPosition(statement.getStart(ast)).line + 1, statement.getText(ast), 'types');
      });
    } else walk(ast, [], [''], 'jsdom');
  }
  return cases;
}

describe('Tooltip pinned recursive source inventory', () => {
  const cases = inventory();
  it(`assigns all ${cases.length} source titles, parameter variants and generated suites to owned targets`, () => {
    expect(cases.length).toBeGreaterThan(180);
    expect(new Set(cases.map(entry => entry.source)).size).toBe(11);
    for (const entry of cases) {
      expect(existsSync(join(targetRoot, entry.target)), `${entry.source}:${entry.line} ${entry.title}`).toBe(true);
      expect(entry.issue).toBeTruthy();
      expect(entry.sourceSha).toBe(sourceSha);
      expect(entry.status).not.toBe('passed');
    }
  });
  it('retains contained/detached/multiple-detached and all seven direction parameters', () => {
    for (const variant of ['contained triggers', 'detached triggers', 'multiple detached triggers']) {
      expect(cases.some(entry => entry.title.includes(`[${variant}]`))).toBe(true);
    }
    expect(cases.filter(entry => entry.source.endsWith('TooltipViewport.test.tsx') && entry.title.includes('$name['))).toHaveLength(7);
    expect(cases.filter(entry => entry.environment === 'hydration')).toHaveLength(2);
    expect(cases.some(entry => entry.title.includes('upstream unconditional skip'))).toBe(true);
  });
});
