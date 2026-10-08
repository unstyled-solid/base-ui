import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import * as BaseUI from '../../packages/solid/src/index';
import * as Floating from '../../packages/solid/src/floating-ui-react';
import * as FloatingUtils from '../../packages/solid/src/floating-ui-react/utils';

const root = process.cwd();
const upstream = join(root, 'upstream/base-ui');
const sha = '19511bb171f3b360b006c94cf6d07e53cb446505';
function source(path: string) {
  return execFileSync('rtk', ['proxy', 'git', 'show', `${sha}:${path}`], { cwd: upstream, encoding: 'utf8' });
}
function exportsOf(path: string) {
  const program = ts.createProgram([path], { module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.Preserve, noLib: true, types: [] });
  const checker = program.getTypeChecker();
  const file = program.getSourceFile(path)!;
  const symbol = checker.getSymbolAtLocation(file)!;
  const exports = checker.getExportsOfModule(symbol);
  const valueSymbol = (item: ts.Symbol) => item.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(item) : item;
  return { checker, exports, valueSymbol };
}
// A resolved type-only export can still point at a function symbol. Determine
// runtime exports from source syntax, rather than mistaking that alias for code.
function runtimeNames(path: string, seen = new Set<string>()): Set<string> {
  if (seen.has(path)) return new Set();
  seen.add(path);
  const file = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
  const names = new Set<string>();
  for (const node of file.statements) {
    if (ts.isExportDeclaration(node)) {
      if (node.isTypeOnly) continue;
      if (node.exportClause) {
        if (ts.isNamespaceExport(node.exportClause)) names.add(node.exportClause.name.text);
        else for (const specifier of node.exportClause.elements) if (!specifier.isTypeOnly) names.add(specifier.name.text);
      } else if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const base = resolve(dirname(path), node.moduleSpecifier.text);
        const target = [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')].find(ts.sys.fileExists);
        if (!target) throw new Error(`Unresolved source runtime barrel: ${path}: ${node.moduleSpecifier.text}`);
        for (const name of runtimeNames(target, seen)) names.add(name);
      }
    } else if (ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      if ((ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) || ts.isEnumDeclaration(node) || ts.isModuleDeclaration(node)) && node.name) names.add(node.name.text);
      if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations) if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text);
    }
  }
  return names;
}

