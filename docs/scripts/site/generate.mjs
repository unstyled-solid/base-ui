import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, output, sha, basePath, localUrl, routeFile } from './paths.mjs';
import { escape, renderPage, handlers } from './render.mjs';
import { sourceStyles } from './styles.mjs';
import { adaptPage } from '../../content/handbooks/overlays.mjs';
import { createHash } from 'node:crypto';
import { shell } from './shell.mjs';
import { format } from 'prettier';
import { markdownPage } from './markdown.mjs';
import { applyOverviewReleaseContent, createReleasePages } from '../../content/overview/release-content.mjs';
import { publicIdentity, repository, releaseIndexes, releaseErrorPage, resolveOrigin, allowIndexing, publicApiCatalog } from './release.mjs';
export { shell } from './shell.mjs';

export async function json(file, fallback) {
  try { return JSON.parse(await fs.readFile(path.join(root, file), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT' && fallback !== undefined) return fallback; throw e; }
}
export async function readPages(directory = path.join(root, 'docs/upstream/generated/pages')) {
  const pages = [];
  for (const e of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(directory, e.name);
    if (e.isDirectory()) pages.push(...await readPages(file));
    else if (e.name.endsWith('.json')) pages.push(JSON.parse(await fs.readFile(file, 'utf8')));
  }
  return pages;
}
export function preparePublicPages(sources) {
  const pages = sources.map(adaptPage).map(applyOverviewReleaseContent).map(releaseErrorPage);
  const template = sources.find(page => page.route === '/solid/overview/quick-start');
  if (template) pages.push(...createReleasePages(template));
  return releaseIndexes(pages).map(page => {
    if (page.route.startsWith('/upstream/')) return page;
    const result = { ...page, sourceMetadata: page.sourceMetadata ?? structuredClone(page.metadata), metadata: { ...page.metadata } };
    if (page.subtitle) result.metadata.description = page.subtitle;
    // The source inventories retain their React SEO data; public metadata uses
    // actual Solid page descriptions rather than copied keyword lists.
    delete result.metadata.keywords;
    return result;
  });
}
export function navigation(pages) {
  return ['Overview', 'Handbook', 'Components', 'Utils'].map((title) => {
    const page = pages.find((p) => p.route === `/solid/${title.toLowerCase()}`);
    // Index list links are the upstream information architecture, in source order.
    const routes = [...new Set((page?.links ?? []).map((l) => l.target.split('#')[0]).filter((r) => r.startsWith('/') && r !== page.route))];
    const entries = routes.map((route) => pages.find((p) => p.route === route)).filter(Boolean);
    if (title === 'Handbook') entries.push({ title: 'Plain-text documentation', route: '/llms.txt' }, { title: 'Full documentation for LLMs', route: '/llms-full.txt' });
    return { title, pages: entries };
  });
}
function legacyShell(page, html, context) {
  const { base, nav, identity, origin } = context;
  const url = (value) => escape(localUrl(value, base));
  const canonical = `${origin}${localUrl(page.route, base)}`;
  const pending = page.publishable !== true;
  const navHtml = nav.map((s) => `<section class="SideNavSection"><h2 class="SideNavHeading">${escape(s.title)}</h2><ul>${s.pages.map((p) => `<li class="SideNavItem"><a class="SideNavLink"${p.route === page.route ? ' aria-current="page" data-active' : ''} href="${url(p.route)}">${escape(p.title)}</a></li>`).join('')}</ul></section>`).join('');
  const outline = page.headings.filter((h) => h.depth > 1 && !h.properties['data-quick-nav-exclude']);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(page.title)} · ${escape(identity.name)}</title><meta name="description" content="${escape(page.metadata.description ?? page.subtitle ?? 'Source-tracked Solid 2 documentation')}" >${pending || page.metadata.robots?.index === false ? '<meta name="robots" content="noindex, nofollow">' : ''}<link rel="canonical" href="${escape(canonical)}"><meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.subtitle ?? '')}"><meta property="og:url" content="${escape(canonical)}"><link rel="stylesheet" href="${url('/source.css')}"><link rel="stylesheet" href="${url('/site.css')}"></head><body><a class="SiteSkip" href="#main-content">Skip to content</a><header class="SiteHeader"><a href="${url('/solid/overview/quick-start')}">Base UI · Solid 2</a><div id="shell-island"></div><details class="SiteMobileNav"><summary>Navigation</summary><nav aria-label="Mobile documentation">${navHtml}</nav></details></header><div class="RootLayout"><div class="RootLayoutContainer"><div class="RootLayoutContent"><div class="ContentLayoutRoot"><nav class="SideNavRoot" aria-label="Documentation"><div class="SideNavViewport" tabindex="0">${navHtml}</div></nav><main class="ContentLayoutMain" id="main-content" tabindex="-1"><div class="QuickNavContainer"><div class="QuickNavContent"><aside class="SiteVersion">${escape(identity.name)} ${escape(identity.version)} · Solid 2.0.0-rc.13 · upstream <code>${sha}</code></aside>${pending ? '<aside class="SiteReview"><strong>Integration preview — semantic review pending.</strong> Retained upstream prose and source snippets are evidence, not verified Solid compatibility claims.</aside>' : ''}${page.notice ? '<aside class="SiteReview">Upstream React Base UI release history. These are not releases of the Solid port.</aside>' : ''}${html}<footer class="SiteFooter"><a href="https://github.com/mui/base-ui/blob/${sha}/${escape(page.source)}">Pinned upstream source</a> · <a href="${url('/LICENSE.txt')}">MIT attribution</a></footer></div></div></main><nav class="QuickNavRoot" aria-label="On this page"><div class="QuickNavViewport" tabindex="0"><ul class="QuickNavList">${outline.map((h) => `<li><a class="QuickNavLink" href="#${escape(h.properties.id)}">${escape(h.text)}</a></li>`).join('')}</ul></div></nav></div></div></div></div><script type="module" src="${url('/islands.js')}"></script></body></html>`;
}
export async function generate({ base = basePath(), origin } = {}) {
  base = basePath(base);
  origin = resolveOrigin(origin);
  const indexable = allowIndexing(origin);
  const sources = await readPages();
  const pages = preparePublicPages(sources);
  const identity = publicIdentity;
  const catalog = await json('docs/generated/demos/catalog.json', { entries: [] });
  const demos = Array.isArray(catalog) ? catalog : catalog.entries ?? catalog.demos ?? [];
  const api = publicApiCatalog(await json('docs/generated/api/catalog.json', null));
  const nav = navigation(pages);
  const searchOrder = new Map(nav.flatMap(section => section.pages.map(p => ({route:p.route,section:section.title}))).map((p,order)=>[p.route,{order,section:p.section}]));
  const report = { schemaVersion: 1, sourceSha: sha, base, origin, indexable, handlers, routes: [], issues: [], styles: [], assets: [] };
  const outputs = new Map();
  const put = (file, value) => outputs.set(file, value);
  const search = [];
  const markdown = [];
  for (const page of pages) {
    async function formatCode(node) {
      if (node.type === 'code' && /^(tsx?|jsx?|css|json)$/.test(node.lang ?? '')) {
        try { node.value = (await format(node.value, {parser:node.lang === 'css' ? 'css' : node.lang === 'json' ? 'json' : 'babel-ts', singleQuote:true, printWidth:85, tabWidth:2})).trimEnd(); }
        catch { /* Partial source fragments remain literal, not silently discarded. */ }
      }
      for (const child of node.children ?? []) await formatCode(child);
    }
    await formatCode(page.ast);
    const rendered = renderPage(page, { base, pages, demos, demoReferences: catalog.references ?? {}, api });
    report.issues.push(...rendered.issues);
    report.routes.push({ route: page.route, source: page.source, file: routeFile(page.route) });
    put(routeFile(page.route), shell(page, rendered.html, { base, nav, identity, origin, indexable }));
    const pageMarkdown = markdownPage(page, {api,demos,pages,demoReferences:catalog.references ?? {}});
    put(page.route.slice(1) + '.md', pageMarkdown);
    if (!page.route.startsWith('/upstream/') && page.route !== '/production-error') markdown.push({ page, content: pageMarkdown });
    const text = [];
    function visit(n) { if (n.type === 'text') text.push(n.value); n.children?.forEach(visit); } visit(page.ast);
    search.push({ title: page.title, url: localUrl(page.route, base), description: page.subtitle ?? '', text: text.join(' '), ...searchOrder.get(page.route), headings: page.headings.map((h) => ({ title: h.text, url: `${localUrl(page.route, base)}#${h.properties.id}` })) });
  }
  const styles = await sourceStyles();
  report.styles = styles.sources;
  put('source.css', styles.css);
  put('site.css', await fs.readFile(path.join(root, 'docs/site/site.css'), 'utf8'));
  const assets = await json('docs/content/assets/manifest.json', null);
  if (assets) {
    if (assets.sourceSha !== sha) throw new Error('Asset source SHA mismatch');
    for (const entry of assets.entries.filter((e) => e.publishable && e.publicUrl && e.destination)) {
      if (!entry.destination.startsWith('docs/content/assets/public/')) throw new Error(`Unsafe asset destination ${entry.destination}`);
      const bytes = await fs.readFile(path.join(root, entry.destination));
      if (createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error(`Asset hash mismatch ${entry.destination}`);
      put(entry.publicUrl.slice(1), bytes);
      report.assets.push({ url: entry.publicUrl, source: entry.source, sha256: entry.sha256 });
    }
    async function copyNotices(directory, prefix) {
      for (const e of await fs.readdir(directory, { withFileTypes: true })) {
        const file = path.join(directory, e.name);
        if (e.isDirectory()) await copyNotices(file, `${prefix}/${e.name}`);
        else put(`${prefix}/${e.name}`, await fs.readFile(file));
      }
    }
    await copyNotices(path.join(root, 'docs/content/assets/public/licenses'), 'licenses');
    const paper = await fs.readFile(path.join(root, 'docs/content/assets/public/fonts/paper-mono.css'), 'utf8');
    put('fonts/paper-mono.css', paper.replaceAll('/fonts/', `${base}fonts/`));
    put('source.css', `${paper.replaceAll('/fonts/', `${base}fonts/`)}\n${styles.css}`);
  }
  put('search-index.json', JSON.stringify(search));
  put('llms.txt', `# Base UI for Solid\n\n${identity.name} ${identity.version} (alpha). Requires Solid 2.0.0-rc.13.\nAn independent port of Base UI; upstream React integrations do not establish Solid compatibility.\nSupport and contributions: ${repository}\n\nFull documentation, including examples and API references: ${origin}${localUrl('/llms-full.txt', base)}\n\n${markdown.map(({page}) => `- [${page.title}](${origin}${localUrl(page.route + '.md', base)}): ${page.subtitle ?? page.metadata.description ?? ''}`).join('\n')}\n`);
  put('llms-full.txt', `# Base UI for Solid — full documentation\n\n${identity.name} ${identity.version} (alpha), Solid 2.0.0-rc.13.\nSupport: ${repository}\n\n${markdown.map(({page,content}) => `<!-- ${origin}${localUrl(page.route, base)} -->\n${content}`).join('\n\n')}\n`);
  put('LICENSE.txt', await fs.readFile(path.join(root, 'docs/upstream/base-ui/LICENSE'), 'utf8'));
  if (indexable) put('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(origin + base)}</loc></url>${pages.filter(p => !p.route.startsWith('/upstream/') && p.route !== '/production-error' && p.metadata.robots?.index !== false).map((p) => `<url><loc>${escape(origin + localUrl(p.route, base))}</loc></url>`).join('')}</urlset>`);
  put('robots.txt', indexable ? `User-agent: *\nAllow: /\nDisallow: ${base}upstream/\nSitemap: ${origin}${base}sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  const notFound = { title: 'Page not found', route: '/404', metadata: {}, headings: [], publishable: false };
  put('404.html', shell(notFound, `<h1 class="MdH1">Page not found</h1><p>This documentation route does not exist. Use the navigation or <a href="${escape(localUrl('/solid/overview/quick-start', base))}">quick start</a>.</p>`, { base, nav, identity, origin, indexable }));
  put('index.html', shell({ ...notFound, title: 'Base UI for Solid', route: '/', subtitle: 'Unstyled UI components for Solid 2. An independent alpha port of Base UI.', metadata: { description: 'Unstyled UI components for Solid 2. Install @unstyled-solid/base-ui and build accessible interfaces with composable parts.' } }, `<h1 class="MdH1">Base UI for Solid</h1><p class="MdP">Unstyled, composable UI components for Solid 2. An independent port of Base UI, preserving its component anatomy and accessible interaction patterns.</p><p class="MdP"><strong>Alpha ${escape(identity.version)}.</strong> Requires Solid 2.0.0-rc.13. APIs may change; this is not a Solid 1 package or an official upstream release.</p><p class="MdP"><a href="${escape(localUrl('/solid/overview/quick-start', base))}">Get started</a> · <a href="${escape(localUrl('/solid/components', base))}">Browse components</a> · <a href="${escape(localUrl('/solid/overview/releases', base))}">Release notes</a></p><p class="MdP"><a href="${repository}">GitHub — support, issues, and contributions</a></p>`, { base, nav, identity, origin, indexable }));
  put('report.json', JSON.stringify(report, null, 2) + '\n');
  // A generated file ledger bounds cleanup to files this generator previously owned.
  let previous = []; try { previous = JSON.parse(await fs.readFile(path.join(output, 'files.json'), 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  for (const file of previous) if (!outputs.has(file)) { if (path.resolve(output, file).startsWith(output + path.sep)) await fs.rm(path.join(output, file), { force: true }); }
  for (const [file, contents] of outputs) {
    const destination = path.join(output, file);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    let old; try { old = await fs.readFile(destination); } catch (e) { if (e.code !== 'ENOENT') throw e; }
    const bytes = Buffer.isBuffer(contents) ? contents : Buffer.from(contents);
    if (!old?.equals(bytes)) await fs.writeFile(destination, bytes);
  }
  await fs.writeFile(path.join(output, 'files.json'), JSON.stringify([...outputs.keys()].sort(), null, 2) + '\n');
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const unknown = process.argv.slice(2); if (unknown.length) throw new Error(`Unknown generator arguments: ${unknown.join(' ')}`);
  const report = await generate();
  console.log(`Generated ${report.routes.length} static routes at ${output}; ${report.issues.length} missing demo/API integrations.`);
}
