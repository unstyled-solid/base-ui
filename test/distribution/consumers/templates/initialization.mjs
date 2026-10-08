import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

const input = JSON.parse(await fs.readFile('input.json', 'utf8'));
const records = [], failures = [];
const root = path.resolve('node_modules', input.name);
for (const entry of input.inventory.filter(entry => /^(dom|server)\/.*\.js$/.test(entry.file))) {
  const file = entry.file;
  const text = await fs.readFile(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const imports = new Map();
  for (const statement of ast.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const bindings = statement.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) {
      imports.set(item.name.text, { module: statement.moduleSpecifier.text, name: (item.propertyName ?? item.name).text });
    }
  }
  function visit(node) {
    if (ts.isFunctionLike(node)) return;
    if (ts.isPropertyDeclaration(node) && !node.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.StaticKeyword)) return;
    let safe, reason;
    if (ts.isCallExpression(node)) {
      const callee = node.expression.getText(ast), imported = imports.get(callee);
      if (imported?.module === 'solid-js' && imported.name === 'createContext') { safe = true; reason = 'RC13 local provider/Symbol factory'; }
      else if (imported?.module === '@solidjs/web' && imported.name === 'template') { safe = true; reason = 'RC13 lazy template factory'; }
      else if (callee === 'Symbol') { safe = true; reason = 'local Symbol allocation'; }
      else if (callee === 'Object.freeze' && (ts.isArrayLiteralExpression(node.arguments[0]) || ts.isObjectLiteralExpression(node.arguments[0]))) { safe = true; reason = 'freeze newly allocated value'; }
      else if (callee === 'attr' && file.endsWith('/scroll-area/root/stateAttributes.js')) { safe = true; reason = 'audited literal attribute closure factory'; }
      else if (callee === 'createLogOnce' && /\/utils\/(warn|error)\.js$/.test(file)) { safe = true; reason = 'audited logger closure factory'; }
      else if (callee === 'createFormatErrorMessage' && file.endsWith('/utils/formatErrorMessage.js')) { safe = true; reason = 'audited formatter closure factory'; }
      else { safe = false; reason = 'unreviewed import-time call'; }
    } else if (ts.isNewExpression(node)) {
      const callee = node.expression.getText(ast);
      safe = ['Map', 'Set', 'WeakMap', 'WeakSet'].includes(callee) || callee === 'Scheduler' && file.endsWith('/utils/createAnimationFrame.js');
      reason = safe ? 'local collection/scheduler allocation' : 'unreviewed import-time constructor';
    } else if (ts.isExpressionStatement(node)) {
      const expression = node.expression.getText(ast);
      safe = /^_P\$\w*\.prototype = Object\.prototype$/.test(expression) || expression === 'loggedMessages = new Set()';
      reason = safe ? 'compiler-local prototype or local logger cache assignment' : 'unreviewed module expression';
    }
    if (safe !== undefined) {
      const record = { file, line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1, expression: node.getText(ast), safe, reason };
      records.push(record); if (!safe) failures.push(record);
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
}
await fs.writeFile('initialization-result.json', JSON.stringify({ records, failures, sideEffects: false }, null, 2));
assert.deepEqual(failures, [], 'Unreviewed module initialization; inspect initialization-result.json');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
assert.equal(manifest.sideEffects, false, 'Expected audited module-elimination metadata');
