// Bounded source migration of the remaining pinned documentation families.
// CSS/assets are copied literally. This is build-time tooling, never a runtime shim.
import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { sourceGraph, walk } from './catalog.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const sourceRoot = 'upstream/base-ui/docs/src/app/(docs)/react';
const families = ['alert-dialog','avatar','button','checkbox-group','checkbox','collapsible','context-menu','fieldset','input','menubar','meter','number-field','otp-field','popover','preview-card','progress','radio-group','scroll-area','separator','slider','switch','toggle-group','toggle','toolbar','tooltip'];
const plans = [...families.map(name => ({ name, source: `${sourceRoot}/components/${name}/demos` })), ...['direction-provider','merge-props','use-render'].map(name => ({ name, source: `${sourceRoot}/utils/${name}/demos` })), { name: 'handbook-forms', source: `${sourceRoot}/handbook/forms/demos`, only: ['hero'] }];
const sha = '19511bb171f3b360b006c94cf6d07e53cb446505';
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

export function adaptSource(source, file) {
  const original = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const forwarded = [];
  function removeForward(n) {
    if (ts.isCallExpression(n) && n.expression.getText(original) === 'React.forwardRef') {
      const fn = n.arguments[0];
      forwarded.push({ start: n.getStart(original), end: n.end, value: `function ${fn.name?.text ?? ''}(${fn.parameters[0].getText(original)}) ${fn.body.getText(original).replace(/\s+ref=\{forwardedRef\}/g, '')}` });
      return;
    }
    ts.forEachChild(n, removeForward);
  }
  removeForward(original);
  for (const e of forwarded.sort((a,b) => b.start-a.start)) source = source.slice(0,e.start)+e.value+source.slice(e.end);
  source = source.replace(/\{ className,( children,)? \.\.\.props \}: ([^\n]+),?\s*\)\s*\{/g, (_,children,type) => `allProps: ${type.replace(/,$/,'')}) {\nconst props = omit(allProps, 'class'${children ? ", 'children'" : ''});`);
  source = source.replace(/\bclassName\b(?!\s*[=:])/g, 'allProps.class');
  if (file.endsWith('/components/combobox.tsx')) source = source.replace(/(?<![.\w])children(?=\s*\?)/g, 'allProps.children').replace('{children}', '{allProps.children}');
  let code = source.replace(/^['"]use client['"];?\s*/m, '').replace(/^import \* as React from ['"]react['"];?\s*/m, '')
    .replaceAll('@base-ui/react/', 'baseui-solid2/')
    .replaceAll('React.ComponentPropsWithoutRef', 'ComponentProps').replaceAll('React.ComponentPropsWithRef', 'ComponentProps').replaceAll('React.ComponentProps', 'ComponentProps')
    .replaceAll('React.ComponentType', 'Component').replaceAll('React.ReactElement', 'JSX.Element').replaceAll('React.ReactNode', 'JSX.Element').replaceAll('React.CSSProperties', 'JSX.CSSProperties')
    .replace(/React\.(MouseEvent|KeyboardEvent)<([^>]+)>/g, '($1 & { currentTarget: $2 })')
    .replace(/React\.(MouseEvent|KeyboardEvent|FormEvent|ChangeEvent)(?:<[^>]+>)?/g, (_,event) => event === 'FormEvent' || event === 'ChangeEvent' ? 'Event' : event)
    .replaceAll('React.useState', 'createSignal').replaceAll('React.useId', 'createUniqueId')
    .replaceAll('<React.Fragment>', '<>').replaceAll('</React.Fragment>', '</>')
    .replaceAll('className', 'class').replaceAll('htmlFor=', 'for=')
    .replaceAll('minLength=', 'minlength=').replaceAll('maxLength=', 'maxlength=').replaceAll('marginLeft:', "'margin-left':")
    .replaceAll('...props.style', "...(typeof props.style === 'object' ? props.style : {})")
    .replace(/\b(strokeLinecap|strokeLinejoin|strokeWidth|fillRule|clipRule|vectorEffect)=/g, name => name.replace(/[A-Z]/g, c => '-' + c.toLowerCase()));
  // The only mount effect in these families is the Progress simulation.
  code = code.replace('React.useEffect(() => {', 'onSettled(() => {').replace(/}, \[\]\);/g, '});');
  // Detached handles and JSX payloads belong to each preview instance.
  const preliminary = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const moved = preliminary.statements.filter(n => ts.isVariableStatement(n) && (n.getText(preliminary).includes('.createHandle') || n.declarationList.declarations.some(d => d.name.getText(preliminary) === 'cardContents')));
  if (moved.length) {
    const setup = moved.map(n => n.getText(preliminary)).join('\n');
    for (const n of [...moved].reverse()) code = code.slice(0, n.getStart(preliminary)) + code.slice(n.end);
    code = code.replace(/(export default function \w+\([^)]*\)\s*\{)/, `$1\n${setup}\n`);
  }
  // Bind identifiers before edits so a callback parameter named `value` never
  // accidentally becomes a call to a component's signal of the same name.
  const host = ts.createCompilerHost({ noLib: true });
  const originalGet = host.getSourceFile;
  host.getSourceFile = (name, ...args) => name === file ? ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX) : originalGet(name, ...args);
  const program = ts.createProgram([file], { noLib: true, noResolve: true, jsx: ts.JsxEmit.Preserve }, host);
  const ast = program.getSourceFile(file), checker = program.getTypeChecker();
  const signals = new Set(), payloads = new Map();
  function collect(n) {
    if (ts.isVariableDeclaration(n) && ts.isObjectBindingPattern(n.name) && n.initializer?.getText(ast) === 'useInvalidFeedback()') for (const e of n.name.elements) if (['activeInvalidIndex','invalidPulse','statusMessage'].includes(e.name.getText(ast))) signals.add(checker.getSymbolAtLocation(e.name));
    if (ts.isVariableDeclaration(n) && ts.isArrayBindingPattern(n.name) && n.initializer && ts.isCallExpression(n.initializer) && n.initializer.expression.getText(ast) === 'createSignal') signals.add(checker.getSymbolAtLocation(n.name.elements[0].name));
    if (ts.isArrowFunction(n) && n.parameters.length === 1 && ts.isObjectBindingPattern(n.parameters[0].name) && n.parameters[0].name.elements.some(e => (e.propertyName ?? e.name).getText(ast) === 'payload')) {
      for (const e of n.parameters[0].name.elements) payloads.set(checker.getSymbolAtLocation(e.name), `demoState.${(e.propertyName ?? e.name).getText(ast)}`);
    }
    ts.forEachChild(n, collect);
  }
  collect(ast);
  const edits = [];
  const edit = (n, value) => edits.push({ start: n.getStart(ast), end: n.end, value });
  function visit(n) {
    if (ts.isJsxAttribute(n)) {
      if (n.name.text === 'key') { edit(n, ''); return; }
      if (n.name.text === 'aria-hidden' && !n.initializer) { edit(n, 'aria-hidden="true"'); return; }
      if (n.name.text === 'render' && n.initializer && ts.isJsxExpression(n.initializer) && n.initializer.expression && ts.isJsxSelfClosingElement(n.initializer.expression)) {
        const el = n.initializer.expression;
        const props = el.attributes.getText(ast);
        edit(n, `render={(renderProps) => <${el.tagName.getText(ast)}${el.typeArguments ? `<${el.typeArguments.map(t => t.getText(ast)).join(', ')}>` : ''} {...renderProps} ${props} />}`);
        return;
      }
    }
    if (ts.isArrowFunction(n) && n.parameters.length === 1 && ts.isObjectBindingPattern(n.parameters[0].name) && n.parameters[0].name.elements.some(e => payloads.has(checker.getSymbolAtLocation(e.name)))) edit(n.parameters[0].name, 'demoState');
    if (ts.isIdentifier(n)) {
      const p = n.parent;
      if (ts.isBindingElement(p) || ts.isParameter(p) || (ts.isVariableDeclaration(p) && p.name === n) || (ts.isJsxAttribute(p) && p.name === n) || (ts.isPropertyAccessExpression(p) && p.name === n) || (ts.isPropertyAssignment(p) && p.name === n)) return;
      const symbol = checker.getSymbolAtLocation(n);
      if (signals.has(symbol) && symbol) edit(n, ts.isShorthandPropertyAssignment(p) ? `${n.text}: ${n.text}()` : `${n.text}()`);
      if (payloads.has(symbol)) edit(n, payloads.get(symbol));
    }
    ts.forEachChild(n, visit);
  }
  visit(ast);
  for (const e of edits.sort((a,b) => b.start - a.start)) code = code.slice(0,e.start) + e.value + code.slice(e.end);
  // A live component payload cannot be destructured out of Root's state object.
  code = code.replace(/<Payload\s*\/>/g, '<Dynamic component={demoState.payload} />');
  code = code.replace(/<demoState.payload\s*\/>/g, '<Dynamic component={demoState.payload} />');
  if (file.includes('otp-field/custom-sanitize/')) code = code.replace('const invalidClassName = getInvalidClassName(', 'const invalidClassName = () => getInvalidClassName(').replace('? invalidClassName :', '? invalidClassName() :');
  if (file.includes('/button/loading/')) code = code.replace('const labelId =', 'let timeout: ReturnType<typeof setTimeout> | undefined;\n  onCleanup(() => clearTimeout(timeout));\n  const labelId =').replace('        setTimeout(', '        timeout = setTimeout(');
  // These wrappers only extract class and forward all other props. Preserve live
  // access with an ownKeys/get proxy, not a destructured setup-time snapshot.
  code = code.replace(/\{ class, \.\.\.props \}: ([^\n]+)\) \{/g, 'allProps: $1) {\n  const props = new Proxy(allProps, { get(target, key) { return key === "class" ? undefined : Reflect.get(target, key); }, ownKeys(target) { return Reflect.ownKeys(target).filter(key => key !== "class"); }, getOwnPropertyDescriptor(target, key) { return key === "class" ? undefined : Reflect.getOwnPropertyDescriptor(target, key); } });');
  code = code.replace('const { toasts } = Toast.useToastManager();', 'const manager = Toast.useToastManager();').replace('return toasts.map(', 'return manager.toasts.map(');
  if (file.endsWith('/components/button.tsx')) code = code.replace("allProps: ComponentProps<'button'>", 'allProps: BaseButton.Props');
  if (file.endsWith('/components/toast.tsx')) code = code.replace('return manager.toasts.map((toast) => (', 'return <For each={manager.toasts} keyed={(toast) => toast.id}>{(item) => { const toast = new Proxy({}, { get: (_, key) => Reflect.get(item(), key) }) as ReturnType<typeof item>; return (').replace('  ));', '  ); }}</For>;');
  const remaining = code.match(/React\.\w+/g);
  if (remaining) throw new Error(`${file}: requires explicit native adaptation: ${[...new Set(remaining)]}`);
  const primitives = ['createSignal','createUniqueId','onCleanup','onSettled','omit','For'].filter(name => new RegExp(`\\b${name}\\b`).test(code));
  const webTypes = ['JSX','ComponentProps'].filter(name => new RegExp(`\\b${name}\\b`).test(code));
  return `${primitives.length ? `import { ${primitives.join(', ')} } from 'solid-js';\n` : ''}${/\bComponent\b/.test(code) ? "import type { Component } from 'solid-js';\n" : ''}${/\bDynamic\b/.test(code) ? "import { Dynamic } from '@solidjs/web';\n" : ''}${webTypes.length ? `import type { ${webTypes.join(', ')} } from '@solidjs/web';\n` : ''}${code.trimStart()}`;
}

