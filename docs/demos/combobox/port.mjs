// Reproducible family-local source conversion from the pinned read-only checkout.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const target = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(target, '../../..');
const upstream = 'upstream/base-ui/docs/src/app/(docs)/react/components/combobox/demos';
const demos = ['hero', 'multiple', 'grouped', 'input-inside-popup', 'create-items', 'creatable', 'async-single', 'async-multiple', 'virtualized'];
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const f = ts.factory;
const call = (name, args = [], types) => f.createCallExpression(f.createIdentifier(name), types, args);

function convert(source, demo) {
  source = source.replace(/'use client';\n/, '').replace("import * as React from 'react';", "import { createSignal, createMemo, createUniqueId, onCleanup, For } from 'solid-js';\nimport type { ComponentProps, JSX } from '@solidjs/web';")
    .replaceAll('@base-ui/react/', 'baseui-solid2/').replace("import { useVirtualizer } from '@tanstack/react-virtual';", "import { createVirtualizer, type Virtualizer } from '../../virtualizer';")
    .replaceAll('React.ComponentProps', 'ComponentProps').replaceAll('React.CSSProperties', 'JSX.CSSProperties')
    .replaceAll('strokeLinecap=', 'stroke-linecap=').replaceAll('strokeLinejoin=', 'stroke-linejoin=')
    .replaceAll("style={{ display: 'block', ...props.style }}", "style={typeof props.style === 'string' ? `display:block;${props.style}` : { display: 'block', ...(typeof props.style === 'object' ? props.style : {}) }}")
    .replaceAll('aria-hidden />', 'aria-hidden="true" />').replaceAll('aria-busy={isPending || undefined}', 'aria-busy={isPending ? "true" : undefined}')
    .replace(/aria-hidden(?=\s+className)/g, 'aria-hidden="true"')
    .replaceAll('height: totalSize', 'height: `${totalSize()}px`').replaceAll('height: virtualItem.size', 'height: `${virtualItem.size}px`')
    .replaceAll('React.KeyboardEvent<HTMLInputElement>', 'KeyboardEvent').replaceAll('React.FormEvent<HTMLFormElement>', 'SubmitEvent')
    .replaceAll('<React.Fragment>', '<>').replaceAll('</React.Fragment>', '</>')
    .replaceAll('React.RefObject<Virtualizer | null>', '{ current: Virtualizer | null }')
    .replace(/type Virtualizer = ReturnType<[^\n]+;\n?/, '')
    .replace('React.useImperativeHandle(virtualizerRef, () => virtualizer);', 'virtualizerRef.current = virtualizer;\n  onCleanup(() => { virtualizerRef.current = null; });')
    .replace('useVirtualizer({', 'createVirtualizer({')
    .replace('count: filteredItems.length,', 'get count() { return filteredItems().length; },')
    .replace('enabled: open,', 'get enabled() { return props.open; },')
    .replace(/function VirtualizedList\(\{[\s\S]*?\}\) \{/, `function VirtualizedList(props: { open?: boolean; virtualizerRef: { current: Virtualizer | null } }) {\n  const virtualizerRef = props.virtualizerRef;`)
    .replace(/React.useCallback\(\s*(\(element: HTMLDivElement \| null\) => \{[\s\S]*?\n    \}),\s*\[virtualizer\],\s*\)/, '$1')
    .replace('const totalSize = virtualizer.getTotalSize();', 'const totalSize = () => virtualizer.getTotalSize();')
    .replace(/\n  if \(!filteredItems.length\) \{\n    return null;\n  \}\n/, '\n');
  if (demo.startsWith('async-')) {
    source = source.replace('const [isPending, startTransition] = React.useTransition();', 'const [isPending, setPending] = createSignal(false);\n  onCleanup(() => abortControllerRef.current?.abort());')
      .replace('abortControllerRef.current = controller;', 'abortControllerRef.current = controller;\n        setPending(false);')
      .replace('startTransition(async () => {', 'setPending(true);\n        void (async () => {')
      .replace('startTransition(() => {\n            setSearchResults(result.users);\n            setError(result.error);\n          });', 'setSearchResults(result.users);\n          setError(result.error);\n          setPending(false);')
      .replace(/\n        \}\);\n      \}\}/, '\n        })();\n      }}');
  }
  const sf = ts.createSourceFile('index.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const accessors = new Set(['totalSize', ...(demo === 'virtualized' ? ['filteredItems'] : [])]);
  function collect(node) {
    if (ts.isVariableDeclaration(node) && node.initializer) {
      const init = node.initializer;
      if (ts.isArrayBindingPattern(node.name) && ts.isCallExpression(init) && /(?:React\.useState|createSignal)/.test(init.expression.getText(sf))) accessors.add(node.name.elements[0].name.getText(sf));
      if (ts.isIdentifier(node.name) && ts.isCallExpression(init) && init.expression.getText(sf) === 'React.useMemo') accessors.add(node.name.text);
      if (ts.isIdentifier(node.name) && ['trimmedSearchValue', 'status', 'emptyMessage', 'trimmed', 'lowered', 'exactExists', 'itemsForView'].includes(node.name.text)) accessors.add(node.name.text);
    }
    ts.forEachChild(node, collect);
  }
  collect(sf);
  const transformed = ts.transform(sf, [(ctx) => {
    function visit(node) {
      if (ts.isJsxAttribute(node)) {
        const name = node.name.getText(sf);
        if (name === 'key') return undefined;
        if (name === 'className' || name === 'htmlFor') return f.updateJsxAttribute(node, f.createIdentifier(name === 'className' ? 'class' : 'for'), ts.visitNode(node.initializer, visit));
        if (name === 'ref' && node.initializer && ts.isJsxExpression(node.initializer) && ts.isIdentifier(node.initializer.expression) && ['createInputRef', 'comboboxInputRef'].includes(node.initializer.expression.text)) {
          const ref = node.initializer.expression.text;
          return f.updateJsxAttribute(node, node.name, f.createJsxExpression(undefined, f.createArrowFunction(undefined, undefined, [f.createParameterDeclaration(undefined, undefined, 'element')], undefined, f.createToken(ts.SyntaxKind.EqualsGreaterThanToken), f.createBinaryExpression(f.createPropertyAccessExpression(f.createIdentifier(ref), 'current'), f.createToken(ts.SyntaxKind.EqualsToken), f.createIdentifier('element')))));
        }
      }
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && ['trimmedSearchValue', 'status', 'emptyMessage', 'trimmed', 'lowered', 'exactExists', 'itemsForView'].includes(node.name.text)) {
        return f.updateVariableDeclaration(node, node.name, node.exclamationToken, undefined, call('createMemo', [f.createArrowFunction(undefined, undefined, [], undefined, f.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.visitNode(node.initializer, visit))]));
      }
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(sf) === 'React') {
        const method = node.expression.name.text;
        if (method === 'useId') return call('createUniqueId');
        if (method === 'useState') return call('createSignal', node.arguments.map((a) => ts.visitNode(a, visit)), node.typeArguments);
        if (method === 'useMemo') return call('createMemo', [ts.visitNode(node.arguments[0], visit)]);
        if (method === 'useRef') return f.createAsExpression(f.createObjectLiteralExpression([f.createPropertyAssignment('current', node.arguments[0])]), f.createTypeLiteralNode([f.createPropertySignature(undefined, 'current', undefined, node.typeArguments?.[0] ?? f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword))]));
      }
      if (ts.isIdentifier(node) && accessors.has(node.text)) {
        const parent = node.parent;
        if ((ts.isVariableDeclaration(parent) && parent.name === node) || ts.isBindingElement(parent) || (ts.isCallExpression(parent) && parent.expression === node) || (ts.isPropertySignature(parent) && parent.name === node) || (ts.isPropertyAccessExpression(parent) && parent.name === node) || (ts.isPropertyAssignment(parent) && parent.name === node) || ts.isJsxAttribute(parent)) return node;
        return call(node.text);
      }
      return ts.visitEachChild(node, visit, ctx);
    }
    return (node) => ts.visitNode(node, visit);
  }]);
  let output = printer.printFile(transformed.transformed[0]);
  if (demo === 'async-single') {
    output = output.replace('const items = createMemo(() => {', 'const items = createMemo(() => {\n        const selected = selectedValue();')
      .replace('!selectedValue() || searchResults().some((user) => user.id === selectedValue().id)', '!selected || searchResults().some((user) => user.id === selected.id)')
      .replace('[...searchResults(), selectedValue()]', '[...searchResults(), selected]')
      .replace('if (!open && selectedValue()) {\n                setSearchResults([selectedValue()]);', 'const selected = selectedValue();\n            if (!open && selected) {\n                setSearchResults([selected]);');
  }
  return output;
}

