import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { expect, it } from 'vitest';

it('inventories named prop helpers and rejects owned allocations inside prop stages', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const named = new Set<string>();
  const violations: string[] = [];
  let inlineStages = 0;
  for (const path of readdirSync(root, { recursive: true }) as string[]) {
    if (!/\.tsx?$/.test(path) || /(?:test|spec|fixture)/i.test(path)) continue;
    const source = ts.createSourceFile(path, readFileSync(`${root}/${path}`, 'utf8'), ts.ScriptTarget.Latest, true);
    const primitives = new Set<string>();
    const merges = new Set<string>();
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier) || statement.moduleSpecifier.text !== 'solid-js') continue;
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      for (const binding of bindings.elements) {
        const imported = (binding.propertyName ?? binding.name).text;
        if (/^(create|onSettled$|onCleanup$|children$|mapArray$|repeat$)/.test(imported)) primitives.add(binding.name.text);
        if (imported === 'merge') merges.add(binding.name.text);
      }
    }
    const checked = new Set<ts.Node>();
    function check(stage: ts.Node) {
      if (checked.has(stage)) return;
      checked.add(stage);
      function walk(node: ts.Node) {
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
          const name = node.expression.text;
          if (primitives.has(name) || (merges.has(name) && node.arguments.some((arg) => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)))) {
            violations.push(`${path}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${node.getText(source)}`);
          }
        }
        ts.forEachChild(node, walk);
      }
      walk(stage);
    }
    function visit(node: ts.Node) {
      if ((ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) && node.name) {
        const name = node.name.getText(source);
        const body = 'body' in node ? node.body : 'initializer' in node ? node.initializer : undefined;
        if (/^get[A-Z].*Props$/.test(name) && body) { named.add(name); check(body); }
      }
      // Include literal functional stages whether their array is in a local
      // binding, a props getter, a createRenderElement call, or a JSX prop.
      if (ts.isArrayLiteralExpression(node)) for (const element of node.elements) {
        if (ts.isArrowFunction(element) || ts.isFunctionExpression(element)) {
          // Conservatively include local/returned arrays too: their consumers
          // may pass the array through another variable before composition.
          inlineStages++; check(element);
        }
      }
      if (ts.isPropertyAssignment(node) && node.name.getText(source) === 'propGetter') check(node.initializer);
      if ((ts.isMethodDeclaration(node) || ts.isGetAccessorDeclaration(node)) && ['props', 'propGetter'].includes(node.name.getText(source)) && node.body) check(node.body);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  // New helpers require a deliberate runtime purity case, not just a grep.
  expect([...named].sort()).toEqual([
    'getButtonProps', 'getChildProps', 'getDescriptionProps', 'getInlineRectTriggerProps', 'getItemProps',
    'getParentProps', 'getPointerProps', 'getRootProps', 'getStateAttributesProps', 'getTouchProps', 'getValidationProps',
  ]);
  expect(inlineStages).toBeGreaterThan(10);
  expect(violations).toEqual([]);
});