async function write(file, bytes) { await fs.mkdir(path.dirname(file), {recursive:true}); await fs.writeFile(file, bytes); }
if (process.argv[1] && path.resolve(process.argv[1]) === import.meta.filename) for (const plan of plans) {
  const target = `docs/demos/${plan.name}`;
  const files = await walk(path.join(root, plan.source));
  // Copy the source dependency graph, including family-shared CSS and form wrappers.
  for (const file of files) {
    const rel = path.relative(path.join(root, plan.source), file);
    if (plan.only && !plan.only.includes(rel.split(path.sep)[0]) && !rel.startsWith('components/')) continue;
    if (rel.endsWith('/index.ts') || !/\.(tsx|css|svg|png|jpg|json)$/.test(rel)) continue;
    const bytes = await fs.readFile(file);
    // The two use-render examples have explicit native implementations below.
    if (plan.name === 'use-render' && rel.endsWith('.tsx')) continue;
    await write(path.join(root,target,rel), rel.endsWith('.tsx') ? adaptSource(bytes.toString(), `${plan.name}/${rel}`) : bytes);
  }
  const factories = files.filter(file => file.endsWith('/index.ts') && path.relative(path.join(root,plan.source),file).split(path.sep).length === 2 && (!plan.only || plan.only.includes(path.basename(path.dirname(file)))));
  const imports = ["import type { DemoEntry } from '../shared/types';"], entries = [];
  for (const factory of factories.sort((a,b) => a.includes('/hero/') ? -1 : b.includes('/hero/') ? 1 : a.localeCompare(b))) {
    const name = path.basename(path.dirname(factory));
    const variants = [];
    for (const variant of ['css-modules','tailwind']) {
      const source = `${target}/${name}/${variant}/index.tsx`;
      try { await fs.access(path.join(root,source)); } catch { continue; }
      const identifier = `Demo${imports.length}`;
      imports.push(`import ${identifier} from './${name}/${variant}';`);
      const graph = await sourceGraph(root,[source]);
      variants.push(`{ id: '${variant}', label: '${variant === 'css-modules' ? 'CSS Modules' : 'Tailwind'}', component: ${identifier}, files: ${JSON.stringify(graph.files.map(f => f.path))} }`);
    }
    if (!variants.length) throw new Error(`No implementation for ${plan.name}/${name}`);
    entries.push(`{ id: '${plan.name}/${name}', upstream: ${JSON.stringify(path.relative(path.join(root,'upstream/base-ui'),factory))}, variants: [${variants.join(',')}] }`);
  }
  await write(path.join(root,target,'entry.ts'), `${imports.join('\n')}\nexport default [\n${entries.join(',\n')}\n] satisfies DemoEntry[];\n`);
  console.log(`${plan.name}: ${entries.length} source demos migrated`);
}
