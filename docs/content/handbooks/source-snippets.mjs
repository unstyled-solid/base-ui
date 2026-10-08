import ts from 'typescript';

/** Adapt syntax in source examples, leaving formatting to the site's Prettier pass. */
export function adaptSnippet(source) {
  let code = source.replaceAll('@base-ui/react', 'baseui-solid2')
    .replaceAll('className', 'class').replaceAll('htmlFor=', 'for=')
    .replaceAll('React.ComponentProps', 'ComponentProps').replaceAll('React.ReactNode', 'JSX.Element').replaceAll('React.JSX.Element', 'JSX.Element')
    .replaceAll('<React.Fragment>', '<>').replaceAll('</React.Fragment>', '</>')
    .replace(/import \* as React from ['"]react['"];?\n?/g, '')
    .replace(/\{\s*\/\*\s*(?:@highlight|prettier-ignore)[\s\S]*?\*\/\s*\}/g, '')
    .replace(/\/\/\s*(?:@highlight|prettier-ignore)[^\n]*/g, '');
  // A render utility must receive the live props object, not a setup-time rest copy.
  code = code.replace(/function (\w+)\(\{ render, \.\.\.props \}([^)]*)\)/g, 'function $1(props$2)')
    .replace(/function App\(\{ nonce \}\)/g, 'function App(props: { nonce: string })')
    .replace(/nonce=\{nonce\}/g, 'nonce={props.nonce}')
    .replace(/const \{ toasts \} = Toast\.useToastManager\(\);/g, 'const toastManager = Toast.useToastManager();')
    .replace(/\btoasts\.map\(/g, 'toastManager.toasts.map(');
  // Three toolbar source fragments place a semicolon before the closing return
  // parenthesis. Adjacent JSX anatomy nodes likewise need a fragment container.
  if (code.trimStart().startsWith('return (')) code = code.replace(/;\s*\)\s*$/, '\n);');
  const parse = (value) => ts.createSourceFile('snippet.tsx', value, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let ast = parse(code);
  if (ast.parseDiagnostics.length && code.trimStart().startsWith('<')) {
    const fragment = parse(`<>\n${code}\n</>;`);
    if (!fragment.parseDiagnostics.length) ast = fragment;
  }
  // Pseudocode and fragments are source examples, not invented complete programs.
  if (ast.parseDiagnostics.length) return code;
  const f = ts.factory;
  const signals = new Set();
  const derivations = new Set();
  const refs = new Set();
  const imports = new Set();
  const webTypes = new Set();
  function collect(node) {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
      const callee = node.initializer.expression.getText(ast);
      if (/^(?:React\.useState|createSignal)$/.test(callee) && ts.isArrayBindingPattern(node.name)) signals.add(node.name.elements[0].name.getText(ast));
      if (callee === 'React.useMemo') {
        signals.add(node.name.getText(ast));
        const dependencies = node.initializer.arguments[1];
        if (dependencies && ts.isArrayLiteralExpression(dependencies)) for (const dep of dependencies.elements) if (ts.isIdentifier(dep)) signals.add(dep.text);
      }
      if (callee === 'React.useRef' && ts.isIdentifier(node.name)) refs.add(node.name.text);
    }
    ts.forEachChild(node, collect);
  }
  collect(ast);
  function collectDerivations(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer && ts.isCallExpression(node.initializer)
      && ts.isPropertyAccessExpression(node.initializer.expression) && node.initializer.expression.name.text === 'filter') {
      let reactive = false;
      function inspect(n) { if (ts.isIdentifier(n) && signals.has(n.text)) reactive = true; ts.forEachChild(n, inspect); }
      inspect(node.initializer);
      if (reactive) { signals.add(node.name.text); derivations.add(node.name.text); }
    }
    ts.forEachChild(node, collectDerivations);
  }
  collectDerivations(ast);
  const transformed = ts.transform(ast, [(ctx) => {
    function visit(node) {
      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && derivations.has(node.name.text)) {
        imports.add('createMemo');
        return f.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type,
          f.createCallExpression(f.createIdentifier('createMemo'), undefined, [f.createArrowFunction(undefined, undefined, [], undefined,
            f.createToken(ts.SyntaxKind.EqualsGreaterThanToken), ts.visitNode(node.initializer, visit))]));
      }
      // Item wrapper parameters must stay live. The source wrappers each have
      // one item prop, so retain their type and qualify reads inside their body.
      if (ts.isFunctionExpression(node) && node.parameters.length === 1 && ts.isObjectBindingPattern(node.parameters[0].name)
        && node.parameters[0].name.elements.length === 1 && node.parameters[0].name.elements[0].name.getText(ast) === 'item') {
        const qualify = (n) => {
          if (ts.isIdentifier(n) && n.text === 'item' && !(ts.isPropertyAccessExpression(n.parent) && n.parent.name === n)
            && !(ts.isJsxAttribute(n.parent) && n.parent.name === n)) return f.createPropertyAccessExpression(f.createIdentifier('props'), 'item');
          return ts.visitEachChild(n, qualify, ctx);
        };
        node = f.updateFunctionExpression(node, node.modifiers, node.asteriskToken, node.name, node.typeParameters,
          [f.updateParameterDeclaration(node.parameters[0], undefined, undefined, 'props', undefined, node.parameters[0].type, undefined)], node.type, ts.visitNode(node.body, qualify));
      }
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.memo') return ts.visitNode(node.arguments[0], visit);
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.useMemo') {
        imports.add('createMemo');
        return f.createCallExpression(f.createIdentifier('createMemo'), node.typeArguments, [ts.visitNode(node.arguments[0], visit)]);
      }
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.useState') {
        imports.add('createSignal');
        return f.updateCallExpression(node, f.createIdentifier('createSignal'), node.typeArguments, node.arguments.map((a) => ts.visitNode(a, visit)));
      }
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.useId') {
        imports.add('createUniqueId');
        return f.createCallExpression(f.createIdentifier('createUniqueId'), undefined, []);
      }
      if (ts.isCallExpression(node) && node.expression.getText(ast) === 'React.useEffect' && ts.isArrayLiteralExpression(node.arguments[1]) && !node.arguments[1].elements.length) {
        imports.add('onSettled');
        return f.createCallExpression(f.createIdentifier('onSettled'), undefined, [ts.visitNode(node.arguments[0], visit)]);
      }
      if (ts.isVariableStatement(node) && node.declarationList.declarations.some((d) => ts.isIdentifier(d.name) && refs.has(d.name.text))) {
        const declarations = node.declarationList.declarations.map((d) => {
          if (!refs.has(d.name.getText(ast))) return ts.visitNode(d, visit);
          const type = d.initializer.typeArguments?.[0];
          return f.updateVariableDeclaration(d, d.name, undefined, type ? f.createUnionTypeNode([type, f.createLiteralTypeNode(f.createNull())]) : undefined, f.createNull());
        });
        return f.updateVariableStatement(node, node.modifiers, f.createVariableDeclarationList(declarations, ts.NodeFlags.Let));
      }
      if (ts.isPropertyAccessExpression(node) && node.name.text === 'current' && ts.isIdentifier(node.expression) && refs.has(node.expression.text)) return node.expression;
      if (ts.isJsxAttribute(node) && node.name.text === 'key') return undefined;
      if (ts.isJsxAttribute(node) && ['minLength', 'maxLength'].includes(node.name.text)) {
        return f.updateJsxAttribute(node, f.createIdentifier(node.name.text.toLowerCase()), ts.visitNode(node.initializer, visit));
      }
      if (ts.isJsxAttribute(node) && node.name.text === 'actionsRef' && ts.isJsxExpression(node.initializer) && ts.isIdentifier(node.initializer.expression) && refs.has(node.initializer.expression.text)) {
        return f.updateJsxAttribute(node, node.name, f.createJsxExpression(undefined, f.createArrowFunction(undefined, undefined,
          [f.createParameterDeclaration(undefined, undefined, 'value')], undefined, f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          f.createBlock([f.createExpressionStatement(f.createBinaryExpression(node.initializer.expression, f.createToken(ts.SyntaxKind.EqualsToken), f.createIdentifier('value')))], true))));
      }
      if (ts.isJsxExpression(node) && node.expression && ts.isCallExpression(node.expression) && ts.isPropertyAccessExpression(node.expression.expression)
        && node.expression.expression.name.text === 'map' && node.expression.arguments.length === 1 && ts.isArrowFunction(node.expression.arguments[0])) {
        imports.add('For');
        const each = ts.visitNode(node.expression.expression.expression, visit);
        const callback = ts.visitNode(node.expression.arguments[0], visit);
        return f.createJsxElement(f.createJsxOpeningElement(f.createIdentifier('For'), undefined,
          f.createJsxAttributes([f.createJsxAttribute(f.createIdentifier('each'), f.createJsxExpression(undefined, each))])),
          [f.createJsxExpression(undefined, callback)], f.createJsxClosingElement(f.createIdentifier('For')));
      }
      if (ts.isShorthandPropertyAssignment(node) && node.name.text === 'render') return f.createGetAccessorDeclaration(undefined, 'render', [], undefined,
        f.createBlock([f.createReturnStatement(f.createPropertyAccessExpression(f.createIdentifier('props'), 'render'))], true));
      if (ts.isIdentifier(node) && signals.has(node.text)) {
        const parent = node.parent;
        if (ts.isShorthandPropertyAssignment(parent)) return node;
        if (!ts.isBindingElement(parent) && !ts.isParameter(parent) && !(ts.isVariableDeclaration(parent) && parent.name === node)
          && !(ts.isJsxAttribute(parent) && parent.name === node) && !(ts.isPropertyAccessExpression(parent) && parent.name === node)
          && !(ts.isPropertyAssignment(parent) && parent.name === node) && !(ts.isCallExpression(parent) && parent.expression === node)) return f.createCallExpression(node, undefined, []);
      }
      if (ts.isShorthandPropertyAssignment(node) && signals.has(node.name.text)) return f.createPropertyAssignment(node.name, f.createCallExpression(node.name, undefined, []));
      if (ts.isIdentifier(node) && ['ComponentProps', 'JSX'].includes(node.text)) webTypes.add(node.text);
      node = ts.visitEachChild(node, visit, ctx);
      if (ts.isJsxAttribute(node) && node.name.text === 'render' && node.initializer && ts.isJsxExpression(node.initializer)) {
        let element = node.initializer.expression;
        if (!element || (!ts.isJsxElement(element) && !ts.isJsxSelfClosingElement(element))) return node;
        const spread = f.createJsxSpreadAttribute(f.createIdentifier('renderProps'));
        if (ts.isJsxSelfClosingElement(element)) element = f.updateJsxSelfClosingElement(element, element.tagName, element.typeArguments, f.createJsxAttributes([spread, ...element.attributes.properties]));
        else element = f.updateJsxElement(element, f.updateJsxOpeningElement(element.openingElement, element.openingElement.tagName, element.openingElement.typeArguments, f.createJsxAttributes([spread, ...element.openingElement.attributes.properties])), element.children, element.closingElement);
        return f.updateJsxAttribute(node, node.name, f.createJsxExpression(undefined, f.createArrowFunction(undefined, undefined,
          [f.createParameterDeclaration(undefined, undefined, 'renderProps')], undefined, f.createToken(ts.SyntaxKind.EqualsGreaterThanToken), element)));
      }
      return node;
    }
    return (node) => ts.visitNode(node, visit);
  }]);
  code = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed }).printFile(transformed.transformed[0]);
  transformed.dispose();
  if (imports.size) code = `import { ${[...imports].sort().join(', ')} } from 'solid-js';\n${code}`;
  if (webTypes.size) code = `import type { ${[...webTypes].sort().join(', ')} } from '@solidjs/web';\n${code}`;
  return code.trimEnd();
}
