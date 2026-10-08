import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';

// Executable source inventory, scoped to Toast tests. No parallel JSON/docs tracker.
// The case list is discovered from the actual pinned checkout, including each,
// skipped groups, template titles, type specs and generated conformance calls.
const root = resolve(process.cwd(), 'upstream/base-ui/packages/react/src/toast');
const assignments: Record<string, { stage: string; target: string[] }> = {
  'store.test.ts': { stage: 'bsolid-c-toast', target: ['ToastStore.test.ts'] },
  'createToastManager.test.tsx': { stage: 'bsolid-c-toast', target: ['ToastManager.test.tsx', 'ToastParts.test.tsx'] },
  'createToastManager.spec.tsx': { stage: 'bsolid-c-toast', target: ['Toast.types.tsx'] },
  'useToastManager.spec.tsx': { stage: 'bsolid-c-toast', target: ['Toast.types.tsx'] },
  'useToastManager.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastManager.test.tsx', 'ToastParts.test.tsx', 'ToastViewport.test.tsx', 'Toast.browser.test.tsx'] },
  'provider/ToastProvider.test.tsx': { stage: 'bsolid-c-toast', target: ['ToastManager.test.tsx'] },
  'root/ToastRoot.test.tsx': { stage: 'bsolid-c-toast-layout', target: ['ToastParts.test.tsx', 'Toast.browser.test.tsx', 'ToastConformance.test.tsx'] },
  'viewport/ToastViewport.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastViewport.test.tsx', 'ToastRealm.test.tsx', 'ToastParts.test.tsx', 'Toast.browser.test.tsx', 'ToastConformance.test.tsx'] },
  'content/ToastContent.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastParts.test.tsx', 'ToastConformance.test.tsx'] },
  'title/ToastTitle.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastParts.test.tsx', 'ToastConformance.test.tsx'] },
  'description/ToastDescription.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastParts.test.tsx', 'ToastConformance.test.tsx'] },
  'action/ToastAction.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastParts.test.tsx', 'ToastConformance.test.tsx'] },
  'close/ToastClose.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastParts.test.tsx', 'ToastConformance.test.tsx'] },
  'portal/ToastPortal.test.tsx': { stage: 'bsolid-c-toast-accessibility', target: ['ToastParts.test.tsx', 'ToastConformance.test.tsx'] },
  'positioner/ToastPositioner.test.tsx': { stage: 'bsolid-c-toast-layout', target: ['Toast.browser.test.tsx', 'ToastConformance.test.tsx'] },
  'arrow/ToastArrow.test.tsx': { stage: 'bsolid-c-toast-layout', target: ['Toast.browser.test.tsx', 'ToastConformance.test.tsx'] },
  'utils/isRenderableNode.test.ts': { stage: 'bsolid-c-toast-accessibility', target: ['utils/isRenderableNode.test.ts', 'ToastParts.test.tsx'] },
};
function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : /\.(test|spec)\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
function scenarios(path: string) {
  const file = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const cases: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const expression = node.expression.getText(file);
      if (/^(it|test)(\.|$)/.test(expression) || expression === 'describeConformance') {
        const title = node.arguments.find((argument) => ts.isStringLiteralLike(argument) || ts.isTemplateExpression(argument));
        cases.push(expression === 'describeConformance' ? 'generated conformance' : title?.getText(file) ?? expression);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return cases;
}
describe('Toast pinned recursive source inventory (assignment, not parity evidence)', () => {
  it('accounts for every test/spec file and assigns all three stages', () => {
    const discovered = files(root).map((path) => relative(root, path)).sort();
    expect(discovered).toEqual(Object.keys(assignments).sort());
    expect(new Set(Object.values(assignments).map((assignment) => assignment.stage)).size).toBe(3);
  });
  for (const [source, assignment] of Object.entries(assignments)) {
    it(`${assignment.stage}: ${source} → ${assignment.target.join(', ')}`, () => {
      expect(readFileSync(resolve(root, source), 'utf8').length).toBeGreaterThan(0);
      if (!source.includes('.spec.')) expect(scenarios(resolve(root, source)).length).toBeGreaterThan(0);
      assignment.target.forEach((target) => expect(readFileSync(resolve(process.cwd(), 'packages/solid/src/toast', target), 'utf8').length).toBeGreaterThan(0));
    });
  }
});
