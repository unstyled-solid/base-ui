import { nativeTags } from '../../content/transforms/policy.mjs';
import { localUrl } from './paths.mjs';
import ts from 'typescript';
import { demoDispositions } from '../../content/demo-dispositions.mjs';
import { renderReference } from './reference.mjs';
import { markdownIcon, githubIcon } from './icons.mjs';
import { repository, publicIdentity } from './release.mjs';

export const handlers = ['html', 'subtitle', 'metadata', 'demo', 'api', 'private-install-instructions', 'react-release-history', 'react-production-error', 'solid-type-reference', 'solid-prop-reference', 'quick-nav-root', 'quick-nav-trigger', 'quick-nav-popup'];
export const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const location = (page, node) => `${page.source}:${node.position?.start?.line ?? 1}:${node.position?.start?.column ?? 1}`;
const voidTags = new Set(['br', 'hr', 'img', 'source', 'col', 'link']);
const attrNames = new Set('id title href src alt width height class className role open controls muted loop autoPlay playsInline preload poster type scope colSpan rowSpan start reversed dateTime target rel download loading align as'.split(' '));
function attributes(values, base, fail) {
  return Object.entries(values).map(([key, value]) => {
    if (!attrNames.has(key) && !/^(?:data|aria)-[a-z0-9-]+$/.test(key)) fail(`unsupported HTML attribute ${key}`);
    key = ({ className: 'class', colSpan: 'colspan', rowSpan: 'rowspan', autoPlay: 'autoplay', playsInline: 'playsinline', dateTime: 'datetime' })[key] ?? key;
    if (value === false || value == null) return '';
    if (value === true) return ` ${key}`;
    if (typeof value !== 'string' && typeof value !== 'number') fail(`non-scalar HTML attribute ${key}`);
    if (['href', 'src', 'poster'].includes(key)) value = localUrl(String(value), base);
    return ` ${key}="${escape(value)}"`;
  }).join('');
}

