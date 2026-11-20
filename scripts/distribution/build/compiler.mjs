import { createRequire } from 'node:module';
import path from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import ts from 'typescript';
import { parseSync, transformSync } from '@babel/core';
import solid from '@solidjs/babel-plugin';
import { transform as nativeTransform } from '@solidjs/compiler';
import config from '../../../packages/solid/build.config.mjs';

const require = createRequire(import.meta.url);
// The pinned Vite integration owns this installed source-map composer.
const viteRequire = createRequire(require.resolve('@solidjs/vite-plugin'));
const remapping = viteRequire('@ampproject/remapping');
export function verifyToolchain() {
  for (const [name, version] of Object.entries({
    '@solidjs/compiler': config.compilerVersion,
    '@solidjs/babel-plugin': config.compilerVersion,
    '@babel/core': config.babelVersion,
    'solid-js': config.runtimeVersion,
    '@solidjs/web': config.runtimeVersion,
    typescript: '5.9.3',
  })) {
    let directory = path.dirname(require.resolve(name));
    while (!existsSync(path.join(directory, 'package.json'))) directory = path.dirname(directory);
    const actual = JSON.parse(readFileSync(path.join(directory, 'package.json'), 'utf8')).version;
    if (actual !== version) throw new Error(`Build requires ${name}@${version}; found ${actual}`);
  }
}

