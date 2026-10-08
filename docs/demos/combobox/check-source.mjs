import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import ts from 'typescript';
const root = process.cwd();
const family = 'docs/demos/combobox';
const source = 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos';
const entries = fs.readFileSync(path.join(root, family, 'entry.ts'), 'utf8');
let demos = 0;
let variants = 0;
let css = 0;
for (const demo of fs.readdirSync(path.join(root, source))) {
  const index = fs.readFileSync(path.join(root, source, demo, 'index.ts'), 'utf8');
  assert.match(index, /createDemo/);
  assert.ok(entries.includes(`combobox/${demo}`));
  assert.ok(entries.includes(`${source}/${demo}/index.ts`));
  demos++;
  for (const variant of ['css-modules', 'tailwind']) {
    const original = fs.readFileSync(path.join(root, source, demo, variant, 'index.tsx'), 'utf8');
    const file = `${family}/${demo}/${variant}/index.tsx`;
    const converted = fs.readFileSync(path.join(root, file), 'utf8');
    assert.ok(entries.includes(file));
    assert.doesNotMatch(converted, /React\.|@base-ui\/react|@tanstack\/react|className=|htmlFor=|\bkey=/);
    const literalClasses = (text) => {
      const output = [];
      const sf = ts.createSourceFile('index.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = (node) => {
        if (ts.isJsxAttribute(node) && ['className', 'class'].includes(node.name.getText(sf)) && node.initializer && ts.isStringLiteral(node.initializer)) output.push(node.initializer.text);
        ts.forEachChild(node, visit);
      };
      visit(sf);
      return output;
    };
    assert.deepEqual(literalClasses(converted), literalClasses(original), `${demo}/${variant}: literal class parity`);
    variants++;
    if (variant === 'css-modules') {
      assert.deepEqual(fs.readFileSync(path.join(root, family, demo, variant, 'index.module.css')), fs.readFileSync(path.join(root, source, demo, variant, 'index.module.css')));
      css++;
    }
  }
}
console.log(`PASS: ${demos} createDemo entries, ${variants} executing TSX variants, ${css} byte-identical CSS modules, all literal Tailwind classes preserved.`);