/** Non-executable JSON AST renderer. Every construct is an explicit handler. */
export function renderPage(page, { base = '/', pages = [], demos = [], demoReferences = {}, api = null } = {}) {
  const issues = [];
  const renderedApi = new Set(page.headings.map((h) => 'id:' + escape(h.properties.id)));
  const definitions = new Map();
  function scan(n) { if (n.type === 'definition') definitions.set(n.identifier, n); n.children?.forEach(scan); }
  scan(page.ast);
  const occurrence = new Map((page.sourceNodes ?? page.nodes).map((n) => [n.location, n]));
  const headings = new Map(page.headings.map((h) => [h.location, h]));
  const missing = (kind, node, detail) => {
    issues.push({ kind, location: location(page, node), detail });
    return `<aside class="SiteMissing" data-missing="${escape(kind)}"><strong>${kind === 'demo' ? 'Example' : 'API reference'} temporarily unavailable</strong><p>Please <a href="${repository}">report this on GitHub</a> with the page URL.</p></aside>`;
  };
  function render(node, tight = false) {
    const at = location(page, node);
    const fail = (message) => { throw new Error(`${at}: ${message}; add a bounded docs-site handler`); };
    const children = () => (node.children ?? []).map((n) => render(n, tight)).join('');
    const tag = (name, body = children(), attrs = {}) => `<${name}${attributes(attrs, base, fail)}>${body}</${name}>`;
    switch (node.type) {
      case 'root': return children();
      case 'sourceModule':
        if (node.data?.handler !== 'non-executable-import-metadata') fail('unapproved source module');
        return '';
      case 'definition': return '';
      case 'text': return escape(node.value);
      case 'paragraph': {
        const content = children();
        if (!content.trim()) return '';
        if (tight || node.children.some(child => ['subtitle','demo','api','metadata','private-install-instructions'].includes(child.data?.handler))) return content;
        return tag('p', content, { class: 'MdP' });
      }
      case 'heading': {
        const h = headings.get(at); if (!h?.properties?.id) fail('missing upstream heading ID');
        const badge = h.properties['data-heading-badge'];
        return tag(`h${node.depth}`, `${node.depth === 1 ? children() : `<a class="HeadingLink" href="#${escape(h.properties.id)}">${children()}</a>`}${badge ? `<span class="MdHeadingBadge">${escape(badge)}</span>` : ''}`, { id: h.properties.id, class: `MdH${node.depth}` });
      }
      case 'inlineCode': return tag('code', escape(node.value), { class: 'MdCode Code' });
      case 'code': return `<figure class="MdFigure CodeBlockRoot"><figcaption>${escape(node.meta?.match(/title="([^"]+)"/)?.[1] ?? node.lang ?? 'Code')}${node.data?.frameworkContext ? ` · ${escape(node.data.frameworkContext)}` : ''}<button type="button" class="CodeCopy" aria-label="Copy code" title="Copy code"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5.5 5.5h8v8h-8zM10.5 5.5v-3h-8v8h3"/></svg></button></figcaption><pre class="CodeBlockPre" tabindex="0"><code class="language-${escape(node.lang ?? 'text')}">${highlight(node.value, node.lang)}</code></pre></figure>`;
      case 'strong': return tag('strong');
      case 'emphasis': return tag('em', children(), { class: 'MdEm' });
      case 'delete': return tag('del');
      case 'break': return '<br>';
      case 'thematicBreak': return '<hr>';
      case 'blockquote': return tag('blockquote');
      case 'list': return tag(node.ordered ? 'ol' : 'ul', node.children.map((n) => render(n, !node.spread)).join(''), { class: node.ordered ? 'MdOl' : 'MdUl', ...(node.start && node.start !== 1 ? { start: node.start } : {}) });
      case 'listItem': return tag('li', `${node.checked != null ? `<input type="checkbox" disabled${node.checked ? ' checked' : ''}>` : ''}${children()}`, { class: 'MdListItem' });
      case 'link': return tag('a', children(), { href: node.url, title: node.title });
      case 'linkReference': {
        const def = definitions.get(node.identifier); if (!def) fail(`unresolved link definition ${node.identifier}`);
        return tag('a', children(), { href: def.url, title: def.title });
      }
      case 'image': return `<img${attributes({ src: node.url, alt: node.alt ?? '', title: node.title, loading: 'lazy' }, base, fail)}>`;
      case 'imageReference': {
        const def = definitions.get(node.identifier); if (!def) fail(`unresolved image definition ${node.identifier}`);
        return `<img${attributes({ src: def.url, alt: node.alt ?? '', title: def.title }, base, fail)}>`;
      }
      case 'table': return `<div class="SiteTableScroll"><table class="MdTable TableRoot"><thead>${tableRow(node.children[0], true)}</thead><tbody>${node.children.slice(1).map((n) => tableRow(n, false)).join('')}</tbody></table></div>`;
      case 'mdxTextExpression': case 'mdxFlowExpression':
        if (node.data?.handler === 'comment' && /^\s*\/\*[\s\S]*\*\/\s*$/.test(node.value)) return '';
        fail('unresolved MDX expression'); break;
      case 'mdxJsxTextElement': case 'mdxJsxFlowElement': {
        const record = occurrence.get(at);
        if (!record || record.name !== node.name || record.handler !== node.data?.handler) fail(`unregistered MDX component ${node.name}`);
        const attrs = record.attributes;
        switch (record.handler) {
          case 'metadata': return '';
          case 'subtitle': return tag('div', `<div>${children()}</div><div class="SubtitleLinks"><a class="SubtitleLink" href="${escape(localUrl(page.route + '.md',base))}"><span class="SubtitleLinkText">${markdownIcon} View as Markdown</span></a>${page.route.includes('/components/') ? `<a class="SubtitleLink" href="${repository}/tree/HEAD/packages/solid/src/${escape(page.route.split('/').at(-1))}"><span class="SubtitleLinkText">${githubIcon} View Solid source</span></a>` : ''}</div>`, { class: 'Subtitle' });
          case 'html': {
            if (!nativeTags.has(node.name)) fail(`unsupported HTML tag ${node.name}`);
            const values = { ...attrs, ...(node.data?.hProperties ?? {}) };
            return voidTags.has(node.name) ? `<${node.name}${attributes(values, base, fail)}>` : tag(node.name, children(), values);
          }
          case 'demo': {
            const disposition = record.reference?.includes('/handbook/') && demoDispositions[record.reference.split('#')[0].split('/').at(-1)];
            if (disposition) return `<aside class="SiteFrameworkNote"><strong>React ecosystem example</strong><p>${escape(disposition.reason)}</p><a href="${escape(localUrl(disposition.url, base))}">Solid documentation</a></aside>`;
            const entry = demos.find((d) => d.id === demoReferences[record.reference] || d.upstream === record.reference || d.upstream === record.reference?.slice(5) || d.id === record.reference);
            if (!entry || !entry.variants?.length) return missing('demo', node, `Add a real DemoEntry for ${record.reference} to the demo catalog (bsolid-docs-demos).`);
            return `<div class="SiteDemo"><div data-demo-id="${escape(entry.id)}"><noscript><p>Enable JavaScript to interact with this example.</p></noscript></div></div>`;
          }
          case 'api': {
            const entry = resolveApi(api, record, page, attrs);
            if (!entry) return missing('api', node, `Generate Solid declarations for ${record.name} (${record.reference}) using bsolid-docs-api; no React tables are substituted.`);
            return renderApi(entry, attrs, renderedApi);
          }
          case 'private-install-instructions': return `<p>Install the published alpha package: <code>pnpm add ${escape(publicIdentity.name)} solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13</code>. See the <a href="${escape(localUrl('/solid/overview/quick-start', base))}">quick start</a> for compiler configuration.</p>`;
          case 'react-release-history': return `<p>Upstream React release history; these are not Solid releases.</p><ul>${pages.filter((p) => p.route.startsWith('/upstream/react/overview/releases/')).sort((a, b) => b.title.localeCompare(a.title, undefined, { numeric: true })).map((p) => `<li><a href="${escape(localUrl(p.route, base))}">${escape(p.title)}</a></li>`).join('')}</ul>`;
          case 'react-production-error': return node.name === 'ErrorCode' ? '<span>upstream React error</span>' : '<p>Consult the pinned upstream React error reference. This is not a Solid error-code catalog.</p>';
          default: fail(`unsupported MDX handler ${record.handler}`);
        }
        break;
      }
      default: fail(`unsupported AST node ${node.type}`);
    }
  }
  function tableRow(n, header) { return `<tr>${n.children.map((c) => `<${header ? 'th scope="col"' : 'td'}>${c.children.map((x) => render(x)).join('')}</${header ? 'th' : 'td'}>`).join('')}</tr>`; }
  return { html: render(page.ast), issues };
}

