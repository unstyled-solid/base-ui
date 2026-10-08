// Development-only inventory. A stage assignment is not a translated/passing assertion.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import ts from 'typescript';

export const DRAWER_SOURCE_SHA = '19511bb171f3b360b006c94cf6d07e53cb446505';
export interface DrawerSourceCase {
  source: string;
  title: string;
  declaration: string;
  parameters: readonly string[];
  browserRestricted: boolean;
  skippedOrTodo: boolean;
  stage: 'bsolid-c-drawer' | 'bsolid-c-drawer-gestures' | 'bsolid-c-drawer-keyboard';
  targetSuite: string;
  /** Open until every source assertion has been reconciled, including generated conformance. */
  reconciliation: 'pending';
}
function files(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(root, entry.name);
    return entry.isDirectory() ? files(path) : /\.(test|spec)\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
export function inventoryDrawerSource(repository: string): DrawerSourceCase[] {
  const sourceRoot = resolve(repository, 'upstream/base-ui/packages/react/src/drawer');
  const cases: DrawerSourceCase[] = [];
  for (const path of files(sourceRoot)) {
    const text = readFileSync(path, 'utf8');
    const source = relative(resolve(repository, 'upstream/base-ui'), path);
    const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node: ts.Node) {
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText(file);
        const conformance = expression === 'describeConformance';
        if ((/^(it|test)(\b|\.)/.test(expression) && !expression.endsWith('.each') && !expression.endsWith('.skipIf')) || conformance) {
          const first = node.arguments[0];
          if (conformance || (first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first)))) {
            const title = conformance ? 'generated conformance cases' : (first as ts.StringLiteral).text;
            const parameters: string[] = [];
            function collect(call: ts.Expression) {
              if (!ts.isCallExpression(call)) return;
              if (ts.isPropertyAccessExpression(call.expression) && call.expression.name.text === 'each') parameters.push(...call.arguments.map(argument => argument.getText(file)));
              collect(call.expression);
              if (ts.isPropertyAccessExpression(call.expression)) collect(call.expression.expression);
            }
            collect(node.expression);
            const keyboard = source.includes('virtual-keyboard-provider');
            const geometry = !keyboard && (source.includes('/viewport/') || source.includes('/swipe-area/') || source.includes('/popup/') || source.includes('SnapPoint') || /swipe|snap point|frontmost|nested.*height/i.test(title));
            const stage = keyboard ? 'bsolid-c-drawer-keyboard' : geometry ? 'bsolid-c-drawer-gestures' : 'bsolid-c-drawer';
            cases.push({ source, title, declaration: expression, parameters, browserRestricted: expression.includes('skipIf(isJSDOM)'),
              skippedOrTodo: /\.(skip|todo)\b/.test(expression), stage,
              targetSuite: keyboard ? 'virtual-keyboard-provider/DrawerVirtualKeyboardProvider.test.tsx + DrawerKeyboardGeometry.browser.test.tsx'
                : source.includes('/viewport/') ? 'viewport/DrawerArbitration.test.ts + DrawerGestures.browser.test.tsx'
                : source.includes('/swipe-area/') ? 'viewport/DrawerGestures.browser.test.tsx'
                : source.includes('SnapPoint') ? 'root/DrawerSnapPoints.test.ts'
                : source.includes('/popup/') ? 'viewport/DrawerGestures.browser.test.tsx'
                : source.replace('packages/react/src/drawer/', ''), reconciliation: 'pending' });
          }
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(file);
    if (path.endsWith('.spec.tsx')) cases.push({ source, title: 'public API and reason-to-event type narrowing', declaration: 'type assertions', parameters: [], browserRestricted: false, skippedOrTodo: false, stage: 'bsolid-c-drawer', targetSuite: 'root/DrawerRoot.spec.tsx', reconciliation: 'pending' });
  }
  return cases;
}