const imports = ["import type { DemoEntry } from '../shared/types';"];
const entries = [];
for (const [i, demo] of demos.entries()) {
  const sourceIndex = fs.readFileSync(path.join(root, upstream, demo, 'index.ts'), 'utf8');
  if (!sourceIndex.includes('createDemo')) throw new Error(`No createDemo: ${demo}`);
  const variants = [];
  for (const [v, variant] of ['css-modules', 'tailwind'].entries()) {
    const dir = path.join(target, demo, variant);
    fs.mkdirSync(dir, { recursive: true });
    const input = path.join(root, upstream, demo, variant, 'index.tsx');
    fs.writeFileSync(path.join(dir, 'index.tsx'), convert(fs.readFileSync(input, 'utf8'), demo));
    const files = [`docs/demos/combobox/${demo}/${variant}/index.tsx`];
    if (variant === 'css-modules') {
      fs.copyFileSync(path.join(root, upstream, demo, variant, 'index.module.css'), path.join(dir, 'index.module.css'));
      files.push(`docs/demos/combobox/${demo}/${variant}/index.module.css`);
    }
    if (demo === 'virtualized') files.push('docs/demos/combobox/virtualizer.ts');
    imports.push(`import Demo${i}Variant${v} from './${demo}/${variant}';`);
    variants.push(`{ id: '${variant}', label: '${variant === 'css-modules' ? 'CSS Modules' : 'Tailwind'}', component: Demo${i}Variant${v}, files: ${JSON.stringify(files)} }`);
  }
  entries.push(`{ id: 'combobox/${demo}', upstream: '${upstream}/${demo}/index.ts', variants: [${variants.join(', ')}] }`);
}
fs.writeFileSync(path.join(target, 'entry.ts'), imports.join('\n') + '\n\nexport default [\n' + entries.join(',\n') + '\n] satisfies DemoEntry[];\n');
console.log(`Converted ${demos.length} demos, ${demos.length * 2} TSX variants, ${demos.length} literal CSS modules.`);
