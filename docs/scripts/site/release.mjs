import contract from '../../../distribution/package-contract.json' with { type: 'json' };
import { enrichReference } from '../../content/api/guidance.mjs';

export const repository = 'https://github.com/unstyled-solid/base-ui';
export const publicIdentity = { name: contract.identity.publicationName, version: contract.identity.version };

export function publicApiCatalog(catalog) {
  if (!catalog?.modules) return catalog;
  return { ...catalog, modules: catalog.modules.map(module => ({ ...module, exports: module.exports.map(enrichReference) })) };
}

const text = value => ({ type: 'text', value });
const paragraph = value => ({ type: 'paragraph', children: [text(value)] });
const link = (title, url) => ({ type: 'link', url, children: [text(title)] });
function heading(title, depth, id, line) {
  return { type: 'heading', depth, children: [text(title)], position: { start: { line, column: 1 } }, data: { hProperties: { id } } };
}

// Generated upstream indexes are search inventories, not consumer landing pages.
// Keep their source ordering and route IDs, but show actual page descriptions.
export function releaseIndexes(pages) {
  const indexes = new Set(['/solid', '/solid/overview', '/solid/handbook', '/solid/components', '/solid/utils']);
  return pages.map(source => {
    if (!indexes.has(source.route)) return source;
    const page = structuredClone(source);
    const routes = [...new Set(source.links.map(entry => entry.target.split('#')[0]))];
    const entries = routes.map(route => pages.find(candidate => candidate.route === route))
      .filter(candidate => candidate && candidate.route !== page.route && !candidate.route.startsWith('/upstream/'));
    // Replace the old React releases entry in-place in the Overview ordering.
    if (page.route === '/solid/overview') {
      const release = pages.find(candidate => candidate.route === '/solid/overview/releases');
      if (release && !entries.includes(release)) entries.splice(2, 0, release);
    }
    page.title = page.route === '/solid' ? 'Documentation' : page.title;
    page.subtitle = page.route === '/solid' ? 'Guides, components, and utilities for Base UI for Solid.' : `Explore the ${page.title.toLowerCase()} documentation for Base UI for Solid.`;
    const firstId = source.headings[0]?.properties.id ?? 'documentation';
    const children = [heading(page.title, 1, firstId, 1), paragraph(page.subtitle)];
    const links = [];
    for (const entry of entries) {
      const old = source.headings.find(item => item.text === entry.title);
      const id = old?.properties.id ?? entry.route.split('/').at(-1);
      children.push(heading(entry.title, 2, id, children.length + 1));
      if (entry.subtitle) children.push(paragraph(entry.subtitle));
      children.push({ type: 'paragraph', children: [link(`Read ${entry.title}`, entry.route)] });
      links.push({ source: entry.route, target: entry.route, location: page.source });
    }
    page.ast = { type: 'root', children };
    page.headings = children.filter(node => node.type === 'heading').map(node => ({ depth: node.depth, text: node.children[0].value, properties: node.data.hProperties, location: `${page.source}:${node.position.start.line}:1` }));
    page.links = links;
    page.nodes = [];
    page.sourceNodes = [];
    page.metadata = { description: page.subtitle };
    page.releaseOverlay = { kind: 'consumer-index', source: source.source };
    return page;
  });
}

export function releaseErrorPage(source) {
  if (source.route !== '/production-error') return source;
  const page = structuredClone(source);
  page.title = 'Troubleshooting';
  page.subtitle = 'Diagnosing errors in Base UI for Solid.';
  page.metadata = { description: page.subtitle, robots: { index: false } };
  page.ast = { type: 'root', children: [
    heading(page.title, 1, 'troubleshooting', 1),
    paragraph('Use a development build to read the full error message and identify the component involved. Verify that solid-js and @solidjs/web both use the supported Solid 2.0.0-rc.13 version.'),
    paragraph('This Solid port does not use the upstream React production error-code catalog. Include the complete error, package versions, and a minimal reproduction when reporting a problem.'),
    { type: 'paragraph', children: [link('Report an issue on GitHub', repository)] },
  ] };
  page.headings = [{ depth: 1, text: page.title, properties: { id: 'troubleshooting' }, location: `${page.source}:1:1` }];
  page.nodes = []; page.sourceNodes = []; page.notice = null;
  page.links = [{ source: repository, target: repository, location: page.source }];
  page.releaseOverlay = { kind: 'solid-troubleshooting', source: source.source };
  return page;
}

export function resolveOrigin(value = process.env.DOCS_ORIGIN ?? (process.env.NETLIFY === 'true' ? process.env.URL : '') ?? '') {
  if (!value) return '';
  const parsed = new URL(value);
  if (!['https:', 'http:'].includes(parsed.protocol) || parsed.pathname !== '/' || parsed.search || parsed.hash || parsed.username || parsed.password || parsed.hostname.endsWith('.invalid')) throw new Error('DOCS_ORIGIN must be the real HTTP(S) deployment origin, without a path, credentials, query, or fragment');
  return parsed.origin;
}

export function allowIndexing(origin, env = process.env) {
  return Boolean(origin) && env.DOCS_NOINDEX !== 'true' && (!env.CONTEXT || env.CONTEXT === 'production');
}
