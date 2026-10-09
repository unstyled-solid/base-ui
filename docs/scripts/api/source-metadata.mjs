import fs from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

// Read-only enrichment. Never execute a source module or consult React tables.
export async function sourceMetadata(root, declarationFiles) {
  const files = new Map(), inputs = new Map();
  const sourceRoot = path.join(root, 'packages/solid/src');
  const declarationRoot = path.join(root, 'packages/solid/build/types');
  async function load(file) {
    if (files.has(file)) return files.get(file);
    files.set(file, null);
    let bytes;
    try { bytes = await fs.readFile(file, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
    const ast = ts.createSourceFile(file, bytes, ts.ScriptTarget.Latest, true);
    const record = { ast, declarations: new Map(), functions: new Map(), imports: new Map() };
    files.set(file, record); inputs.set(file, bytes);
    const name = node => node.name && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) ? node.name.text : null;
    function visit(node, parents = []) {
      const n = name(node);
      const named = n && (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isFunctionDeclaration(node) || ts.isModuleDeclaration(node) || ts.isEnumDeclaration(node) || ts.isVariableDeclaration(node) || ts.isPropertySignature(node) || ts.isMethodSignature(node) || ts.isEnumMember(node));
      const key = [...parents, ...(named ? [n] : [])].join('.');
      if (named) record.declarations.set(key, node);
      if (ts.isFunctionDeclaration(node) && n) record.functions.set(n, node);
      ts.forEachChild(node, child => visit(child, named && !ts.isFunctionDeclaration(node) ? [...parents, n] : parents));
    }
    visit(ast);
    for (const stmt of ast.statements) {
      if (!ts.isImportDeclaration(stmt) || !stmt.moduleSpecifier.text.startsWith('.')) continue;
      const bindings = stmt.importClause?.namedBindings;
      if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) record.imports.set(item.name.text, { file: path.resolve(path.dirname(file), stmt.moduleSpecifier.text.replace(/\.js$/, '')), name: item.propertyName?.text ?? item.name.text });
      if (bindings && ts.isNamespaceImport(bindings)) record.imports.set(bindings.name.text, { file: path.resolve(path.dirname(file), stmt.moduleSpecifier.text.replace(/\.js$/, '')), name: '*' });
    }
    return record;
  }
  async function paired(file) {
    const relative = path.relative(declarationRoot, path.resolve(file));
    if (relative.startsWith('..')) return null;
    const base = path.join(sourceRoot, relative.replace(/\.d\.ts$/, ''));
    return await load(base + '.ts') ?? await load(base + '.tsx');
  }
  for (const file of declarationFiles) await paired(file);
  function declarationKey(node) {
    const parts = [];
    for (let current = node; current && !ts.isSourceFile(current); current = current.parent) {
      if (current.name && (ts.isIdentifier(current.name) || ts.isStringLiteral(current.name))) parts.unshift(current.name.text);
    }
    return parts.join('.');
  }
  function doc(node) {
    const comment = value => typeof value === 'string' ? value : value?.map(p => p.text ?? '').join('') ?? '';
    const jsdoc = node?.jsDoc ?? (ts.isVariableDeclaration(node) ? node.parent?.parent?.jsDoc : []) ?? [];
    return { description: jsdoc.map(d => comment(d.comment)).filter(Boolean).join('\n\n'), tags: jsdoc.flatMap(d => (d.tags ?? []).map(t => ({ name: t.tagName.text, text: comment(t.comment) }))) };
  }
  const source = node => ({ file: path.relative(root, node.getSourceFile().fileName).split(path.sep).join('/'), line: node.getSourceFile().getLineAndCharacterOfPosition(node.getStart()).line + 1, url: null });
  const evidence = node => ({ ...doc(node), source: source(node) });
  function lookup(node) {
    if (!node) return null;
    const relative = path.relative(declarationRoot, path.resolve(node.getSourceFile().fileName));
    if (relative.startsWith('..')) return null;
    const base = path.join(sourceRoot, relative.replace(/\.d\.ts$/, ''));
    const record = files.get(base + '.ts') ?? files.get(base + '.tsx');
    const original = ts.isFunctionDeclaration(node) ? record?.functions.get(node.name?.text) : record?.declarations.get(declarationKey(node));
    return original ? evidence(original) : null;
  }
  // Accept only explicit constant fallbacks; expressions depending on context,
  // other props or runtime state are deliberately not advertised as defaults.
  const literal = node => ts.isStringLiteral(node) || ts.isNumericLiteral(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind) || ts.isPrefixUnaryExpression(node) && ts.isNumericLiteral(node.operand);
  const unwrap = node => node && (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node)) ? unwrap(node.expression) : node;
  async function resolveExpression(record, expression, seen = new Set()) {
    expression = unwrap(expression);
    if (!expression || seen.has(expression)) return { record, expression };
    seen.add(expression);
    let name, imported;
    if (ts.isIdentifier(expression)) {
      name = expression.text;
      const declaration = record.declarations.get(name);
      if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer) return resolveExpression(record, declaration.initializer, seen);
      imported = record.imports.get(name);
    } else if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression)) {
      const namespace = record.imports.get(expression.expression.text);
      if (namespace?.name === '*') { imported = namespace; name = expression.name.text; }
    }
    if (imported) {
      const next = await load(imported.file + '.ts') ?? await load(imported.file + '.tsx') ?? await load(path.join(imported.file, 'index.ts'));
      const declaration = next?.declarations.get(imported.name === '*' ? name : imported.name);
      if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer) return resolveExpression(next, declaration.initializer, seen);
    }
    return { record, expression };
  }
  async function attributes(node) {
    const relative = path.relative(declarationRoot, path.resolve(node.getSourceFile().fileName));
    if (relative.startsWith('..')) return [];
    const base = path.join(sourceRoot, relative.replace(/\.d\.ts$/, ''));
    const record = files.get(base + '.ts') ?? files.get(base + '.tsx');
    const fn = record?.functions.get(node.name?.text);
    if (!fn) return [];
    const mappings = [];
    function walk(n) {
      if (ts.isPropertyAssignment(n) && n.name.getText(record.ast) === 'stateAttributesMapping') mappings.push(n.initializer);
      ts.forEachChild(n, walk);
    }
    walk(fn);
    const rows = [], visited = new Set();
    const condition = (test, param, state, truth) => {
      test = unwrap(test);
      if (ts.isIdentifier(test) && test.text === param) return `${state} is ${truth}`;
      if (ts.isBinaryExpression(test) && ts.isIdentifier(test.left) && test.left.text === param && literal(test.right) && [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken].includes(test.operatorToken.kind)) return `${state} ${truth ? 'is' : 'is not'} ${test.right.getText()}`;
      return null;
    };
    async function object(rec, expr, state, param, conditions = []) {
      const resolved = await resolveExpression(rec, expr); rec = resolved.record; expr = resolved.expression;
      if (!expr) return;
      if (ts.isConditionalExpression(expr)) {
        const yes = condition(expr.condition, param, state, true), no = condition(expr.condition, param, state, false);
        if (!yes || !no) return;
        await object(rec, expr.whenTrue, state, param, [...conditions, yes]);
        await object(rec, expr.whenFalse, state, param, [...conditions, no]);
      } else if (ts.isObjectLiteralExpression(expr)) for (const prop of expr.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        // A nullish/dynamic value can omit an attribute even when its key exists.
        // Only an explicit string/number value proves presence here.
        if (!ts.isStringLiteral(prop.initializer) && !ts.isNumericLiteral(prop.initializer)) continue;
        const key = ts.isComputedPropertyName(prop.name) ? unwrap(prop.name.expression) : prop.name;
        async function add(rec, key, conditions) {
          const resolved = await resolveExpression(rec, key);
          const simplified = conditions.filter(c => !conditions.some(other => {
            const negated = c.match(/^(.*?) is not (.*)$/), positive = other.match(/^(.*?) is (?!not )(.*)$/);
            return negated && positive && negated[1] === positive[1] && negated[2] !== positive[2];
          }));
          if (resolved.expression && ts.isStringLiteral(resolved.expression) && resolved.expression.text.startsWith('data-') && simplified.length) rows.push({ name: resolved.expression.text, description: `Present when ${simplified.join(' and ')}.`, source: source(prop) });
        }
        if (ts.isConditionalExpression(key)) {
          const yes = condition(key.condition, param, state, true), no = condition(key.condition, param, state, false);
          if (yes && no) { await add(rec, key.whenTrue, [...conditions, yes]); await add(rec, key.whenFalse, [...conditions, no]); }
        } else await add(rec, key, conditions);
      }
    }
    async function mapping(rec, expr) {
      const resolved = await resolveExpression(rec, expr); rec = resolved.record; expr = resolved.expression;
      if (!expr || visited.has(expr)) return;
      visited.add(expr);
      if (!ts.isObjectLiteralExpression(expr)) return;
      for (const prop of expr.properties) {
        if (ts.isSpreadAssignment(prop)) await mapping(rec, prop.expression);
        else if (ts.isPropertyAssignment(prop)) {
          const fn = unwrap(prop.initializer), state = prop.name.getText(rec.ast);
          if (!fn || !ts.isArrowFunction(fn) || !fn.parameters[0] || !ts.isIdentifier(fn.parameters[0].name)) continue;
          await object(rec, fn.body, state, fn.parameters[0].name.text);
        }
      }
    }
    for (const expr of mappings) await mapping(record, expr);
    // Bounded Collapsible correction. Other families keep their existing
    // extraction until their renderer/forwarded-props paths are verified.
    const component = path.relative(sourceRoot, record.ast.fileName).split(path.sep).join('/');
    if (['collapsible/root/CollapsibleRoot.tsx', 'collapsible/panel/CollapsiblePanel.tsx'].includes(component)) {
      const calls = [];
      function callsIn(n) { if (ts.isCallExpression(n)) calls.push(n); ts.forEachChild(n, callsIn); }
      callsIn(fn);
      const renderCall = calls.find(call => ts.isIdentifier(call.expression) && record.imports.get(call.expression.text)?.name === 'createRenderElement');
      const options = unwrap(renderCall?.arguments[2]);
      const stateProp = options && ts.isObjectLiteralExpression(options) && options.properties.find(p => p.name?.getText(record.ast) === 'state');
      const stateExpression = stateProp && (ts.isShorthandPropertyAssignment(stateProp) ? stateProp.name : stateProp.initializer);
      const stateObject = stateExpression && await resolveExpression(record, stateExpression);
      // Resolve all mapping keys, including spreads. A null/custom/unknown
      // mapping must never accidentally fall through to the default emitter.
      const mappedKeys = new Set();
      async function keys(rec, expr, seen = new Set()) {
        const resolved = await resolveExpression(rec, expr);
        expr = resolved.expression; rec = resolved.record;
        if (!expr || seen.has(expr) || !ts.isObjectLiteralExpression(expr)) return false;
        seen.add(expr);
        for (const p of expr.properties) {
          if (ts.isSpreadAssignment(p)) { if (!await keys(rec, p.expression, seen)) return false; }
          else if (ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name)) mappedKeys.add(p.name.text);
          else return false;
        }
        return true;
      }
      const mappingProp = options && ts.isObjectLiteralExpression(options) && options.properties.find(p => p.name?.getText(record.ast) === 'stateAttributesMapping');
      const mappingKnown = mappingProp && await keys(record, mappingProp.initializer);
      // Inspect the actual imported renderer and its default-state emitter.
      // Derive the attribute spelling from its template, not from prop names.
      async function importedFunction(rec, name) {
        const imported = rec.imports.get(name);
        if (!imported) return null;
        const next = await load(imported.file + '.ts') ?? await load(imported.file + '.tsx');
        const fn = next?.functions.get(imported.name);
        return fn ? { record: next, fn } : null;
      }
      const renderer = renderCall && await importedFunction(record, renderCall.expression.text);
      let emitter;
      if (renderer) {
        const rendererCalls = [];
        function scan(n) { if (ts.isCallExpression(n)) rendererCalls.push(n); ts.forEachChild(n, scan); }
        scan(renderer.fn);
        const call = rendererCalls.find(call => ts.isIdentifier(call.expression) && renderer.record.imports.get(call.expression.text)?.name === 'getStateAttributesProps');
        if (call && unwrap(call.arguments[0])?.getText(renderer.record.ast) === 'state' && unwrap(call.arguments[1])?.getText(renderer.record.ast) === 'params.stateAttributesMapping') emitter = await importedFunction(renderer.record, call.expression.text);
      }
      let template, emission;
      if (emitter) {
        const sf = emitter.record.ast;
        // Only accept the existing paired true/truthy branches. This fails
        // closed if the implementation's omission/serialization policy changes.
        function scan(n) {
          if (ts.isIfStatement(n) && ts.isBinaryExpression(n.expression) && n.expression.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && n.expression.left.getText(sf) === 'value' && n.expression.right.kind === ts.SyntaxKind.TrueKeyword) {
            let loop = n.parent;
            while (loop && !ts.isForInStatement(loop) && loop !== emitter.fn) loop = loop.parent;
            const stateLoop = loop && ts.isForInStatement(loop) && loop.expression.getText(sf) === 'state' && ts.isVariableDeclarationList(loop.initializer) && loop.initializer.declarations[0]?.name.getText(sf) === 'key' && ts.isBlock(loop.statement) && loop.statement.statements.some(stmt => ts.isVariableStatement(stmt) && stmt.declarationList.declarations.some(d => d.name.getText(sf) === 'value' && d.initializer?.getText(sf) === 'state[key]'));
            const assignment = n.thenStatement && ts.isExpressionStatement(n.thenStatement) && n.thenStatement.expression;
            const fallback = n.elseStatement;
            const serialized = fallback && ts.isIfStatement(fallback) && ts.isExpressionStatement(fallback.thenStatement) && fallback.thenStatement.expression;
            if (stateLoop && assignment && ts.isBinaryExpression(assignment) && assignment.operatorToken.kind === ts.SyntaxKind.EqualsToken && ts.isElementAccessExpression(assignment.left) && ts.isStringLiteral(assignment.right) && assignment.right.text === '' && fallback && ts.isIfStatement(fallback) && fallback.expression.getText(sf) === 'value' && serialized && ts.isBinaryExpression(serialized) && serialized.operatorToken.kind === ts.SyntaxKind.EqualsToken && serialized.left.getText(sf) === assignment.left.getText(sf) && serialized.right.getText(sf) === 'String(value)') {
              const key = assignment.left.argumentExpression;
              if (ts.isTemplateExpression(key) && key.templateSpans.length === 1 && key.templateSpans[0].expression.getText(sf) === 'key.toLowerCase()' && key.templateSpans[0].literal.text === '') { template = key.head.text; emission = assignment; }
            }
          }
          ts.forEachChild(n, scan);
        }
        scan(emitter.fn);
      }
      if (mappingKnown && template?.startsWith('data-') && stateObject && ts.isObjectLiteralExpression(stateObject.expression)) {
        for (const member of stateObject.expression.properties) {
          if (!ts.isGetAccessorDeclaration(member) || ts.isComputedPropertyName(member.name)) continue;
          const key = member.name.text;
          if (mappedKeys.has(key)) continue;
          rows.push({ name: template + key.toLowerCase(), description: `Present when ${key} is truthy.`, source: source(member), emissionSource: source(emission) });
        }
      }
      if (component === 'collapsible/panel/CollapsiblePanel.tsx') {
        // Follow the actual panel helper's props into this renderer. Its Proxy
        // getter supplies a conditional attribute after state mapping, so the
        // mapped transition condition alone is not the complete explanation.
        const panelCall = calls.find(call => ts.isIdentifier(call.expression) && record.imports.get(call.expression.text)?.name === 'createCollapsiblePanel');
        const panelVariable = panelCall?.parent;
        const propsProp = options && ts.isObjectLiteralExpression(options) && options.properties.find(p => p.name?.getText(record.ast) === 'props');
        const forwarded = panelVariable && ts.isVariableDeclaration(panelVariable) && propsProp?.initializer && ts.isArrayLiteralExpression(propsProp.initializer) && propsProp.initializer.elements.some(element => ts.isPropertyAccessExpression(element) && element.expression.getText(record.ast) === panelVariable.name.getText(record.ast) && element.name.text === 'props');
        const helper = forwarded && await importedFunction(record, panelCall.expression.text);
        if (helper) {
          const sf = helper.record.ast;
          const conditions = expr => {
            expr = unwrap(expr);
            if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
              const a = conditions(expr.left), b = conditions(expr.right);
              return a && b ? [...a, ...b] : null;
            }
            if (ts.isPrefixUnaryExpression(expr) && expr.operator === ts.SyntaxKind.ExclamationToken && ts.isPropertyAccessExpression(expr.operand) && expr.operand.expression.getText(sf) === 'p') return [`${expr.operand.name.text} is false`];
            if (ts.isPropertyAccessExpression(expr) && expr.expression.getText(sf) === 'p') return [`${expr.name.text} is true`];
            if (ts.isCallExpression(expr) && !expr.arguments.length && ts.isIdentifier(expr.expression)) {
              const initializer = unwrap(helper.record.declarations.get(expr.expression.text)?.initializer);
              return initializer && ts.isArrowFunction(initializer) ? conditions(initializer.body) : null;
            }
            if (ts.isBinaryExpression(expr) && expr.operatorToken.kind === ts.SyntaxKind.ExclamationEqualsEqualsToken && ts.isCallExpression(expr.left) && !expr.left.arguments.length && ts.isIdentifier(expr.left.expression) && ts.isStringLiteral(expr.right)) return [`${expr.left.getText(sf)} is not ${expr.right.getText(sf)}`];
            return null;
          };
          const returnsProps = helper.fn.body.statements.some(stmt => ts.isReturnStatement(stmt) && stmt.expression && ts.isObjectLiteralExpression(stmt.expression) && stmt.expression.properties.some(p => ts.isPropertyAssignment(p) && p.name.getText(sf) === 'props' && p.initializer.getText(sf) === 'panelProps'));
          const proxy = unwrap(helper.record.declarations.get('panelProps')?.initializer);
          const handlers = proxy && ts.isNewExpression(proxy) && proxy.expression.getText(sf) === 'Proxy' && proxy.arguments?.[1];
          const getter = handlers && ts.isObjectLiteralExpression(handlers) && handlers.properties.find(p => ts.isMethodDeclaration(p) && p.name.getText(sf) === 'get');
          if (returnsProps && getter) for (const stmt of getter.body.statements) {
            if (!ts.isIfStatement(stmt) || !ts.isBinaryExpression(stmt.expression) || stmt.expression.operatorToken.kind !== ts.SyntaxKind.EqualsEqualsEqualsToken || stmt.expression.left.getText(sf) !== 'key' || !ts.isStringLiteral(stmt.expression.right)) continue;
            const returned = ts.isReturnStatement(stmt.thenStatement) && unwrap(stmt.thenStatement.expression);
            if (!returned || !ts.isConditionalExpression(returned) || !ts.isStringLiteral(returned.whenTrue) || returned.whenTrue.text !== '' || returned.whenFalse.getText(sf) !== 'undefined') continue;
            const extra = conditions(returned.condition);
            const row = rows.find(row => row.name === stmt.expression.right.text);
            if (row && extra) {
              row.description += ` Also retained when ${extra.join(' and ')}.`;
              row.mappingSource = row.source;
              row.source = source(stmt);
            }
          }
        }
      }
    }
    return rows;
  }
  async function defaults(node) {
    const relative = path.relative(declarationRoot, path.resolve(node.getSourceFile().fileName));
    if (relative.startsWith('..')) return new Map();
    const base = path.join(sourceRoot, relative.replace(/\.d\.ts$/, ''));
    const record = files.get(base + '.ts') ?? files.get(base + '.tsx');
    const original = ts.isFunctionDeclaration(node) ? record?.functions.get(node.name?.text) : record?.declarations.get(declarationKey(node));
    if (!original || !ts.isFunctionDeclaration(original)) return new Map();
    const result = new Map(), visited = new Set();
    async function scan(record, fn) {
      if (visited.has(fn)) return;
      visited.add(fn);
      const param = fn.parameters[0]?.name;
      const pending = [], candidates = [];
      for (const parameter of fn.parameters) {
        if (ts.isIdentifier(parameter.name) && parameter.initializer) candidates.push({ key: parameter.name.text, expression: parameter.initializer, node: parameter });
        else if (ts.isObjectBindingPattern(parameter.name)) for (const binding of parameter.name.elements) if (ts.isIdentifier(binding.name) && binding.initializer) candidates.push({ key: binding.propertyName?.getText(record.ast) ?? binding.name.text, expression: binding.initializer, node: binding });
      }
      function walk(n) {
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken && ts.isPropertyAccessExpression(n.left) && ts.isIdentifier(n.left.expression) && n.left.expression.text === param.text) candidates.push({ key: n.left.name.text, expression: n.right, node: n });
        if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.arguments[0] && ts.isIdentifier(n.arguments[0]) && n.arguments[0].text === param.text) pending.push(n.expression.text);
        ts.forEachChild(n, walk);
      }
      if (param && ts.isIdentifier(param) && fn.body) walk(fn.body);
      const constant = n => literal(unwrap(n)) || ts.isArrayLiteralExpression(unwrap(n)) && unwrap(n).elements.every(constant) || ts.isObjectLiteralExpression(unwrap(n)) && unwrap(n).properties.every(p => ts.isPropertyAssignment(p) && !ts.isComputedPropertyName(p.name) && constant(p.initializer));
      for (const candidate of candidates) {
        const resolved = await resolveExpression(record, candidate.expression);
        if (!resolved.expression || !constant(resolved.expression)) continue;
        const row = { status: 'source', value: resolved.expression.getText(resolved.record.ast), source: source(candidate.node) };
        if (resolved.expression !== candidate.expression) row.valueSource = source(resolved.expression);
        const previous = result.get(candidate.key);
        result.set(candidate.key, previous && previous.value !== row.value ? { status: 'unavailable', value: null } : previous ?? row);
      }
      for (const called of pending) {
        if (record.functions.has(called)) await scan(record, record.functions.get(called));
        else if (record.imports.has(called)) {
          const target = record.imports.get(called);
          const imported = await load(target.file + '.ts') ?? await load(target.file + '.tsx');
          if (imported?.functions.has(target.name)) await scan(imported, imported.functions.get(target.name));
        }
      }
    }
    await scan(record, original);
    return result;
  }
  return { lookup, defaults, attributes, inputs };
}
