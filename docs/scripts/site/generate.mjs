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
export function navigation(pages) {
  return ['Overview', 'Handbook', 'Components', 'Utils'].map((title) => {
    const page = pages.find((p) => p.route === `/solid/${title.toLowerCase()}`);
    // Index list links are the upstream information architecture, in source order.
    const routes = [...new Set((page?.links ?? []).map((l) => l.target.split('#')[0]).filter((r) => r.startsWith('/') && r !== page.route))];
    return { title, pages: routes.map((route) => pages.find((p) => p.route === route)).filter(Boolean) };
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
export async function generate({ base = basePath(), origin = process.env.DOCS_ORIGIN ?? 'https://docs.example.invalid' } = {}) {
  base = basePath(base);
  const parsed = new URL(origin); if (!['https:', 'http:'].includes(parsed.protocol) || parsed.pathname !== '/') throw new Error('DOCS_ORIGIN must be an HTTP(S) origin');
  origin = parsed.origin;
  const pages = (await readPages()).map(adaptPage);
  if (pages.length !== 84) throw new Error(`Expected 84 source routes, received ${pages.length}; review content manifest changes`);
  const identity = await json('packages/solid/package.json');
  const catalog = await json('docs/generated/demos/catalog.json', { entries: [] });
  const demos = Array.isArray(catalog) ? catalog : catalog.entries ?? catalog.demos ?? [];
  const api = await json('docs/generated/api/catalog.json', null);
  const nav = navigation(pages);
  const searchOrder = new Map(nav.flatMap(section => section.pages.map(p => ({route:p.route,section:section.title}))).map((p,order)=>[p.route,{order,section:p.section}]));
  const report = { schemaVersion: 1, sourceSha: sha, base, origin, handlers, routes: [], issues: [], styles: [], assets: [], blockers: [] };
  const outputs = new Map();
  const put = (file, value) => outputs.set(file, value);
  const search = [];
  for (const page of pages) {
    if (page.schemaVersion !== 1 || page.provenance.sourceSha !== sha) throw new Error(`${page.source}: unsupported schema or source SHA`);
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
    report.routes.push({ route: page.route, source: page.source, file: routeFile(page.route), publishable: page.publishable, adaptations: page.adaptations.length, overlay: page.semanticOverlay ? { owner: page.semanticOverlay.owner, pending: page.semanticOverlay.pending, reviewedAdaptations: page.semanticOverlay.reviewedAdaptations } : null });
    for (const pending of page.semanticOverlay?.pending ?? []) report.issues.push({ kind: 'semantic-overlay', location: page.source, detail: pending.reason ?? `Pending ${pending.reference ?? pending.section} (${pending.owner})` });
    put(routeFile(page.route), shell(page, rendered.html, { base, nav, identity, origin }));
    put(page.route.slice(1) + '.md', markdownPage(page, {api,demos,demoReferences:catalog.references ?? {}}));
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
    if (!assets.publication.readyForTypographyParity) report.blockers.push(assets.publication.blockerTicket);
  } else report.blockers.push('Missing docs/content/assets/manifest.json');
  put('search-index.json', JSON.stringify(search));
  put('llms.txt', `# Base UI Solid 2 documentation\n\nIntegration preview; upstream ${sha}; Solid 2.0.0-rc.13.\n\n${search.map((p) => `## ${p.title}\n${origin}${p.url}\n\n${p.description}\n\n${p.text}\n`).join('\n')}`);
  put('LICENSE.txt', await fs.readFile(path.join(root, 'docs/upstream/base-ui/LICENSE'), 'utf8'));
  put('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>${escape(origin + localUrl(p.route, base))}</loc></url>`).join('')}</urlset>`);
  const notFound = { title: 'Page not found', route: '/404', metadata: {}, headings: [], publishable: false };
  put('404.html', shell(notFound, `<h1 class="MdH1">Page not found</h1><p>This documentation route does not exist. Use the navigation or <a href="${escape(localUrl('/solid/overview/quick-start', base))}">quick start</a>.</p>`, { base, nav, identity, origin }));
  put('index.html', shell({ ...notFound, title: 'Base UI Solid 2', route: '/' }, `<h1 class="MdH1">Base UI Solid 2</h1><p><a href="${escape(localUrl('/solid/overview/quick-start', base))}">Start reading the documentation</a>.</p>`, { base, nav, identity, origin }));
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
  console.log(`Generated ${report.routes.length} static routes at ${output}; ${report.issues.length} missing demo/API integrations. Publication check: node docs/scripts/site/check.mjs --publish`);
}
