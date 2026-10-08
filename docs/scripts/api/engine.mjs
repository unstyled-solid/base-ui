import ts from 'typescript';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ordering } from '../../../upstream/base-ui/docs/src/utils/typeOrder.mjs';
import { sourceMetadata } from './source-metadata.mjs';

export const SOURCE_SHA = '19511bb171f3b360b006c94cf6d07e53cb446505';
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
export const anchor = (name) => `api-${Buffer.from(name).toString('hex')}`;
const ordered = (names, section) => {
  const list = ordering[section] ?? [];
  const rest = list.indexOf('__EVERYTHING_ELSE__');
  const rank = (name) => list.includes(name === 'class' ? 'className' : name) ? list.indexOf(name === 'class' ? 'className' : name) : rest < 0 ? list.length : rest;
  return [...names].sort((a, b) => rank(a) - rank(b) || compare(a, b));
};
const json = (data) => `${JSON.stringify(data, null, 2)}\n`;

export async function extract({ root, entries, sourceBase = null, requiredMetadata = [] }) {
  const metadataFiles = [];
  async function findMetadata(directory) {
    let children;
    try { children = await fs.readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const child of children) {
      const file = path.join(directory, child.name);
      if (child.isDirectory()) await findMetadata(file);
      else if (/(?:DataAttributes|CssVars|CssVariables)\.d\.ts$/.test(child.name)) metadataFiles.push(file);
    }
  }
  if (entries.some(e => path.resolve(e.file).startsWith(path.join(root, 'packages/solid/build/types') + path.sep))) await findMetadata(path.join(root, 'packages/solid/build/types'));
  const program = ts.createProgram([...entries.map((e) => e.file), ...metadataFiles], {
    strict: true, noEmit: true, skipLibCheck: false, target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext,
    types: [], jsx: ts.JsxEmit.Preserve, jsxImportSource: '@solidjs/web',
  });
  const errors = ts.getPreEmitDiagnostics(program);
  if (errors.length) throw new Error(ts.formatDiagnostics(errors, {
    getCurrentDirectory: () => root, getCanonicalFileName: (f) => f, getNewLine: () => '\n',
  }));
  const checker = program.getTypeChecker();
  const local = await sourceMetadata(root, program.getSourceFiles().filter(f => !f.fileName.includes('/node_modules/')).map(f => f.fileName));
  const resolve = (s) => s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
  const location = (s) => s?.valueDeclaration ?? s?.declarations?.[0];
  const text = (s) => (ts.displayPartsToString(s.getDocumentationComment(checker)) || local.lookup(location(s))?.description || '')
    .replace(/\n\nDocumentation: .*$/m, '').replace(/Base UI/g, 'Base UI');
  const tags = (s) => {
    const retained = s.getJsDocTags(checker).map((t) => ({ name: t.name, text: ts.displayPartsToString(t.text) }));
    const fallback = location(s) && local.lookup(location(s))?.tags || [];
    return [...retained, ...fallback.filter(t => !retained.some(r => r.name === t.name))];
  };
  const source = (s) => {
    const d = location(s);
    if (!d) return null;
    const file = path.relative(root, d.getSourceFile().fileName).split(path.sep).join('/');
    const line = d.getSourceFile().getLineAndCharacterOfPosition(d.getStart()).line + 1;
    return { file, line, url: sourceBase ? `${sourceBase}/${file}#L${line}` : null };
  };
  const portable = value => value.replace(/import\("([^"]+)"\)/g, (match, file) => {
    if (!path.isAbsolute(file)) return match;
    const relative = path.relative(path.join(root, 'packages/solid/build/types'), file).split(path.sep).join('/');
    if (!relative.startsWith('..')) return `import("./${relative}")`;
    const dependency = file.split('/node_modules/').at(-1);
    return `import("${dependency === file ? path.basename(file) : dependency}")`;
  });
  const typeText = (t, d) => portable(checker.typeToString(t, d, ts.TypeFormatFlags.NoTruncation));
  const modules = [];
  for (const entry of entries.sort((a, b) => compare(a.entrypoint, b.entrypoint))) {
    const exported = [];
    const mappedAttributes = new Map();
    const typeAliases = new Map();
    const visit = async (symbol, name, ancestors = new Set()) => {
      const s = resolve(symbol);
      if (ancestors.has(s)) return;
      const d = location(s);
      if (!d && s.name === 'prototype') return;
      if (!d) throw new Error(`Unresolved export ${name}`);
      const t = s.flags & ts.SymbolFlags.Type ? checker.getDeclaredTypeOfSymbol(s) : checker.getTypeOfSymbolAtLocation(s, d);
      const signatures = checker.getSignaturesOfType(t, ts.SignatureKind.Call);
      const component = signatures.some((sig) => {
        const p = sig.parameters[0];
        const pt = p && checker.getTypeOfSymbolAtLocation(p, location(p) ?? d);
        return /^[A-Z]/.test(name.split('.').at(-1)) && !!pt &&
          (/Props/.test(typeText(pt, d)) || /JSX\.Element/.test(typeText(sig.getReturnType(), d)));
      });
      const kind = component ? 'component' : signatures.length ? 'helper' :
        s.flags & ts.SymbolFlags.Module ? 'namespace' : s.flags & ts.SymbolFlags.Type ? 'type' : 'value';
      const sourceDefaults = signatures.length ? await local.defaults(d) : new Map();
      if (component) mappedAttributes.set(name, await local.attributes(d));
      const row = (p, parent) => {
        const roots = checker.getRootSymbols(p);
        const pd = location(p) ?? roots.map(location).find(Boolean) ?? d;
        const pt = checker.getTypeOfSymbolAtLocation(p, pd);
        const inheritedDOM = /^(?:prop|attr|on|oncapture|bind):/.test(p.name) || /(?:node_modules|typescript\/lib)\//.test(pd.getSourceFile().fileName);
        if (inheritedDOM) return { name: p.name, anchor: anchor(`${parent}.${p.name}`), compatibilityAnchor: !location(p) || !/(?:node_modules|typescript\/lib)\//.test(location(p).getSourceFile().fileName), type: typeText(pt, pd), description: '', required: !(p.flags & ts.SymbolFlags.Optional), default: { status: 'unavailable', value: null }, inheritedDOM: true, source: source(p), links: [], tags: [] };
        const defaults = tags(p).find((tag) => ['default', 'defaultValue'].includes(tag.name));
        return { name: p.name, anchor: anchor(`${parent}.${p.name}`), type: typeText(pt, pd),
          description: text(p), required: !(p.flags & ts.SymbolFlags.Optional),
          default: defaults ? { status: 'documented', value: defaults.text } : sourceDefaults.get(p.name) ?? { status: 'unavailable', value: null },
          inheritedDOM: /(?:node_modules|typescript\/lib)\//.test(pd.getSourceFile().fileName),
          source: source(p), links: [], tags: tags(p) };
      };
      const properties = kind !== 'type' || !(t.flags & (ts.TypeFlags.Object | ts.TypeFlags.Union | ts.TypeFlags.Intersection)) ? [] : ordered(checker.getPropertiesOfType(t).map((p) => p.name), 'props')
        .map((n) => row(checker.getPropertiesOfType(t).find((p) => p.name === n), name));
      const props = component ? ordered(checker.getPropertiesOfType(checker.getTypeOfSymbolAtLocation(signatures[0].parameters[0], d)).map((p) => p.name), 'props')
        .map((n) => row(checker.getPropertyOfType(checker.getTypeOfSymbolAtLocation(signatures[0].parameters[0], d), n), `${name}.$props`)) : kind === 'helper' ? signatures[0].parameters.map(p => ({ ...row(p, `${name}.$parameters`), required: !location(p)?.questionToken && !location(p)?.dotDotDotToken && !location(p)?.initializer })) : [];
      const inheritedDOM = [...new Set([...properties, ...props].filter((r) => r.inheritedDOM).map((r) => r.name))].sort(compare);
      const firstParameterType = kind === 'helper' && signatures[0].parameters[0] && checker.getTypeOfSymbolAtLocation(signatures[0].parameters[0], d);
      const parameterProperties = kind === 'helper' && signatures[0].parameters.length === 1 && firstParameterType ? checker.getPropertiesOfType(firstParameterType).map(p => row(p, `${name}.$props`)).filter(r => !r.inheritedDOM) : [];
      const returned = kind === 'helper' ? signatures[0].getReturnType() : null;
      const returnValue = returned ? { type: typeText(returned, d), properties: returned.flags & ts.TypeFlags.Object ? checker.getPropertiesOfType(returned).filter(p => {
        const pd = location(p);
        return pd && !pd.getSourceFile().fileName.includes('/node_modules/');
      }).map(p => row(p, `${name}.$return`)) : [] } : null;
      const canonicalAnchor = kind === 'type' && properties.length ? typeAliases.get(t) ?? null : null;
      if (kind === 'type' && properties.length && !canonicalAnchor) typeAliases.set(t, anchor(name));
      exported.push({ name, kind, anchor: anchor(name), source: source(s), description: text(s), tags: tags(s), inheritedDOM,
        canonicalAnchor, compatibilityAnchors: [...properties, ...props].filter(r => r.compatibilityAnchor).map(r => r.anchor), compatibilityProperties: [...properties, ...props].filter(r => r.compatibilityAnchor).map(r => ({ name: r.name, anchor: r.anchor })), returnValue, parameters: kind === 'helper' ? props : [],
        type: typeText(t, d), aliasOf: symbol !== s ? s.name : null,
        signatures: signatures.map((sig) => portable(checker.signatureToString(sig, d, ts.TypeFormatFlags.NoTruncation))),
        properties: properties.filter((r) => !r.inheritedDOM), props: parameterProperties.length ? ordered(parameterProperties.map(p => p.name), 'props').map(n => parameterProperties.find(p => p.name === n)) : props.filter((r) => !r.inheritedDOM), relatedTypes: [], dataAttributes: [], cssVariables: [],
        metadata: { dataAttributes: 'unavailable', cssVariables: 'unavailable' } });
      if (s.flags & ts.SymbolFlags.Module) {
        const next = new Set([...ancestors, s]);
        const children = checker.getExportsOfModule(s);
        const names = ordered(children.map(child => child.name), children.some(child => ordering.namespaceParts.includes(child.name)) ? 'namespaceParts' : 'typeSuffixes');
        for (const childName of names) await visit(children.find(child => child.name === childName), `${name}.${childName}`, next);
      }
    };
    const module = checker.getSymbolAtLocation(program.getSourceFile(entry.file));
    if (!module) throw new Error(`No declaration module: ${entry.file}`);
    for (const s of checker.getExportsOfModule(module).sort((a, b) => compare(a.name, b.name))) await visit(s, s.name);
    const targets = new Map(exported.map((e) => [e.name, e]));
    const typePatterns = exported.filter((e) => e.kind === 'type').map((e) => ({ e, pattern: new RegExp(`\\b${e.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`) }));
    for (const e of exported) {
      for (const r of [...e.props, ...e.properties]) {
        if (r.inheritedDOM) continue;
        r.links = typePatterns.filter(({ e: other, pattern }) => other.name !== e.name && pattern.test(r.type))
          .map(({ e: other }) => ({ name: other.name, anchor: other.anchor }));
      }
      if (e.kind !== 'component') continue;
      const canonical = e.aliasOf ?? e.name.replaceAll('.', '');
      e.relatedTypes = exported.filter((other) => other.kind === 'type' &&
        (other.name.startsWith(`${e.name}.`) || other.name.startsWith(canonical)))
        .map((other) => ({ name: other.name, anchor: other.anchor }));
      for (const [field, suffixes, section] of [['dataAttributes', ['DataAttributes'], 'dataAttributes'], ['cssVariables', ['CssVars', 'CssVariables'], 'cssVariables']]) {
        const namespaces = exported.filter((other) => suffixes.some((suffix) => other.name === `${canonical}${suffix}`));
        const leaves = exported.filter((other) => namespaces.some((ns) => other.name.startsWith(`${ns.name}.`)));
        e[field] = leaves.map(leaf => {
          return { name: leaf.type.replace(/^['"]|['"]$/g, ''), anchor: leaf.anchor, description: leaf.description, source: leaf.source };
        });
        // Family-local metadata need not be re-exported from a public barrel.
        if (!namespaces.length) {
          const file = metadataFiles.find(file => suffixes.some(suffix => path.basename(file) === `${canonical}${suffix}.d.ts`));
          const sf = file && program.getSourceFile(file);
          const symbol = sf && checker.getSymbolAtLocation(sf);
          if (symbol) {
            for (const member of checker.getExportsOfModule(symbol)) {
              const resolved = resolve(member), md = location(resolved);
              const mt = checker.getTypeOfSymbolAtLocation(resolved, md);
              const members = resolved.flags & ts.SymbolFlags.Enum ? checker.getExportsOfModule(resolved) : [resolved];
              for (const leaf of members) {
                const ld = location(leaf);
                const value = typeText(leaf === resolved ? mt : checker.getTypeOfSymbolAtLocation(leaf, ld), ld).replace(/^['"]|['"]$/g, '');
                if (!value.startsWith(field === 'dataAttributes' ? 'data-' : '--')) continue;
                e[field].push({ name: value, anchor: anchor(`${e.name}.${field}.${leaf.name}`), description: text(leaf), source: source(leaf) });
              }
            }
            e.metadata[field] = e[field].length ? 'available' : 'empty';
          }
        }
        if (namespaces.length) e.metadata[field] = e[field].length ? 'available' : 'empty';
        if (field === 'dataAttributes') for (const mapped of mappedAttributes.get(e.name) ?? []) {
          const declared = e[field].find(row => row.name === mapped.name);
          if (declared) {
            if (!declared.description) { declared.description = mapped.description; declared.descriptionSource = mapped.source; }
          } else e[field].push({ ...mapped, anchor: anchor(`${e.name}.${field}.${mapped.name}`) });
          e.metadata[field] = 'available';
        }
        const sorted = ordered(e[field].map(r => r.name), section);
        e[field].sort((a, b) => sorted.indexOf(a.name) - sorted.indexOf(b.name));
      }
      for (const field of requiredMetadata) if (e.metadata[field] === 'unavailable') throw new Error(`${entry.entrypoint}:${e.name}: missing required ${field}; request exported declaration metadata from its owner`);
    }
    modules.push({ entrypoint: entry.entrypoint, markdown: `${anchor(entry.entrypoint)}.md`, exports: exported });
  }
  const inputs = program.getSourceFiles().filter((f) => !f.fileName.includes('/node_modules/')).sort((a, b) => compare(a.fileName, b.fileName));
  return { schemaVersion: 1, sourceSha: SOURCE_SHA, typescriptVersion: ts.version,
    provenance: { ordering: { source: 'docs/src/utils/typeOrder.mjs', sha256: createHash('sha256').update(await fs.readFile(new URL('../../../upstream/base-ui/docs/src/utils/typeOrder.mjs', import.meta.url))).digest('hex'), license: 'MIT', adaptation: 'class uses the className presentation slot' }, extraction: 'docs/scripts/api/engine.mjs', enrichment: { source: 'docs/scripts/api/source-metadata.mjs', truth: 'read-only local JSDoc, constant fallbacks and explicit state-attribute mapping expressions; never executed' }, externalPipeline: { name: '@mui/internal-docs-infra', version: '0.13.1-canary.5', disposition: 'architectural-reference-only' } },
    inputs: [...inputs.map((f) => ({ file: path.relative(root, f.fileName).split(path.sep).join('/'), sha256: createHash('sha256').update(f.text).digest('hex') })), ...[...local.inputs].map(([file, bytes]) => ({ file: path.relative(root, file).split(path.sep).join('/'), sha256: createHash('sha256').update(bytes).digest('hex') }))].sort((a,b) => compare(a.file,b.file)), modules };
}

const cell = (s) => String(s ?? '').replaceAll('|', '&#124;').replaceAll('\n', '<br>').replaceAll('<', '&lt;');
export function markdown(module) {
  const lines = [`# ${module.entrypoint} API`, ''];
  const canonical = new Map();
  for (const e of module.exports) {
    const identity = `${e.kind}:${e.source?.file}:${e.source?.line}`;
    const previous = e.canonicalAnchor ? module.exports.find(other => other.anchor === e.canonicalAnchor) : canonical.get(identity);
    canonical.set(identity, previous ?? e);
    if (previous) {
      lines.push(`<a id="${e.anchor}"></a>`, `## ${e.name}`, '', `Alias of [${previous.name}](#${previous.anchor}).`, '', ...[...e.props, ...e.properties, ...e.parameters ?? [], ...e.returnValue?.properties ?? [], ...e.dataAttributes, ...e.cssVariables].map(r => `<a id="${r.anchor}"></a>`), ...(e.compatibilityAnchors ?? []).map(a => `<a id="${a}"></a>`), '');
      continue;
    }
    lines.push(`<a id="${e.anchor}"></a>`, `## ${e.name}`, '', e.description, '', `Kind: ${e.kind}.`, '',
      e.source ? `[Declaration](${e.source.url ?? `../../../${e.source.file}#L${e.source.line}`})` : '', '', ...(e.kind === 'namespace' ? [] : ['```ts', ...e.signatures.length ? e.signatures : [e.type], '```', '']), ...(e.compatibilityAnchors ?? []).map(a => `<a id="${a}"></a>`));
    for (const [title, rows] of [['Props', e.props], ['Properties / state / events', e.properties]]) {
      if (!rows.length) continue;
      lines.push(`### ${title}`, '', '| Name | Type | Required | Default | Description |', '| --- | --- | --- | --- | --- |');
      for (const r of rows) lines.push(`| <a id="${r.anchor}"></a>${cell(r.name)}${r.inheritedDOM ? ' (inherited DOM)' : ''} | ${cell(r.type)} | ${r.required} | ${cell(r.default.value ?? 'Unavailable')} | ${cell(r.description)} ${r.links.map((l) => `[${l.name}](#${l.anchor})`).join(' ')} |`);
      lines.push('');
    }
    for (const row of e.parameters ?? []) lines.push(`<a id="${row.anchor}"></a>`);
    if (e.returnValue) {
      lines.push('### Return value', '', '```ts', e.returnValue.type, '```', '');
      if (e.returnValue.properties.length) {
        lines.push('| Property | Type | Description |', '| --- | --- | --- |');
        for (const row of e.returnValue.properties) lines.push(`| <a id="${row.anchor}"></a>${cell(row.name)} | ${cell(row.type)} | ${cell(row.description)} |`);
        lines.push('');
      }
    }
    for (const field of ['dataAttributes', 'cssVariables']) if (e[field].length) lines.push(`### ${field}`, '', ...e[field].map((r) => `- <a id="${r.anchor}"></a>${r.name}: ${r.description || '—'}`), '');
    if (e.relatedTypes.length) lines.push('Related: ' + e.relatedTypes.map((r) => `[${r.name}](#${r.anchor})`).join(', '), '');
  }
  const ids = new Set();
  return (lines.join('\n') + '\n').replace(/<a id="([^"]+)"><\/a>/g, (html, id) => {
    if (ids.has(id)) return '';
    ids.add(id); return html;
  });
}

export async function generate(options) {
  const catalog = await extract(options);
  const missingMetadata = catalog.modules.flatMap((m) => m.exports.filter((e) => e.kind === 'component').map((e) => ({ entrypoint: m.entrypoint, name: e.name,
    missing: Object.entries(e.metadata).filter(([, status]) => status === 'unavailable').map(([field]) => field) })).filter((e) => e.missing.length));
  const missingDocumentation = catalog.modules.flatMap(m => m.exports.filter(e => e.kind === 'component' || e.kind === 'helper').map(e => ({ entrypoint: m.entrypoint, name: e.name, source: e.source,
    props: e.props.filter(p => !p.description || p.default.status === 'unavailable').map(p => ({ name: p.name, description: p.description ? 'available' : 'unavailable', default: p.default.status, source: p.source })),
    dataAttributes: e.dataAttributes.filter(r => !r.description).map(r => ({ name: r.name, source: r.source })), cssVariables: e.cssVariables.filter(r => !r.description).map(r => ({ name: r.name, source: r.source })) })).filter(e => e.props.length || e.dataAttributes.length || e.cssVariables.length));
  const outputs = new Map([['catalog.json', json(catalog)], ['report.json', json({ schemaVersion: 1, missingMetadata, missingDocumentation })], ...catalog.modules.map((m) => [m.markdown, markdown(m)])]);
  let current = [];
  try { current = await fs.readdir(options.output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const unexpected = current.filter((f) => !outputs.has(f));
  if (unexpected.length) throw new Error(`Unexpected API outputs: ${unexpected.join(', ')}; reconcile explicitly`);
  for (const [name, bytes] of outputs) {
    const file = path.join(options.output, name);
    let existing;
    try { existing = await fs.readFile(file, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (existing === bytes) continue;
    if (options.check) throw new Error(`Stale or missing ${file}; run docs API generation`);
    await fs.mkdir(options.output, { recursive: true });
    await fs.writeFile(file, bytes);
  }
  return catalog;
}