describe('Root integration export contract', () => {
  it('uses every pinned root module, with only native utility export selection', () => {
    const pinned = ts.createSourceFile('index.ts', source('packages/react/src/index.ts'), ts.ScriptTarget.Latest, true);
    const actual = ts.createSourceFile('index.ts', readFileSync(join(root, 'packages/solid/src/index.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
    const modules = (file: ts.SourceFile) => file.statements.filter(ts.isExportDeclaration)
      .map((statement) => ({ path: (statement.moduleSpecifier as ts.StringLiteral).text, typeOnly: statement.isTypeOnly }));
    expect(modules(actual).slice(0, modules(pinned).length)).toEqual(modules(pinned));
    expect(modules(actual).slice(modules(pinned).length)).toEqual([
      { path: './internals/export-aliases/direction-provider', typeOnly: false },
    ]);
  });

  it('retains the complete canonical value/type export set and namespace parts', () => {
    expect(execFileSync('rtk', ['proxy', 'git', 'rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' }).trim()).toBe(sha);
    const pinned = exportsOf(join(upstream, 'packages/react/src/index.ts'));
    const actual = exportsOf(join(root, 'packages/solid/src/index.ts'));
    const runtime = runtimeNames(join(upstream, 'packages/react/src/index.ts'));
    const target = new Map(actual.exports.map((item) => [item.name, item]));
    expect(pinned.exports.map((item) => item.name).filter((name) => !target.has(name)), 'missing canonical root exports').toEqual([]);
    expect(Object.keys(BaseUI).filter((name) => !runtime.has(name)), 'unreviewed root runtime additions').toEqual(['createRender']);
    for (const item of pinned.exports) {
      expect(target.has(item.name), `missing root export ${item.name}`).toBe(true);
      const resolved = pinned.valueSymbol(item);
      if (runtime.has(item.name)) {
        expect(Reflect.get(BaseUI, item.name), `missing runtime export ${item.name}`).toBeDefined();
      }
      if (resolved.flags & ts.SymbolFlags.ValueModule) {
        const parts = pinned.checker.getExportsOfModule(resolved);
        const targetSymbol = actual.valueSymbol(target.get(item.name)!);
        const targetParts = actual.checker.getExportsOfModule(targetSymbol).map((part) => part.name);
        for (const part of parts) expect(targetParts, `${item.name}.${part.name}`).toContain(part.name);
      }
    }
    // Only explicitly native createRender is added at the aggregate utility level.
    expect(BaseUI.createRender).toBe(BaseUI.useRender);
    expect('useMediaQuery' in BaseUI).toBe(false);
    expect('mergeStyles' in BaseUI).toBe(false);
  });

  it('resolves real public subpaths to the same root functions and namespace objects', async () => {
    const manifest = JSON.parse(readFileSync(join(root, 'packages/solid/package.json'), 'utf8')) as {
      exports: Record<string, { default?: string; types?: string }>;
    };
    for (const [key, target] of Object.entries(manifest.exports)) {
      if (key === '.' || key === './types' || key.startsWith('./internals/') || key.startsWith('./unstable-')) continue;
      expect(target.default, key).toBeDefined();
      const module = await import(/* @vite-ignore */ `baseui-solid2/${key.slice(2)}`) as Record<string, unknown>;
      for (const [name, value] of Object.entries(module)) {
        // These family-local merge helpers are not exports of the pinned root.
        if (key === './merge-props' && ['InputProps', 'mergeStyles', 'isNativeEvent', 'isDefaultPrevented'].includes(name)) continue;
        expect(Reflect.get(BaseUI, name), `${key}:${name}`).toBe(value);
      }
    }
  });

  it('wires every pinned package key, keeping the public types facade type-only', async () => {
    const pinned = JSON.parse(source('packages/react/package.json')) as { exports: Record<string, string> };
    const manifest = JSON.parse(readFileSync(join(root, 'packages/solid/package.json'), 'utf8')) as {
      exports: Record<string, { default?: string; types?: string }>;
    };
    expect(Object.keys(pinned.exports).filter((key) => !manifest.exports[key]), 'unwired package keys').toEqual([]);
    expect(manifest.exports['./types']).toEqual({ types: './src/types/index.ts' });
    const specifier = 'baseui-solid2';
    const packageRoot = await import(/* @vite-ignore */ specifier);
    expect(Object.keys(packageRoot).sort()).toEqual(Object.keys(BaseUI).sort());
    for (const name of Object.keys(BaseUI)) expect(Reflect.get(packageRoot, name), name).toBe(Reflect.get(BaseUI, name));
    for (const [key, entry] of Object.entries(manifest.exports)) {
      if (!key.startsWith('./internals/') || !entry.default) continue;
      const module = await import(/* @vite-ignore */ `baseui-solid2/${key.slice(2)}`);
      expect(module, key).toBeDefined();
    }
  });

  it('maps hook names directly to the existing owned Solid primitives', () => {
    for (const [create, use] of [
      ['createDelayGroup', 'useDelayGroup'], ['createFloatingPortalNode', 'useFloatingPortalNode'],
      ['createFloatingNodeId', 'useFloatingNodeId'], ['createClick', 'useClick'],
      ['createClientPoint', 'useClientPoint'], ['createDismiss', 'useDismiss'],
      ['createFloatingRootContext', 'useFloatingRootContext'], ['createSyncedFloatingRootContext', 'useSyncedFloatingRootContext'],
      ['createFocus', 'useFocus'], ['createHoverFloatingInteraction', 'useHoverFloatingInteraction'],
      ['createHoverReferenceInteraction', 'useHoverReferenceInteraction'], ['createListNavigation', 'useListNavigation'],
      ['createTypeahead', 'useTypeahead'], ['createFloatingTree', 'FloatingTreeStore'],
    ]) expect(Reflect.get(Floating, create), use).toBe(Reflect.get(Floating, use));
    for (const name of ['arrow', 'autoPlacement', 'autoUpdate', 'computePosition', 'detectOverflow', 'flip',
      'getOverflowAncestors', 'hide', 'inline', 'limitShift', 'offset', 'platform', 'shift', 'size']) {
      expect(Reflect.get(Floating, name), name).toBeDefined();
    }
  });

  it('retains direct create/use identity on the published internal hook-shaped subpaths', async () => {
    for (const [path, names] of [
      ['useBaseUiId', ['BaseUiId']], ['useAnchorPositioning', ['AnchorPositioning']],
      ['useAnimationsFinished', ['AnimationsFinished']], ['useOpenChangeComplete', ['OpenChangeComplete']],
      ['usePressAndHold', ['PressAndHold']], ['useRenderElement', ['RenderElement']],
      ['useValueChanged', ['ValueChanged']], ['useTransitionStatus', ['TransitionStatus']],
      ['use-button', ['Button']], ['composite', ['CompositeListItem', 'CompositeRoot']],
      ['labelable-provider', ['AriaLabelledBy', 'LabelableId', 'Label']],
      ['field-register-control', ['RegisterFieldControl', 'FieldControlRegistration']],
    ] as const) {
      const module = await import(/* @vite-ignore */ `baseui-solid2/internals/${path}`);
      for (const name of names) {
        expect(module[`create${name}`], `${path}:create${name}`).toBeDefined();
        expect(module[`use${name}`], `${path}:use${name}`).toBe(module[`create${name}`]);
      }
    }
  });

  it('retains the pinned floating runtime, utility and type export names', () => {
    const runtime = runtimeNames(join(upstream, 'packages/react/src/floating-ui-react/index.ts'));
    expect([...runtime].filter((name) => Reflect.get(Floating, name) === undefined), 'missing floating runtime exports').toEqual([]);
    const utilities = runtimeNames(join(upstream, 'packages/react/src/floating-ui-react/utils.ts'));
    // React's synthetic-wrapper detector has no Solid-native behavior or callers.
    // Preserve behavioral utilities, rather than shipping dead React compatibility code.
    const frameworkOnlyUtilities = new Set(['isReactEvent']);
    expect([...frameworkOnlyUtilities].every((name) => utilities.has(name))).toBe(true);
    expect('isReactEvent' in FloatingUtils).toBe(false);
    expect.soft([...utilities].filter((name) => !frameworkOnlyUtilities.has(name) && Reflect.get(FloatingUtils, name) === undefined), 'missing floating utility exports').toEqual([]);
    const pinned = exportsOf(join(upstream, 'packages/react/src/floating-ui-react/types.ts'));
    const actual = exportsOf(join(root, 'packages/solid/src/floating-ui-react/types.ts'));
    const names = new Set(actual.exports.map((item) => item.name));
    expect(pinned.exports.map((item) => item.name).filter((name) => !names.has(name)), 'missing floating type exports').toEqual([]);
  });

  it('has no React or legacy renderer imports anywhere in production sources', () => {
    const failures: string[] = [];
    function visit(directory: string) {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) { if (entry.name !== 'proof') visit(path); continue; }
        if (!/\.tsx?$/.test(entry.name) || /\.(test|spec)\./.test(entry.name)) continue;
        const file = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
        function check(node: ts.Node) {
          let specifier: string | undefined;
          if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specifier = node.moduleSpecifier.text;
          if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) specifier = node.argument.literal.text;
          if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require')) && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) specifier = node.arguments[0].text;
          if (specifier && /^(react(?:-dom)?(?:\/|$)|@types\/react|@floating-ui\/react|@base-ui\/react|solid-js\/(web|store))/.test(specifier)) failures.push(`${path}: ${specifier}`);
          ts.forEachChild(node, check);
        }
        check(file);
      }
    }
    visit(resolve(root, 'packages/solid/src'));
    expect(failures).toEqual([]);
  });
});
