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
