// Reproducible, family-local adaptation of the pinned MIT Base UI demos.
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const source = 'upstream/base-ui/docs/src/app/(docs)/react/components/drawer/demos';
const target = 'docs/demos/drawer';
const sha = '19511bb171f3b360b006c94cf6d07e53cb446505';
if (execFileSync('rtk', ['proxy', 'git', '-C', `${root}upstream/base-ui`, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== sha) {
  throw new Error('Drawer demo source must match the pinned SHA');
}
const check = process.argv.includes('--check');
const names = (await fs.readdir(`${root}${source}`, { withFileTypes: true }))
  .filter(entry => entry.isDirectory()).map(entry => entry.name)
  .sort((a, b) => a === 'hero' ? -1 : b === 'hero' ? 1 : a.localeCompare(b));
async function emit(relative, text) {
  const destination = `${root}${target}/${relative}`;
  if (check) {
    if (await fs.readFile(destination, 'utf8') !== text) throw new Error(`Stale drawer demo: ${relative}`);
  } else {
    await fs.mkdir(new URL('./', `file://${destination}`), { recursive: true });
    await fs.writeFile(destination, text);
  }
}
function adapt(text, file) {
  text = text.replace(/^'use client';\n/m, '').replace(/^import \* as React from 'react';\n/m, '')
    .replaceAll('@base-ui/react/', 'baseui-solid2/')
    .replaceAll('React.useState', 'createSignal').replaceAll('React.useId', 'createUniqueId')
    .replaceAll('React.ComponentProps', 'ComponentProps').replaceAll(' as React.CSSProperties', '')
    .replaceAll('className=', 'class=').replaceAll('htmlFor=', 'for=').replaceAll('defaultValue=', 'value=')
    .replaceAll('strokeLinecap=', 'stroke-linecap=').replaceAll('strokeLinejoin=', 'stroke-linejoin=')
    .replace(/\baria-hidden(?=[\s/>])/g, 'aria-hidden="true"')
    .replace(/\s+key=\{[^}]+\}/g, '')
    .replaceAll('onChange={(event) => setTextareaValue(event.target.value)}', 'onInput={(event) => setTextareaValue(event.currentTarget.value)}');
  // Rewrite only references to state, never bindings, setters, or callback arguments.
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const signals = new Set();
  function find(node) {
    if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) && node.initializer &&
        ts.isCallExpression(node.initializer) && node.initializer.expression.getText(ast) === 'createSignal') {
      signals.add(node.name.elements[0].name.getText(ast));
    }
    ts.forEachChild(node, find);
  }
  find(ast);
  const edits = [];
  function visit(node) {
    if (ts.isIdentifier(node) && signals.has(node.text)) {
      const parent = node.parent;
      if (!(ts.isBindingElement(parent) || ts.isParameter(parent) ||
          (ts.isJsxAttribute(parent) && parent.name === node) ||
          (ts.isPropertyAccessExpression(parent) && parent.name === node))) {
        edits.push({ start: node.getStart(ast), end: node.end, value: `${node.text}()` });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(ast);
  for (const edit of edits.sort((a, b) => b.start - a.start)) text = text.slice(0, edit.start) + edit.value + text.slice(edit.end);
  const primitives = ['createSignal', 'createUniqueId'].filter(name => text.includes(`${name}(`) || text.includes(`${name}<`));
  const types = text.includes('ComponentProps<') ? "import type { ComponentProps } from '@solidjs/web';\n" : '';
  // The icon has no callers supplying style; preserve its literal block display.
  text = text.replace("style={{ display: 'block', ...props.style }}", "style={{ display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}");
  return `// Adapted from Base UI (MIT), source SHA ${sha}.\n${primitives.length ? `import { ${primitives.join(', ')} } from 'solid-js';\n` : ''}${types}${text}`;
}
const imports = ["import type { DemoEntry } from '../shared/types';"];
const entries = [];
let variantCount = 0;
let cssCount = 0;
for (const name of names) {
  const upstream = `${source}/${name}/index.ts`;
  const factory = await fs.readFile(`${root}${upstream}`, 'utf8');
  if (!/export const \w+ = createDemo(?:WithVariants)?\(/.test(factory)) throw new Error(`Missing createDemo export: ${upstream}`);
  const variants = [];
  for (const variant of ['css-modules', 'tailwind']) {
    const relative = `${name}/${variant}/index.tsx`;
    const text = await fs.readFile(`${root}${source}/${relative}`, 'utf8');
    await emit(relative, adapt(text, relative));
    const identifier = `${name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())}${variant === 'css-modules' ? 'CssModules' : 'Tailwind'}`;
    imports.push(`import ${identifier} from './${name}/${variant}';`);
    const files = [`${target}/${relative}`];
    if (variant === 'css-modules') {
      const css = `${name}/${variant}/index.module.css`;
      await emit(css, await fs.readFile(`${root}${source}/${css}`, 'utf8'));
      files.push(`${target}/${css}`);
      cssCount++;
    }
    variants.push(`      { id: '${variant}', label: '${variant === 'css-modules' ? 'CSS Modules' : 'Tailwind'}', component: ${identifier}, files: ${JSON.stringify(files)} }`);
    variantCount++;
  }
  // Catalog upstream paths are relative to the upstream docs snapshot root.
  entries.push(`  {\n    id: 'drawer/${name}',\n    upstream: '${upstream.replace('upstream/base-ui/', '')}',\n    variants: [\n${variants.join(',\n')}\n    ],\n  }`);
}
await emit('entry.ts', `${imports.join('\n')}\n\nconst entries: DemoEntry[] = [\n${entries.join(',\n')}\n];\n\nexport default entries;\n`);
console.log(`Drawer ${check ? 'verified' : 'converted'}: ${names.length} entries, ${variantCount} TSX variants, ${cssCount} literal CSS modules`);
