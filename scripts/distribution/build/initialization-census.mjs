import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { filesIn, isProduction, root } from './index.mjs';

// Conservative inventory: function bodies run at invocation, while their
// defaults and class static initialization need separate review.
export async function census(directory, source = false) {
  const records = [];
  for (const file of await filesIn(directory)) {
    if (source ? !isProduction(file) : !file.endsWith('.js')) continue;
    const text = await fs.readFile(path.join(directory, file), 'utf8');
    const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isFunctionLike(node)) return;
      if (ts.isPropertyDeclaration(node) && !node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)) return;
      if (ts.isCallExpression(node) || ts.isNewExpression(node) || ts.isExpressionStatement(node)) {
        records.push({ file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1,
          kind: ts.SyntaxKind[node.kind], expression: node.getText(ast).slice(0, 300) });
      }
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  return records;
}
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const directory = process.argv[2] ?? path.join(root, 'packages/solid/src');
  console.log(JSON.stringify(await census(directory, !process.argv[2]), null, 2));
}
