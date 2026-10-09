import { resolveApi, location } from './render.mjs';
import { demoDispositions } from '../../content/demo-dispositions.mjs';
import { nativeTags } from '../../content/transforms/policy.mjs';

const cleanType = value => String(value ?? '').replace(/import\("[^"]+"\)\./g, '');
const cell = value => String(value ?? '').replaceAll('|', '\\|').replace(/\r?\n/g, '<br>');
const html = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
function fence(value, lang = '') {
  value = String(value ?? '');
  const ticks = '`'.repeat(Math.max(3, ...[...value.matchAll(/`+/g)].map(m => m[0].length + 1)));
  return `${ticks}${lang}\n${value}\n${ticks}\n\n`;
}
function inline(value) {
  value = String(value ?? '');
  const ticks = '`'.repeat(Math.max(1, ...[...value.matchAll(/`+/g)].map(m => m[0].length + 1)));
  const pad = /`|^ | $/.test(value) ? ' ' : '';
  return ticks + pad + value + pad + ticks;
}
function table(headers, rows) {
  return `| ${headers.map(cell).join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n\n`;
}

/** Serialize the same non-executable source AST and Solid catalogs as the site. */
export function markdownPage(page, context = {}) {
  const records = new Map((page.sourceNodes ?? page.nodes ?? []).map(n => [n.location, n]));
  const headings = new Map((page.headings ?? []).map(n => [n.location, n]));
  const seenApis = new Set(), seenAnchors = new Set();
  function anchor(id) {
    if (!id || seenAnchors.has(id)) return '';
    seenAnchors.add(id);
    return `<a id="${html(id)}"></a>\n\n`;
  }
  function properties(rows, label) {
    return table([label, 'Type', 'Required', 'Default', 'Description'], rows.map(p => {
      const value = p.default ?? p.defaultValue;
      const fallback = value && typeof value === 'object' ? value.status === 'unavailable' ? 'Unavailable' : value.value ?? value.status ?? 'Unavailable' : value ?? 'Unavailable';
      return [p.name, inline(cleanType(p.type)), p.required === true ? 'Yes' : p.required === false ? 'No' : 'Unavailable', fallback, (p.description ?? '') + (p.inheritedDOM ? ' (Inherited DOM attribute)' : '')];
    }));
  }
  function api(entry, attrs = {}, related = false) {
    const key = entry.anchor ?? `${entry.kind}:${entry.name}`;
    const anchors = anchor(entry.anchor) + anchor(entry.name?.replaceAll('.', '').toLowerCase()) + (entry.compatibilityAnchors ?? []).map(anchor).join('');
    if (seenApis.has(key)) return anchors;
    seenApis.add(key);
    let result = anchors + `### ${related ? 'Related exported type: ' : ''}${entry.name ?? 'API'}\n\n`;
    if (!attrs.hideDescription && entry.description) result += entry.description + '\n\n';
    if (entry.source) result += `Declaration: ${inline(`${entry.source.file}:${entry.source.line}`)}${entry.source.url ? ` · [Source](${entry.source.url})` : ''}\n\n`;
    if (entry.type) result += '#### Declaration\n\n' + fence(cleanType(entry.type), 'typescript');
    const props = (entry.props?.length ? entry.props : entry.properties ?? []).filter(p => !p.inheritedDOM && !/^(?:prop|attr|on|oncapture|bind):/.test(p.name));
    for (const p of props) result += anchor(p.anchor) + anchor(entry.name?.replaceAll('.', '') + '-' + p.name);
    if (props.length && !attrs.hideProps) result += `#### ${entry.kind === 'helper' ? 'Parameters' : entry.kind === 'type' ? 'Properties' : 'Props'}\n\n` + properties(props, entry.kind === 'helper' ? 'Parameter' : entry.kind === 'type' ? 'Property' : 'Prop');
    if (entry.inheritedDOM?.length) result += 'Inherited DOM attributes: ' + entry.inheritedDOM.map(inline).join(', ') + '\n\n';
    for (const [field, title, hidden] of [['dataAttributes', 'Data attributes', attrs.hideDataAttributes], ['cssVariables', 'CSS variables', attrs.hideCssVariables]]) {
      if (hidden) continue;
      const rows = entry[field] ?? [];
      result += `#### ${title}\n\n`;
      result += rows.length ? rows.map(row => anchor(row.anchor)).join('') + table(['Name', 'Description'], rows.map(row => [row.name, row.description ?? ''])) : `Metadata status: ${entry.metadata?.[field] ?? 'unavailable'}.\n\n`;
    }
    if (entry.kind === 'helper') {
      result += '#### Return value\n\n';
      result += entry.returnValue ? fence(cleanType(entry.returnValue.type), 'typescript') + (entry.returnValue.properties?.length ? properties(entry.returnValue.properties, 'Property') : '') : 'Return metadata unavailable; consult the declaration above.\n\n';
    }
    for (const type of entry.related ?? []) result += api(type, {}, true);
    return result;
  }
  function md(n) {
    const children = () => (n.children ?? []).map(md).join('');
    switch (n.type) {
      case 'root': return children();
      case 'sourceModule': return '';
      case 'text': return n.value;
      case 'paragraph': return children() + '\n\n';
      case 'heading': return anchor(headings.get(location(page, n))?.properties?.id) + '#'.repeat(n.depth) + ' ' + children() + '\n\n';
      case 'code': return (n.data?.frameworkContext ? `**${n.data.frameworkContext}**\n\n` : '') + fence(n.value, n.lang);
      case 'inlineCode': return inline(n.value);
      case 'strong': return '**' + children() + '**';
      case 'emphasis': return '*' + children() + '*';
      case 'delete': return '~~' + children() + '~~';
      case 'break': return '  \n';
      case 'thematicBreak': return '---\n\n';
      case 'blockquote': return children().trimEnd().split('\n').map(line => '> ' + line).join('\n') + '\n\n';
      case 'link': return '[' + children() + '](' + n.url + (n.title ? ' ' + JSON.stringify(n.title) : '') + ')';
      case 'image': return '![' + (n.alt ?? '') + '](' + n.url + (n.title ? ' ' + JSON.stringify(n.title) : '') + ')';
      case 'definition': return `[${n.label ?? n.identifier}]: ${n.url}${n.title ? ' ' + JSON.stringify(n.title) : ''}\n\n`;
      case 'linkReference': return '[' + children() + '][' + (n.label ?? n.identifier) + ']';
      case 'imageReference': return '![' + (n.alt ?? '') + '][' + (n.label ?? n.identifier) + ']';
      case 'list': return n.children.map((item, index) => {
        const prefix = n.ordered ? `${(n.start ?? 1) + index}. ` : '- ';
        const body = (item.checked == null ? '' : `[${item.checked ? 'x' : ' '}] `) + md(item).trimEnd();
        return prefix + body.replaceAll('\n', '\n' + ' '.repeat(prefix.length)) + '\n' + (n.spread ? '\n' : '');
      }).join('') + '\n';
      case 'listItem': return children();
      case 'table': {
        const rows = n.children.map(row => row.children.map(c => c.children.map(md).join('')));
        const align = (n.align ?? rows[0].map(() => null)).map(a => a === 'left' ? ':---' : a === 'right' ? '---:' : a === 'center' ? ':---:' : '---');
        return `| ${rows[0].map(cell).join(' | ')} |\n| ${align.join(' | ')} |\n${rows.slice(1).map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n\n`;
      }
      case 'mdxTextExpression': case 'mdxFlowExpression':
        if (n.data?.handler === 'comment') return '';
        throw new Error(`${location(page, n)}: unresolved Markdown expression`);
      case 'mdxJsxFlowElement': case 'mdxJsxTextElement': {
        const record = records.get(location(page, n));
        const handler = record?.handler ?? n.data?.handler;
        const attrs = record?.attributes ?? {};
        if (handler === 'metadata') return '';
        if (handler === 'api') {
          const entry = resolveApi(context.api, record, page, attrs);
          return entry ? api(entry, attrs) : '**Solid API unavailable.** Generate Solid declarations; upstream React API tables are not substituted.\n\n';
        }
        if (handler === 'demo') {
          const ref = record.reference;
          const disposition = ref?.includes('/handbook/') && demoDispositions[ref.split('#')[0].split('/').at(-1)];
          if (disposition) return `> **Upstream React integration example (not a Solid interactive demo).** ${disposition.reason}\n> [Solid documentation](${disposition.url})\n\n`;
          const demos = Array.isArray(context.demos) ? context.demos : context.demos?.entries ?? [];
          const entry = demos.find(d => d.id === context.demoReferences?.[ref] || d.upstream === ref || d.upstream === ref?.slice(5) || d.id === ref);
          if (!entry?.variants?.length) return `**Demo unavailable:** ${inline(ref)}. No mounted Solid demo is registered.\n\n`;
          const url = entry.url ?? (entry.anchor ? `${page.route}#${entry.anchor}` : page.route);
          return `[Open mounted Solid demo: ${entry.title ?? entry.id}](${url})\n\n`;
        }
        if (handler === 'private-install-instructions') return fence('npm install @unstyled-solid/base-ui@0.0.1 solid-js@2.0.0-rc.13 @solidjs/web@2.0.0-rc.13', 'sh');
        if (handler === 'react-release-history') return 'Upstream React release history; these are not Solid releases.\n\n' + (context.pages ?? []).filter(p => p.route.startsWith('/upstream/react/overview/releases/')).sort((a, b) => b.title.localeCompare(a.title, undefined, { numeric: true })).map(p => `- [${p.title}](${p.route})\n`).join('') + '\n';
        if (handler === 'react-production-error') return 'Upstream React error reference; this is not a Solid error-code catalog.\n\n';
        if (handler === 'html' && n.name === 'br') return '  \n';
        if (handler === 'html' && n.name === 'hr') return '---\n\n';
        if (handler === 'html' && n.name === 'a') return (attrs.id ? anchor(attrs.id) : '') + (attrs.href ? `[${children()}](${attrs.href})` : children());
        if (handler === 'html' && n.name === 'img') return `![${attrs.alt ?? ''}](${attrs.src})`;
        if (handler === 'html' && nativeTags.has(n.name)) {
          const values = { ...attrs, ...n.data?.hProperties };
          const attributes = Object.entries(values).filter(([key, value]) => /^(?:id|title|start|reversed|align|colSpan|rowSpan|href|src|alt|controls|poster|width|height|open|data-[\w-]+|aria-[\w-]+)$/.test(key) && value != null && value !== false).map(([key, value]) => ` ${key.toLowerCase()}="${html(value)}"`).join('');
          return `<${n.name}${attributes}>${n.type === 'mdxJsxFlowElement' ? '\n\n' : ''}${children()}</${n.name}>${n.type === 'mdxJsxFlowElement' ? '\n\n' : ''}`;
        }
        if (['subtitle', 'quick-nav-root', 'quick-nav-trigger', 'quick-nav-popup'].includes(handler)) return children() + (n.type === 'mdxJsxFlowElement' ? '\n\n' : '');
        throw new Error(`${location(page, n)}: unsupported Markdown MDX handler ${handler}`);
      }
      default: throw new Error(`${location(page, n)}: unsupported Markdown AST node ${n.type}`);
    }
  }
  return md(page.ast);
}