// Match the harness: Babel lowers typed JSX, then TypeScript erases types. No React presets,
// transform-runtime, bundling, development instrumentation, or second JSX pass.
export function compile(source, filename, generate, resolveImport = value => value, compiler = config.compiler, environment = 'production') {
  if (!['production', 'development'].includes(environment)) throw new Error(`Unknown build environment: ${environment}`);
  const options = { moduleName: config.moduleName, generate, hydratable: config.hydratable, dev: config.dev };
  let lowered;
  if (compiler === 'babel') {
    lowered = transformSync(source, {
      filename, sourceFileName: filename, configFile: false, babelrc: false,
      sourceType: 'module', comments: true, sourceMaps: true,
      parserOpts: { plugins: ['typescript', 'jsx'] },
      plugins: [[solid, options]],
    });
  } else {
    lowered = nativeTransform(source, { filename, ...options, sourceMap: true });
    lowered.map = typeof lowered.map === 'string' ? JSON.parse(lowered.map) : lowered.map;
  }
  const result = ts.transpileModule(lowered.code, {
    fileName: filename,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve, sourceMap: true, inlineSources: true,
      removeComments: false, newLine: ts.NewLineKind.LineFeed,
    },
    reportDiagnostics: true,
    transformers: { before: [context => {
      const environmentNodes = new WeakSet();
      const terminatingGuards = new WeakSet();
      const mark = node => { environmentNodes.add(node); return node; };
      const terminates = statement => ts.isReturnStatement(statement) || ts.isThrowStatement(statement) ||
        ts.isBlock(statement) && statement.statements.some(terminates);
      // This is an environment-guard transform, not a general JS minifier.
      // Refuse future guards whose removal would change hoisted bindings/TDZ.
      const assertDiscardable = (node, tail = false) => {
        if (ts.isFunctionDeclaration(node) || ts.isClassDeclaration(node) && tail ||
            ts.isVariableDeclarationList(node) && (tail || !(node.flags & ts.NodeFlags.BlockScoped))) {
          throw new Error(`${filename}: environment guard contains bindings requiring scope-aware dead-code elimination`);
        }
        if (!ts.isFunctionLike(node)) ts.forEachChild(node, child => assertDiscardable(child, tail));
      };
      const visit = node => {
        if (ts.isStringLiteral(node) && (
          (ts.isImportDeclaration(node.parent) || ts.isExportDeclaration(node.parent)) && node.parent.moduleSpecifier === node ||
          ts.isCallExpression(node.parent) && node.parent.expression.kind === ts.SyntaxKind.ImportKeyword
        )) return context.factory.createStringLiteral(resolveImport(node.text));
        if (ts.isPropertyAccessExpression(node) && node.getText() === 'process.env.NODE_ENV') {
          return mark(context.factory.createStringLiteral(environment));
        }
        if (ts.isExpressionStatement(node) && ts.isStringLiteral(node.expression) &&
            ['use client', 'use server', 'use memo', 'use no memo'].includes(node.expression.text)) return undefined;
        node = ts.visitEachChild(node, visit, context);
        // Fold only literal environment guards, preserving evaluation of any
        // unknown operands. Do not minify names or change module boundaries.
        const truth = expression => {
          if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
          if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
          if (ts.isParenthesizedExpression(expression)) return truth(expression.expression);
          if (ts.isBinaryExpression(expression)) {
            const left = truth(expression.left), right = truth(expression.right);
            if (expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
              if (left === false || right === false) return false;
              if (left === true) return right;
            }
            if (expression.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
              if (left === true || right === true) return true;
              if (left === false) return right;
            }
          }
        };
        if (ts.isParenthesizedExpression(node) && environmentNodes.has(node.expression)) mark(node);
        if (ts.isBinaryExpression(node) && (environmentNodes.has(node.left) || environmentNodes.has(node.right))) {
          mark(node);
          const op = node.operatorToken.kind;
          if (ts.isStringLiteral(node.left) && ts.isStringLiteral(node.right) &&
              [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(op)) {
            const equal = node.left.text === node.right.text;
            return mark((op === ts.SyntaxKind.EqualsEqualsEqualsToken ? equal : !equal) ? context.factory.createTrue() : context.factory.createFalse());
          }
          // Only discard the left operand when it is a literal (not merely an
          // expression whose result is known): getters/calls must still run.
          if (node.left.kind === ts.SyntaxKind.TrueKeyword || node.left.kind === ts.SyntaxKind.FalseKeyword) {
            const left = truth(node.left);
            if (op === ts.SyntaxKind.AmpersandAmpersandToken) return mark(left ? node.right : node.left);
            if (op === ts.SyntaxKind.BarBarToken) return mark(left ? node.left : node.right);
          }
        }
        if (ts.isIfStatement(node) && environmentNodes.has(node.expression)) {
          const value = truth(node.expression);
          if (value !== undefined) {
            const branch = value ? node.thenStatement : node.elseStatement;
            const discarded = value ? node.elseStatement : node.thenStatement;
            if (discarded) assertDiscardable(discarded);
            if ([ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword].includes(node.expression.kind)) {
              if (branch && terminates(branch)) terminatingGuards.add(branch);
              return branch ?? context.factory.createEmptyStatement();
            }
            return context.factory.createBlock([
              context.factory.createExpressionStatement(node.expression),
              ...(branch ? [branch] : []),
            ], true);
          }
        }
        if (ts.isBlock(node)) {
          const end = node.statements.findIndex(statement => terminatingGuards.has(statement));
          if (end >= 0) {
            node.statements.slice(end + 1).forEach(statement => assertDiscardable(statement, true));
            return context.factory.updateBlock(node, node.statements.slice(0, end + 1));
          }
        }
        return node;
      };
      return file => ts.visitNode(file, visit);
    }] },
  });
  const errors = result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error);
  if (errors?.length) throw new Error(`${filename}: ${ts.formatDiagnostics(errors, {
    getCanonicalFileName: f => f, getCurrentDirectory: () => '.', getNewLine: () => '\n',
  })}`);
  const code = result.outputText.replace(/\n?\/\/# sourceMappingURL=.*(?:\n|$)/g, '\n');
  const stripMap = JSON.parse(result.sourceMapText);
  stripMap.sources = [filename];
  stripMap.sourceRoot = '';
  lowered.map.sources = [filename];
  lowered.map.sourcesContent = [source];
  lowered.map.sourceRoot = '';
  const map = JSON.parse(remapping([stripMap, lowered.map], () => null).toString());
  parseSync(code, { configFile: false, babelrc: false, sourceType: 'module' });
  return { code, map };
}

export function moduleImports(code, filename) {
  const file = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const imports = [];
  const visit = node => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      imports.push(node.moduleSpecifier.text);
    }
    if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        ts.isIdentifier(node.expression) && node.expression.text === 'require')) {
      if (node.expression.kind !== ts.SyntaxKind.ImportKeyword || !node.arguments[0] || !ts.isStringLiteral(node.arguments[0])) {
        throw new Error(`${filename}: unreviewed require/nonliteral dynamic import`);
      }
      imports.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return imports;
}

export const packageName = specifier => specifier.startsWith('@')
  ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
export const toPosix = value => value.split(path.sep).join('/');
