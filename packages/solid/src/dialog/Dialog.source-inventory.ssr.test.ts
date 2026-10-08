import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { assignDialogSource, dialogSourceFiles, dialogSourceSha, sourceParameterExpansions } from './tests/sourceInventory';

const upstream = resolve('upstream/base-ui/packages/react');
const family = resolve(upstream, 'src/dialog');
const target = resolve('packages/solid/src/dialog');
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(resolve(directory, entry.name)) : [resolve(directory, entry.name)]);
}
function callName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression) || ts.isCallExpression(expression)) return callName(expression.expression);
  return undefined;
}
function cases(path: string) {
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const result: { title: string; line: number }[] = [];
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const name = callName(node.expression);
      const title = node.arguments[0];
      if (name === 'it' || name === 'test') {
        if (title && (ts.isStringLiteralLike(title) || ts.isTemplateExpression(title))) result.push({ title: title.getText(source), line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 });
      } else if (name === 'describeConformance' || name === 'popupConformanceTests') {
        result.push({ title: `${name} generated conformance`, line: source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1 });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (path.endsWith('.spec.tsx')) result.push({ title: 'typed payload root children and trigger negative spec', line: 1 });
  return result;
}

describe('Dialog immutable source obligation inventory (not behavioral qualification)', () => {
  it('covers every recursive family test/spec without mutating the pinned checkout', () => {
    expect(dialogSourceSha).toBe('19511bb171f3b360b006c94cf6d07e53cb446505');
    const actual = files(family).filter((path) => /\.(test|spec)\.tsx$/.test(path)).map((path) => relative(family, path)).sort();
    expect(actual).toEqual([...dialogSourceFiles].sort());
    let total = 0;
    for (const file of actual) {
      const entries = cases(resolve(family, file));
      expect(entries.length, file).toBeGreaterThan(0);
      for (const entry of entries) {
        total++;
        const assignment = assignDialogSource(file, entry.line, entry.title);
        expect(assignment, `${file}:${entry.line} ${entry.title}`).toBeDefined();
        expect(assignment!.pending.length).toBeGreaterThan(0);
        for (const fixture of assignment!.targets) expect(existsSync(resolve(target, fixture)), `${file}:${entry.line} → ${fixture}`).toBe(true);
      }
    }
    expect(total).toBeGreaterThan(150);
  });

  it('retains the generated conformance leaves, parameter matrices and upstream unconditional skip', () => {
    const leaves = ['propForwarding.tsx', 'refForwarding.tsx', 'renderProp.tsx', 'className.tsx'];
    for (const leaf of leaves) expect(cases(resolve(upstream, 'test/conformanceTests', leaf)).length).toBeGreaterThan(0);
    expect(cases(resolve(upstream, 'test/popupConformanceTests.tsx')).length).toBeGreaterThan(0);
    expect(sourceParameterExpansions.rootTriggerKinds).toHaveLength(3);
    expect(sourceParameterExpansions.closedShadowNestedKinds.length * sourceParameterExpansions.closedShadowPortals.length).toBe(15);
    expect(sourceParameterExpansions.conformanceParts).toHaveLength(8);
    expect(sourceParameterExpansions.upstreamUnconditionalSkip).toContain(':156');
  });
});
