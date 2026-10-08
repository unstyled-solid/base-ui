import { readFileSync, readdirSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

// Executable source inventory, not parity evidence: all generated suites, parameter
// expressions and upstream restrictions remain visible to the final replay owner.
const sourceRoot = resolve('upstream/base-ui/packages/react/src/select');
const stage = {
  'root/SelectRoot.spec.tsx': 'bsolid-c-select',
  'root/SelectRoot.test.tsx': 'split-by-scenario',
  'store.test.tsx': 'bsolid-c-select',
  'label/SelectLabel.test.tsx': 'bsolid-c-select',
  'value/SelectValue.test.tsx': 'bsolid-c-select',
  'icon/SelectIcon.test.tsx': 'bsolid-c-select',
  'trigger/SelectTrigger.test.tsx': 'bsolid-c-select-interactions',
  'portal/SelectPortal.test.tsx': 'bsolid-c-select-interactions',
  'backdrop/SelectBackdrop.test.tsx': 'bsolid-c-select-interactions',
  'popup/SelectPopup.test.tsx': 'bsolid-c-select-interactions',
  'list/SelectList.test.tsx': 'bsolid-c-select-interactions',
  'item/SelectItem.test.tsx': 'bsolid-c-select-interactions',
  'item-text/SelectItemText.test.tsx': 'bsolid-c-select-interactions',
  'item-indicator/SelectItemIndicator.test.tsx': 'bsolid-c-select-interactions',
  'group/SelectGroup.test.tsx': 'bsolid-c-select-interactions',
  'group-label/SelectGroupLabel.test.tsx': 'bsolid-c-select-interactions',
  'positioner/SelectPositioner.test.tsx': 'bsolid-c-select-layout',
  'positioner/SelectPositioner.spec.tsx': 'bsolid-c-select-layout',
  'arrow/SelectArrow.test.tsx': 'bsolid-c-select-layout',
  'scroll-arrow/SelectScrollArrow.test.tsx': 'bsolid-c-select-layout',
  'scroll-up-arrow/SelectScrollUpArrow.test.tsx': 'bsolid-c-select-layout',
  'scroll-down-arrow/SelectScrollDownArrow.test.tsx': 'bsolid-c-select-layout',
} as const;
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.(test|spec)\.tsx$/.test(entry.name) ? [relative(sourceRoot, path)] : [];
  });
}
export interface SelectSourceScenario {
  source: string; line: number; expression: string; parameters: string[];
  restrictions: string[]; stage: string;
  evidence: 'source-inventoried-runtime-replay-open';
}
export function inventorySelectSource(): SelectSourceScenario[] {
  const scenarios: SelectSourceScenario[] = [];
  for (const file of files(sourceRoot)) {
    const text = readFileSync(resolve(sourceRoot, file), 'utf8');
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function walk(node: ts.Node, restrictions: string[] = []) {
      const expression = ts.isCallExpression(node) ? node.expression.getText(ast) : '';
      const restriction = ts.isCallExpression(node) && /^(describe|it|test)\.(skip|todo|skipIf|runIf)/.test(expression) ? node.getText(ast).split('{')[0] : null;
      const inherited = restriction ? [...restrictions, restriction] : restrictions;
      if (ts.isCallExpression(node) && (/^(it|test)(?:\.|$)/.test(expression) && (node.arguments.some(arg => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) || /^(it|test)\.todo$/.test(expression)) || /^describeConformance$|^popupConformanceTests$/.test(expression))) {
        const content = node.getText(ast);
        const layout = /align(?:ed|ment|Item)|scroll|position|touch|popover|resize|viewport|drag.*outside/i.test(content.split('async')[0]);
        const model = /value|label|defaultValue|serialize|autofill|form|field|dirty|filled|readOnly|disabled|id/i.test(content.split('async')[0]);
        const owner = stage[file as keyof typeof stage];
        scenarios.push({
          source: `packages/react/src/select/${file}`, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          expression: content, restrictions: inherited,
          parameters: [...expression.matchAll(/(?:each|skipIf|runIf)\(([^]*?)\)/g)].map(match => match[1]),
          stage: owner === 'split-by-scenario' ? layout ? 'bsolid-c-select-layout' : model ? 'bsolid-c-select' : 'bsolid-c-select-interactions' : owner ?? 'UNASSIGNED',
          evidence: 'source-inventoried-runtime-replay-open',
        });
      }
      ts.forEachChild(node, child => walk(child, inherited));
    }
    walk(ast);
  }
  return scenarios;
}
describe('Select pinned source stage inventory (not runtime parity)', () => {
  it('assigns every recursive source suite/spec to a stage', () => {
    expect(files(sourceRoot).sort()).toEqual(Object.keys(stage).sort());
  });
  it('preserves all test bodies, parameter expressions and browser restrictions for replay', () => {
    const scenarios = inventorySelectSource();
    expect(scenarios.length).toBeGreaterThan(200);
    expect(scenarios.every(scenario => scenario.stage !== 'UNASSIGNED')).toBe(true);
    expect(scenarios.some(scenario => scenario.parameters.length > 0)).toBe(true);
    expect(scenarios.some(scenario => scenario.restrictions.some(restriction => restriction.includes('isJSDOM')))).toBe(true);
  });
});
