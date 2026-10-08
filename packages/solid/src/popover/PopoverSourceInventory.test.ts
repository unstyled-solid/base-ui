import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Read-only source accounting. "pending" is an explicit unported scenario, never a test pass.
// Parameter expressions and nested describe matrices stay attached to each source declaration.
const baseline = resolve('upstream/base-ui/packages/react/src/popover');
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
    ? files(resolve(directory, entry.name)) : /\.(test|spec)\.tsx$/.test(entry.name) ? [resolve(directory, entry.name)] : []);
}
function baseName(node: ts.Expression): string | undefined {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isCallExpression(node)) return baseName(node.expression);
  if (ts.isPropertyAccessExpression(node)) return baseName(node.expression);
  return undefined;
}

export const popoverSourceInventory = files(baseline).map((path) => {
  const source = relative(resolve('upstream/base-ui'), path);
  const text = readFileSync(path, 'utf8');
  const ast = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const stage = /detached-triggers|Viewport|TransitionState|Root.spec/.test(path) ? 'bsolid-c-popover-handles' : 'bsolid-c-popover';
  const cases: { source: string; line: number; title: string; suites: readonly string[]; parameters: string; stage: string; status: string; target?: string }[] = [];
  function visit(node: ts.Node, suites: readonly string[]) {
    let childrenSuites = suites;
    if (ts.isCallExpression(node)) {
      const name = baseName(node.expression);
      const title = node.arguments[0];
      if ((name === 'it' || name === 'test' || name === 'describe') && title &&
        (ts.isStringLiteral(title) || ts.isNoSubstitutionTemplateLiteral(title) || ts.isTemplateExpression(title))) {
        const value = ts.isTemplateExpression(title) ? title.getText(ast) : title.text;
        if (name === 'describe') childrenSuites = [...suites, `${value} (${node.expression.getText(ast)})`];
        else cases.push({ source, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          title: value, suites, parameters: node.expression.getText(ast), stage, status: 'pending-real-engine-replay' });
      }
      if (name === 'describeConformance' || name === 'popupConformanceTests') {
        cases.push({ source, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          title: name, suites, parameters: node.getText(ast), stage, status: 'authored-dependency-open',
          target: name === 'describeConformance' ? 'PopoverParts.test.tsx' : 'root/PopoverRoot.test.tsx' });
      }
    }
    ts.forEachChild(node, (child) => visit(child, childrenSuites));
  }
  visit(ast, []);
  return { source, stage, cases, typeSpec: path.endsWith('.spec.tsx') ? text : undefined };
});

describe('Popover source inventory @ 19511bb171f3b360b006c94cf6d07e53cb446505', () => {
  it('accounts for every recursive source test/spec and generated conformance invocation', () => {
    expect(popoverSourceInventory.map(({ source }) => source.replace('packages/react/src/popover/', '')).sort()).toEqual([
      'arrow/PopoverArrow.test.tsx', 'backdrop/PopoverBackdrop.test.tsx', 'close/PopoverClose.test.tsx',
      'description/PopoverDescription.test.tsx', 'popup/PopoverPopup.test.tsx', 'popup/PopoverPopupTransitionState.test.tsx',
      'portal/PopoverPortal.test.tsx', 'positioner/PopoverPositioner.spec.tsx', 'positioner/PopoverPositioner.test.tsx',
      'root/PopoverRoot.detached-triggers.test.tsx', 'root/PopoverRoot.spec.tsx', 'root/PopoverRoot.test.tsx',
      'title/PopoverTitle.test.tsx', 'trigger/PopoverTrigger.test.tsx', 'viewport/PopoverViewport.test.tsx',
    ].sort());
    const cases = popoverSourceInventory.flatMap(({ cases: entries }) => entries);
    expect(cases.length).toBeGreaterThan(140);
    expect(cases.filter(({ title }) => title === 'describeConformance')).toHaveLength(10);
    expect(cases.filter(({ title }) => title === 'popupConformanceTests')).toHaveLength(1);
    expect(cases.every(({ stage, status, parameters }) => stage && status && parameters)).toBe(true);
  });

  it('retains nested matrices, browser restrictions and both type specifications', () => {
    const cases = popoverSourceInventory.flatMap(({ cases: entries }) => entries);
    expect(cases.some(({ suites }) => suites.some((suite) => suite.includes('describe.for')))).toBe(true);
    expect(cases.some(({ parameters }) => parameters.includes('it.each'))).toBe(true);
    expect(cases.some(({ suites, parameters }) => parameters.includes('skipIf') || suites.some((suite) => suite.includes('skipIf')))).toBe(true);
    expect(popoverSourceInventory.filter(({ typeSpec }) => typeSpec !== undefined)).toHaveLength(2);
  });
});