// Catalog adapters deliberately consume data, never imported React render factories.
export function resolveApi(catalog, record, page, attrs = {}) {
  if (!catalog) return null;
  if (catalog.modules) {
    const family = page.route.split('/').pop();
    let module = catalog.modules.find((m) => m.entrypoint === `./${family}`);
    if (!module) return null;
    const binding = record.name.split('.')[0].replace(/^Types/, '');
    const part = record.name.split('.').slice(1).join('.');
    const candidates = [binding + (part ? `.${part}` : ''), binding[0]?.toLowerCase() + binding.slice(1) + (part ? `.${part}` : '')];
    if (family === 'radio-group') {
      if (part === 'RadioGroup') candidates.push('RadioGroup');
      else if (['Root', 'Indicator'].includes(part)) { module = catalog.modules.find(m => m.entrypoint === './radio'); candidates.push(`Radio.${part}`); }
    }
    if (binding === 'UseDirection') { module = catalog.modules.find(m => m.entrypoint === './internals/direction-context'); candidates.push('useDirection'); }
    if (!module) return null;
    const additional = attrs.showAdditionalTypes;
    if (additional || /Additional(?:Types)?$/.test(binding)) {
      const types = module.exports.filter((e) => e.kind === 'type' && (!additional || additional.includes(e.name.toLowerCase().replace(/[^a-z0-9]/g, ''))));
      if (!types.length) return null;
      return { ...types[0], related: types.slice(1) };
    }
    const entry = module.exports.find((e) => candidates.includes(e.name));
    if (!entry) return null;
    const related = module.exports.filter((e) => e.kind === 'type' && (e.name.startsWith(entry.name + '.') || e.name === entry.name + 'Props' || e.name === entry.name + 'State' || e.name === `Use${entry.name.split('.').pop().replace(/^use/, '')}ReturnValue`));
    if (entry.kind === 'helper' && !entry.props?.length) {
      const parameters = related.find(type => /\.Parameters$/.test(type.name));
      if (parameters?.properties?.length) return {...entry, props:parameters.properties, related};
      const signature = entry.signatures?.[0];
      if (signature) {
        const ast = ts.createSourceFile('parameters.ts', `declare function fn${signature};`, ts.ScriptTarget.Latest, true);
        const fn = ast.statements.find(ts.isFunctionDeclaration);
        if (fn?.parameters.length) return {...entry,props:fn.parameters.map(p=>({name:p.name.getText(ast),type:p.type?.getText(ast)??'unknown',required:!p.questionToken&&!p.dotDotDotToken,description:'',default:{status:'unavailable'}})),related};
      }
    }
    return { ...entry, related: related.map((e) => /ReturnValue$/.test(e.name) && entry.kind === 'helper' ? { ...e, compatibilityAlias: entry.name } : e) };
  }
  const entries = Array.isArray(catalog) ? catalog : catalog.entries ?? catalog.components ?? [];
  const list = Array.isArray(entries) ? entries : Object.values(entries);
  const part = record.name.split('.').slice(1).join('.');
  return list.find((e) => (e.reference === record.reference || e.upstream === record.reference || e.route === page.route) && (e.part ?? '') === part && e.status !== 'missing' && (Array.isArray(e.props) || Array.isArray(e.properties))) ?? null;
}
export function renderApi(entry, attrs = {}, seen = new Set()) {
  return renderReference(entry, attrs, seen);
}
function legacyRenderApi(entry, attrs = {}, seen = new Set()) {
  if (entry.anchor && seen.has('render:' + entry.anchor)) return '';
  if (entry.anchor) seen.add('render:' + entry.anchor);
  const props = entry.props?.length ? entry.props : entry.properties ?? [];
  const alias = entry.name?.replaceAll('.', '');
  const defaultText = (value) => typeof value === 'object' && value !== null ? value.status === 'unavailable' ? '—' : value.value : value ?? '—';
  const source = entry.source ? `<p class="SiteApiSource">Declaration: <code>${escape(entry.source.file)}:${escape(entry.source.line)}</code>${entry.source.url ? ` · <a href="${escape(localUrl(entry.source.url))}">source</a>` : ''}</p>` : '';
  const body = `<section class="MdReferenceBlock" data-api-status="generated"${entry.anchor ? ` id="${escape(entry.anchor)}"` : ''}>${alias ? `<span id="${escape(alias.toLowerCase())}"></span>` : ''}${!attrs.hideDescription && entry.description ? `<p>${escape(entry.description)}</p>` : ''}${source}${entry.kind !== 'component' && entry.type ? `<pre tabindex="0"><code>${escape(entry.type)}</code></pre>` : ''}${props.length ? `<div class="SiteTableScroll"><table class="MdTable TableRoot"><thead><tr><th scope="col">${entry.kind === 'component' ? 'Prop' : 'Property'}</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">Description</th></tr></thead><tbody>${props.map((p) => `<tr${p.anchor ? ` id="${escape(p.anchor)}"` : ''}><th scope="row">${alias ? `<span id="${escape(alias)}-${escape(p.name)}"></span>` : ''}<code>${escape(p.name)}${p.required ? '' : '?'}</code></th><td><code>${escape(p.type)}</code></td><td><code>${escape(defaultText(p.default ?? p.defaultValue))}</code></td><td>${escape(p.description)}${p.inheritedDOM ? ' (Inherited DOM attribute)' : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p>No properties declared.</p>'}${entry.inheritedDOM?.length ? `<details><summary>Inherited DOM attributes</summary><p>${entry.inheritedDOM.map(escape).join(', ')}</p></details>` : ''}${entry.metadata ? `<p class="SiteMissing">Data attributes: ${escape(entry.metadata.dataAttributes)}. CSS variables: ${escape(entry.metadata.cssVariables)}. Unavailable metadata requires API-owner integration.</p>` : ''}</section>`;
  const compatibility = entry.compatibilityAlias ? props.map((p) => `<span id="${escape(entry.compatibilityAlias.replaceAll('.', ''))}-${escape(p.name)}"></span>`).join('') : '';
  // Namespace aliases may collapse to an identical legacy ID. First occurrence
  // owns that compatibility anchor; declaration-generated canonical IDs remain.
  const own = (compatibility + body).replace(/ id="([^"]+)"/g, (attribute, id) => {
    if (seen.has('id:' + id)) return '';
    seen.add('id:' + id); return attribute;
  });
  const metadata = [['Data attributes', entry.dataAttributes], ['CSS variables', entry.cssVariables]].filter(([, rows]) => rows?.length).map(([title, rows]) => `<h4>${title}</h4><div class="SiteTableScroll"><table><thead><tr><th>Name</th><th>Description</th></tr></thead><tbody>${rows.map(row => `<tr><td><code>${escape(row.name)}</code></td><td>${escape(row.description)}</td></tr>`).join('')}</tbody></table></div>`).join('');
  return own.replace(/<p class="SiteMissing">Data attributes:[\s\S]*?<\/p>/, metadata) + (entry.related ?? []).map((e) => `<details class="SiteRelatedType"><summary>${escape(e.name)}</summary>${renderApi(e, {}, seen)}</details>`).join('');
}

/** Compiler tokenization, with escaped source and exact whitespace preservation. */
export function highlight(source, language) {
  if (!/^(?:jsx?|tsx?|javascript|typescript|json)$/.test(language ?? '')) return escape(source);
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.JSX, source);
  let result = '';
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    const token = escape(scanner.getTokenText());
    const before = source.slice(0, scanner.getTokenPos());
    const after = source.slice(scanner.getTextPos());
    const style = kind >= ts.SyntaxKind.FirstKeyword && kind <= ts.SyntaxKind.LastKeyword ? 'keyword' : [ts.SyntaxKind.StringLiteral, ts.SyntaxKind.NoSubstitutionTemplateLiteral].includes(kind) ? 'string' : kind === ts.SyntaxKind.NumericLiteral ? 'number' : [ts.SyntaxKind.SingleLineCommentTrivia, ts.SyntaxKind.MultiLineCommentTrivia].includes(kind) ? 'comment' : kind === ts.SyntaxKind.Identifier && /<\/?[\w.]*$/.test(before) ? 'tag' : kind === ts.SyntaxKind.Identifier && /^\s*=/.test(after) ? 'attribute' : '';
    result += style ? `<span class="SiteToken-${style}">${token}</span>` : token;
  }
  return result;
}
