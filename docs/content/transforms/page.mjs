import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { parseMdx, codeReferences, walk, literal } from './parse.mjs';
import { SOURCE_SHA, PUBLIC_ROOT, SNAPSHOT, PACKAGE, VERSION, nativeTags, customHandlers, sourceRoute, targetRoute, pageDisposition } from './policy.mjs';

const markdownNodes = new Set('root paragraph text heading thematicBreak blockquote list listItem break emphasis strong delete inlineCode code link image definition linkReference imageReference table tableRow tableCell footnoteDefinition footnoteReference'.split(' '));
const text = (node) => node.type === 'inlineCode' || node.type === 'text' ? node.value : (node.children ?? []).map(text).join('');
const where = (file, node) => `${file}:${node.position?.start.line ?? 1}:${node.position?.start.column ?? 1}`;
const clean = (value) => JSON.parse(JSON.stringify(value, (key, item) => key === 'estree' ? undefined : item));

export async function transformPage(source, file, root) {
  const tree = parseMdx(source, file);
  const load = (p) => import(pathToFileURL(path.join(root, SNAPSHOT, p)).href);
  const [{ default: badges }, { default: excludeToc }, { default: slug }, md] = await Promise.all([
    load('docs/src/mdx/remarkHeadingTags.mjs'),
    load('docs/src/components/QuickNav/remarkQuickNavExcludeHeading.mjs'),
    load('docs/src/components/QuickNav/rehypeSlug.mjs'),
    load('docs/scripts/generateLlmTxt/mdxNodeHelpers.mjs'),
  ]);
  badges()(tree);
  excludeToc()(tree);
  const disposition = pageDisposition(file);
  const historical = disposition === 'upstream-react-history';
  const result = { schemaVersion: 1, transformationVersion: VERSION, source: file,
    provenance: { repository: 'https://github.com/mui/base-ui', sourceSha: SOURCE_SHA,
      sourceSha256: createHash('sha256').update(source).digest('hex'),
      license: `${SNAPSHOT}/LICENSE`, copyright: 'Copyright (c) 2019 Material-UI SAS' },
    sourceRoute: sourceRoute(file), route: targetRoute(sourceRoute(file)), disposition,
    publishable: false, title: null, subtitle: null, metadata: {}, imports: [],
    headings: [], links: [], nodes: [], adaptations: [], ast: tree };
  const flags = new Set();
  function flag(kind, node, detail) {
    const key = `${kind}:${node.position?.start.offset ?? 0}:${detail}`;
    if (!flags.has(key)) result.adaptations.push({ kind, location: where(file, node), detail, status: 'unreviewed' });
    flags.add(key);
  }
  if (historical) {
    result.notice = md.paragraph('Upstream React Base UI release history. These are not releases or verified capabilities of the Solid port.');
    flag('react-release-history', tree, 'Keep historical code, dates, package names and claims scoped to React.');
  }
  if (file.includes('/overview/community/')) flag('community-support', tree, 'Upstream ecosystem listings do not establish Solid compatibility.');
  if (file.includes('/overview/accessibility/') || file.includes('/overview/about/')) flag('platform-accessibility-claims', tree, 'Reconcile upstream support claims against actual Solid qualification evidence.');
  if (file === `${PUBLIC_ROOT}/page.mdx` || /^# (Components|Utils)\n/.test(source)) flag('generated-react-index', tree, 'Reuse navigation ordering; regenerate React type summaries from Solid API output.');
  const bindings = new Map();
  walk(tree, (node) => {
    if (node.type !== 'mdxjsEsm') return;
    for (const statement of node.data.estree.body) {
      if (statement.type === 'ImportDeclaration') {
        const from = statement.source.value;
        const kind = from.includes('/demos/') || from.startsWith('./demos/') ? 'demo' : /(?:^|\/)types$/.test(from) ? 'api' : 'custom';
        for (const spec of statement.specifiers) {
          const entry = { from, local: spec.local.name, imported: spec.imported?.name ?? (spec.type === 'ImportDefaultSpecifier' ? 'default' : '*'), kind,
            reference: `${kind}:${path.posix.normalize(path.posix.join(path.posix.dirname(file), from))}#${spec.imported?.name ?? spec.local.name}` };
          if (!from.startsWith('.')) entry.reference = `${kind}:${from}#${entry.imported}`;
          bindings.set(entry.local, entry);
          result.imports.push(entry);
        }
      } else if (statement.type === 'ExportNamedDeclaration' && statement.declaration?.type === 'VariableDeclaration') {
        for (const declaration of statement.declaration.declarations) {
          if (declaration.id.name !== 'metadata') throw new Error(`${where(file, node)}: unknown MDX export ${declaration.id.name}; add an explicit mapping`);
          Object.assign(result.metadata, literal(declaration.init, where(file, node)));
        }
      } else throw new Error(`${where(file, node)}: unsupported MDX statement ${statement.type}`);
    }
    node.type = 'sourceModule';
    node.data = { handler: 'non-executable-import-metadata' };
  });
  function rewriteLink(url) {
    if (historical) return url;
    if (url.startsWith('.')) {
      const index = url.search(/[?#]/);
      const pathname = index < 0 ? url : url.slice(0, index);
      const suffix = index < 0 ? '' : url.slice(index);
      if (pathname.endsWith('/page.mdx')) return targetRoute(sourceRoute(path.posix.normalize(path.posix.join(path.posix.dirname(file), pathname)))) + suffix;
    }
    return targetRoute(url);
  }
  walk(tree, (node) => {
    if (node.type === 'sourceModule') return;
    if (node.type === 'mdxFlowExpression' || node.type === 'mdxTextExpression') {
      const body = node.data?.estree?.body ?? [];
      if (body.length) throw new Error(`${where(file, node)}: unsupported MDX expression; supply a bounded static handler`);
      node.data = { handler: 'comment' };
      return;
    }
    if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
      const binding = bindings.get(node.name?.split('.')[0]);
      const handler = nativeTags.has(node.name) ? 'html' : customHandlers[node.name] ?? (binding && ['demo', 'api'].includes(binding.kind) ? binding.kind : null);
      if (!handler) throw new Error(`${where(file, node)}: unsupported MDX node <${node.name}>; add a bounded handler in docs/content/transforms/policy.mjs and docs-site (never discard)`);
      const attributes = {};
      for (const a of node.attributes) {
        if (a.type !== 'mdxJsxAttribute') throw new Error(`${where(file, node)}: unsupported spread attribute`);
        if (a.name.startsWith('on') || a.name === 'dangerouslySetInnerHTML') throw new Error(`${where(file, node)}: executable attribute ${a.name} requires a reviewed island; never execute source MDX`);
        attributes[a.name] = a.value === null ? true : typeof a.value === 'string' ? a.value : literal(a.value.data.estree.body[0]?.expression, where(file, node));
        if (a.name === 'href' && typeof a.value === 'string') {
          const original = a.value;
          a.value = rewriteLink(a.value);
          attributes[a.name] = a.value;
          result.links.push({ source: original, target: a.value, location: where(file, node) });
        }
      }
      node.data = { ...node.data, handler, ...(binding ? { reference: binding.reference } : {}) };
      result.nodes.push({ name: node.name, handler, attributes, location: where(file, node), ...(binding ? { reference: binding.reference } : {}) });
      if (node.name === 'Subtitle') result.subtitle = text(node);
      if (node.name === 'Meta') result.metadata[attributes.name ?? attributes.property] = attributes.content;
      if (JSON.stringify(attributes).includes('React') || JSON.stringify(attributes).includes('@base-ui/react')) flag('framework-metadata', node, 'Source attributes/SEO remain React-scoped until reviewed.');
      if (handler !== 'html' && handler !== 'subtitle' && handler !== 'metadata') flag(`handler:${handler}`, node, `Site must implement ${node.name}; source retained, never executed.`);
      if (attributes.className) flag('class-spelling', node, 'Map className to class in the bounded renderer.');
      if (handler === 'private-install-instructions') flag('publication-identity', node, 'Render workspace/tarball instructions; no published npm identity is asserted.');
      if (/^h[1-6]$/.test(node.name)) {
        result.headings.push({ depth: Number(node.name[1]), text: text(node), properties: attributes, location: where(file, node) });
      }
    } else if (!markdownNodes.has(node.type)) throw new Error(`${where(file, node)}: unknown Markdown node ${node.type}; add a bounded mapping`);
    if (node.type === 'heading') {
      const entry = { depth: node.depth, text: text(node), properties: node.data?.hProperties ?? {}, location: where(file, node) };
      result.headings.push(entry);
      if (node.depth === 1 && result.title === null) result.title = entry.text;
    }
    if (['link', 'definition', 'image'].includes(node.type)) {
      const original = node.url;
      node.url = rewriteLink(node.url);
      result.links.push({ source: original, target: node.url, location: where(file, node) });
    }
    if (node.type === 'code' && /^(jsx?|tsx?|javascript|typescript)$/.test(node.lang ?? '')) {
      const parsed = codeReferences(node.value, node.lang === 'ts' ? 'snippet.ts' : 'snippet.tsx');
      node.data = { ...node.data, sourceValue: node.value, references: parsed.refs, diagnostics: parsed.diagnostics };
      if (parsed.diagnostics.length) flag('incomplete-code-example', node, 'Fragment is preserved; semantic overlay must compile complete examples.');
      const edits = [];
      for (const ref of parsed.refs) {
        if (!historical && (ref.value === '@base-ui/react' || ref.value.startsWith('@base-ui/react/'))) edits.push({ ...ref, replacement: PACKAGE + ref.value.slice('@base-ui/react'.length) });
      }
      // AST ranges change only module literals, not comments, strings or prose.
      for (const edit of edits.sort((a, b) => b.start - a.start)) node.value = node.value.slice(0, edit.start) + edit.replacement + node.value.slice(edit.end);
      node.data.packageEdits = edits;
      function inspect(n) {
        if (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) {
          const name = n.tagName.getText(parsed.tree);
          if (/^[A-Z]/.test(name)) flag('public-component-reference', node, name);
        }
        if (ts.isJsxAttribute(n) && ['render', 'ref', 'className', 'onChange'].includes(n.name.getText(parsed.tree))) flag(`react-${n.name.getText(parsed.tree)}`, node, 'Requires reviewed Solid render/ref/class/native-event adaptation.');
        if (ts.isCallExpression(n) && /^(React\.)?use[A-Z]/.test(n.expression.getText(parsed.tree))) flag('react-hook', node, n.expression.getText(parsed.tree));
        ts.forEachChild(n, inspect);
      }
      inspect(parsed.tree);
      flag('source-snippet', node, 'Package mapping alone is not a valid Solid example; review and compile before publication.');
    }
    if (typeof node.value === 'string' && /\bReact\b|\bclassName\b|\bSyntheticEvent\b|\bforwardRef\b|react-hook-form|@tanstack\/react|@base-ui\/react|\buse[A-Z]\w*/.test(node.value)) flag('framework-language', node, 'Retained source language requires semantic review; not silently relabeled.');
  });
  if (/React|@base-ui\/react/.test(JSON.stringify(result.metadata))) flag('framework-metadata', tree, 'Preserve original metadata as evidence; site must use reviewed framework-specific metadata.');
  const hast = { type: 'root', children: result.headings.map((h) => ({ type: 'element', tagName: `h${h.depth}`, properties: { ...h.properties }, children: [{ type: 'text', value: h.text }] })) };
  slug()(hast);
  let headingIndex = 0;
  walk(tree, (node) => {
    if (node.type === 'heading' || (node.type.startsWith('mdxJsx') && /^h[1-6]$/.test(node.name))) {
      const properties = hast.children[headingIndex].properties;
      result.headings[headingIndex++].properties = properties;
      node.data = { ...node.data, hProperties: properties };
    }
  });
  return clean(result);
}

// Consumers must explicitly implement every node handler and supply source-linked
// semantic approvals. An inventory pass is never a publication/parity gate.
export function assertSiteReady(page, { handlers = [], approvedAdaptations = [] } = {}) {
  const missing = [...new Set(page.nodes.map((n) => n.handler))].filter((h) => !handlers.includes(h));
  const pending = page.adaptations.filter((a) => !approvedAdaptations.includes(`${a.kind}@${a.location}:${a.detail}`));
  if (missing.length || pending.length) throw new Error(`${page.source}: not publishable: missing handlers [${missing.join(', ')}], ${pending.length} unreviewed semantic adaptations; see bsolid-docs-site/bsolid-docs-handbooks/bsolid-docs-complete`);
}
