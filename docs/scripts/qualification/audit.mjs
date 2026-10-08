import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { format } from 'prettier';
import { adaptPage } from '../../content/handbooks/overlays.mjs';
import { pageDisposition } from '../../content/transforms/policy.mjs';
import { resolveApi } from '../site/render.mjs';
import { markdownPage } from '../site/markdown.mjs';
import { markdown as apiMarkdown, extract } from '../api/engine.mjs';
import { generateCatalog } from '../demos/catalog.mjs';
import { hash, read, json, walk, unique, sameKeys, sourceSha, safe } from './io.mjs';
import { checkExecution } from './execution.mjs';
export { requiredChecks } from './execution.mjs';

export const root = fileURLToPath(new URL('../../../', import.meta.url)).replace(/\/$/, '');

export async function formattedPage(page) {
  async function visit(node) {
    if (node.type === 'code' && /^(tsx?|jsx?|css|json)$/.test(node.lang ?? '')) {
      try { node.value = (await format(node.value,{parser:node.lang === 'css' ? 'css' : node.lang === 'json' ? 'json' : 'babel-ts',singleQuote:true,printWidth:85,tabWidth:2})).trimEnd(); }
      catch { /* Match the existing generator's literal partial-fragment policy. */ }
    }
    for (const child of node.children ?? []) await visit(child);
  }
  await visit(page.ast); return page;
}

// Shared by the auditor and execution recorder. Includes actual artifacts AND
// live implementation inputs; editing a demo/library file invalidates replay.
export async function binding(repository, { site = 'docs/generated/site', artifact = `${site}/dist` } = {}) {
  const files = new Set(['package.json','pnpm-lock.yaml','docs/package.json','docs/vite.config.ts','docs/tsconfig.json','docs/tsconfig.demos.json','docs/upstream-manifest.json', 'distribution/exports.json', 'packages/solid/package.json', 'docs/generated/api/catalog.json', 'docs/generated/api/report.json', 'docs/generated/demos/catalog.json', `${site}/report.json`]);
  for (const directory of ['docs/upstream/generated/pages', 'docs/generated/api', 'packages/solid/src', 'docs/demos', 'docs/site', 'docs/content', 'docs/scripts/site', 'docs/scripts/api', 'docs/scripts/demos', 'docs/scripts/qualification', 'docs/tests', 'docs/patches', site, artifact]) {
    for (const file of await walk(repository, directory)) {
      if (directory === site && file.startsWith(`${site}/dist/`)) continue;
      if (file.startsWith('docs/tests/qualification/evidence/')) continue;
      files.add(file);
    }
  }
  const inputs = [];
  for (const file of [...files].sort()) inputs.push({ file, sha256: hash(await read(repository, file)) });
  return { sha256: hash(JSON.stringify(inputs)), inputs };
}

export async function markdownInventory(repository, { site = 'docs/generated/site' } = {}) {
  const manifest = await json(repository, 'docs/upstream-manifest.json');
  const api = await json(repository, 'docs/generated/api/catalog.json');
  const demos = await json(repository, 'docs/generated/demos/catalog.json');
  for (const [name, data] of [['manifest',manifest],['API',api],['demos',demos]]) if (data.schemaVersion !== 1 || data.sourceSha !== sourceSha) throw new Error(`${name}: unsupported schema/pin`);
  unique(manifest.pages, 'route', 'pages'); unique(api.modules, 'entrypoint', 'API');
  const files = [];
  for (const record of manifest.pages) {
    const raw = await read(repository,record.destination);
    if (hash(raw) !== record.sha256) throw new Error(`Imported page hash mismatch: ${record.destination}`);
    const page = await formattedPage(adaptPage(JSON.parse(raw)));
    if (page.route !== record.route || page.source !== record.source || page.provenance?.sourceSha !== sourceSha) throw new Error(`Page provenance mismatch: ${record.destination}`);
    const destination = `${page.route.slice(1)}.md`;
    safe(repository, destination);
    const source = `${site}/${destination}`;
    const bytes = await read(repository, source);
    if (!bytes.length || bytes.toString('utf8') !== markdownPage(page, { api, demos: demos.entries, demoReferences: demos.references })) throw new Error(`Stale/empty page Markdown: ${source}`);
    files.push({ source, destination, sha256: hash(bytes), bytes: bytes.length, route: page.route });
  }
  for (const module of api.modules) {
    const source = `docs/generated/api/${module.markdown}`;
    const bytes = await read(repository, source);
    if (bytes.toString('utf8') !== apiMarkdown(module)) throw new Error(`Stale API Markdown: ${source}`);
    files.push({ source, destination: `api/${module.markdown}`, sha256: hash(bytes), bytes: bytes.length, entrypoint: module.entrypoint });
  }
  unique(files, 'destination', 'Markdown');
  return files.sort((a,b) => a.destination.localeCompare(b.destination));
}

export async function audit({ repository = root, site = 'docs/generated/site', artifact = `${site}/dist`, evidence = 'docs/tests/qualification/evidence/execution.json' } = {}) {
  const failures = [], counts = {};
  const attempt = async (label, fn) => { try { return await fn(); } catch (error) { failures.push(`${label}: ${error.message}`); return null; } };
  const manifest = await attempt('manifest', () => json(repository, 'docs/upstream-manifest.json'));
  const catalog = await attempt('demos', () => json(repository, 'docs/generated/demos/catalog.json'));
  const api = await attempt('API', () => json(repository, 'docs/generated/api/catalog.json'));
  const report = await attempt('site report', () => json(repository, `${site}/report.json`));
  const contract = await attempt('exports', () => json(repository, 'distribution/exports.json'));
  const identity = await attempt('package identity', () => json(repository,'packages/solid/package.json'));
  if (!manifest || !catalog || !api || !report || !contract || !identity) return { schemaVersion: 1, sourceSha, complete: false, counts, failures };
  for (const [name, data] of [['manifest',manifest],['demos',catalog],['API',api],['site',report]]) if (data.sourceSha !== sourceSha || data.schemaVersion !== 1) failures.push(`${name}: unsupported schema/pin`);
  const pages = await attempt('pages', async () => unique(manifest.pages, 'route', 'pages'));
  const routes = await attempt('routes', async () => unique(report.routes, 'route', 'routes'));
  const modules = await attempt('modules', async () => unique(api.modules, 'entrypoint', 'API modules'));
  if (!pages || !routes || !modules) return { schemaVersion: 1, sourceSha, complete: false, counts, failures };
  sameKeys(pages, routes, 'routes', failures);
  sameKeys(new Map(Object.keys(contract.exports).map(key => [key,true])), modules, 'API entrypoints', failures);
  counts.pages = pages.size; counts.apiModules = modules.size;
  await attempt('built MIT notice',async () => {
    if (!(await read(repository,`${artifact}/LICENSE.txt`)).equals(await read(repository,'upstream/base-ui/LICENSE'))) failures.push('Built docs MIT notice differs from the pinned original license');
  });
  // Independently enumerate canonical public pages, so truncating both reports
  // cannot turn a preview into a complete site.
  await attempt('canonical pages', async () => {
    const canonical = (await walk(repository, 'upstream/base-ui/docs/src/app/(docs)')).filter(file => file.endsWith('/page.mdx')).map(file => file.slice('upstream/base-ui/'.length));
    sameKeys(new Map(canonical.map(file => [file,true])), unique(manifest.pages, 'source', 'page sources'), 'canonical pages', failures);
  });
  for (const field of ['issues','blockers']) {
    if (!Array.isArray(report[field])) failures.push(`site: missing ${field}`);
    else for (const item of report[field]) failures.push(`site ${field}: ${JSON.stringify(item)}`);
  }
  const apiReport = await attempt('API report', () => json(repository, 'docs/generated/api/report.json'));
  for (const field of ['missingMetadata','missingDocumentation']) {
    if (!Array.isArray(apiReport?.[field])) failures.push(`API: missing ${field}`);
    else for (const item of apiReport[field]) failures.push(`API ${field}: ${JSON.stringify(item)}`);
  }
  for (const input of api.inputs ?? []) await attempt(`API input ${input.file}`, async () => {
    if (hash(await read(repository,input.file)) !== input.sha256) failures.push(`Stale API input: ${input.file}`);
  });
  if (!api.inputs?.length) failures.push('API has no declaration/source input evidence');
  await attempt('complete declaration graph',async () => {
    const entries = Object.entries(contract.exports).map(([entrypoint,entry]) => ({entrypoint,file:safe(repository,`packages/solid/build/types/${entry.target.slice(6).replace(/\.tsx?$/,'.d.ts')}`)}));
    const current = await extract({root:repository,entries});
    if (JSON.stringify(current)!==JSON.stringify(api)) failures.push('API catalog differs from the complete current declaration/JSDoc graph');
  });
  const documents = new Map();
  for (const [route, record] of pages) await attempt(route, async () => {
    const raw = await read(repository, record.destination);
    if (hash(raw) !== record.sha256) failures.push(`${route}: imported page hash mismatch`);
    const page = adaptPage(JSON.parse(raw));
    if (page.route !== route || page.source !== record.source || page.provenance.sourceSha !== sourceSha) failures.push(`${route}: page provenance mismatch`);
    const source = await read(repository, `upstream/base-ui/${record.source}`);
    if (hash(source) !== page.provenance.sourceSha256) failures.push(`${route}: canonical source hash mismatch`);
    const entry = routes.get(route);
    const expectedFile = `${route.slice(1)}/index.html`;
    if (entry?.file !== expectedFile || entry?.source !== record.source) failures.push(`${route}: route output/source mismatch`);
    const disposition=pageDisposition(record.source);
    const referenceOnly=['upstream-react-history','upstream-reference-only'].includes(disposition) && record.disposition===disposition && page.disposition===disposition;
    if ((!referenceOnly && (entry?.publishable !== true || page.publishable !== true)) || page.semanticOverlay?.pending?.length) failures.push(`${route}: unreviewed semantic/publication disposition`);
    const bytes = await read(repository, `${artifact}/${expectedFile}`);
    const dom = new JSDOM(bytes.toString('utf8'));
    const doc = dom.window.document;
    const footer=doc.querySelector('.SiteFooter');
    if (!footer?.textContent.includes(`${identity.name} ${identity.version}`) || !footer.textContent.includes('Solid 2.0.0-rc.13') || ![...footer.querySelectorAll('a[href]')].some(link=>link.href===`https://github.com/mui/base-ui/tree/${sourceSha}`)) failures.push(`${route}: version/package/runtime/source footer mismatch`);
    if (referenceOnly && !/upstream React/i.test(doc.body.textContent)) failures.push(`${route}: reference-only disposition lacks actual upstream React context notice`);
    const ids = new Set();
    for (const node of doc.querySelectorAll('[id]')) { if (ids.has(node.id)) failures.push(`${route}: duplicate anchor ${node.id}`); ids.add(node.id); }
    for (const heading of page.headings) if (!ids.has(heading.properties.id)) failures.push(`${route}: missing heading ${heading.properties.id}`);
    if (!doc.querySelector('main h1') || !doc.querySelector('head title') || !doc.querySelector('link[rel=canonical]')) failures.push(`${route}: incomplete static document`);
    if (doc.querySelector('[data-missing], [data-api-status]:not([data-api-status="generated"])')) failures.push(`${route}: placeholder integration`);
    for (const node of page.sourceNodes ?? page.nodes ?? []) {
      if (node.handler === 'demo') {
        const id = catalog.references?.[node.reference];
        if (id && ![...doc.querySelectorAll('[data-demo-id]')].some(host => host.dataset.demoId === id)) failures.push(`${route}: missing actual demo host ${id}`);
        if (!id && !catalog.exclusions?.some(e => e.reference === node.reference)) failures.push(`${route}: unresolved demo ${node.reference}`);
      }
      if (node.handler === 'api') {
        const resolved = resolveApi(api, node, page, node.attributes);
        if (!resolved || !ids.has(resolved.anchor)) failures.push(`${route}: missing rendered API ${node.name}`);
        for (const row of [...resolved?.props ?? [], ...resolved?.dataAttributes ?? [], ...resolved?.cssVariables ?? []]) if (row.anchor && !ids.has(row.anchor)) failures.push(`${route}: missing API row ${node.name}.${row.name}`);
      }
    }
    const familyModule = modules.get(`./${route.split('/').at(-1)}`);
    if (/^\/solid\/(components|utils)\/[^/]+$/.test(route) && familyModule) {
      for (const exported of familyModule.exports.filter(entry => ['component','helper'].includes(entry.kind))) if (!ids.has(exported.anchor)) failures.push(`${route}: public part/helper has no rendered reference ${exported.name}`);
    }
    documents.set(route, { doc, dom });
  });
  // Every local destination and anchor in every actual HTML page is inspected.
  for (const [route, {doc}] of documents) for (const node of doc.querySelectorAll('a[href],link[href],img[src],script[src]')) await attempt(`link ${route}`, async () => {
    const value = node.getAttribute('href') ?? node.getAttribute('src');
    const url = new URL(value, `https://qualification.invalid${report.base}${route.slice(1)}`);
    if (url.origin !== 'https://qualification.invalid') return;
    if (!url.pathname.startsWith(report.base)) throw new Error(`Link escapes deployment base: ${value}`);
    const local = '/' + url.pathname.slice(report.base.length).replace(/\/$/, '');
    const target = documents.get(local)?.doc;
    if (target) { if (url.hash && !target.getElementById(decodeURIComponent(url.hash.slice(1)))) throw new Error(`Missing anchor ${value}`); }
    else await read(repository, `${artifact}/${local === '/' ? 'index.html' : local.slice(1)}`);
  });
  for (const {dom} of documents.values()) dom.window.close();
  let variants = [];
  await attempt('full demo inventory', async () => {
    const current = await generateCatalog(repository);
    if (JSON.stringify(current) !== JSON.stringify(catalog)) failures.push('Demo catalog differs from live source/import/file graph; regenerate using supported generator');
    if (!Array.isArray(catalog.missing) || catalog.missing.length) failures.push(`Missing demo translations: ${JSON.stringify(catalog.missing)}`);
    unique(catalog.entries,'id','demo entries');
    for (const entry of catalog.entries) {
      unique(entry.variants,'id',`${entry.id} variants`);
      variants.push(...entry.variants.map(variant => `${entry.id}/${variant.id}`));
    }
    // Inventory every source factory, including demos not referenced on a page.
    const { upstreamSymbols } = await import('../demos/catalog.mjs');
    const canonical = await walk(repository, 'upstream/base-ui/docs/src/app/(docs)');
    for (const file of canonical.filter(file => file.includes('/demos/') && /\.[jt]sx?$/.test(file))) {
      for (const symbol of upstreamSymbols((await read(repository,file)).toString('utf8'),file)) {
        const source = file.slice('upstream/base-ui/'.length);
        const reference = `demo:${source}#${symbol}`;
        if (!catalog.references[reference] && !catalog.exclusions.some(e => e.reference === reference || e.reference === reference.replace(/\/index\.[jt]sx?#/, '#'))) failures.push(`Unmapped canonical demo factory: ${reference}`);
      }
    }
  });
  counts.demoVariants = variants.length;
  const markdown = await attempt('Markdown inventory', () => markdownInventory(repository, {site}));
  counts.markdown = markdown?.length ?? 0;
  // Full API reference, including internal contracts, remains discoverable even
  // when no product page is warranted. No invented internal product routes.
  for (const module of api.modules) await attempt(`API ${module.entrypoint}`, async () => {
    unique(module.exports, 'name', `${module.entrypoint} exports`);
    const md = (await read(repository, `docs/generated/api/${module.markdown}`)).toString('utf8');
    for (const entry of module.exports) for (const row of [entry, ...entry.props ?? [], ...entry.properties ?? [], ...entry.dataAttributes ?? [], ...entry.cssVariables ?? [], ...entry.returnValue?.properties ?? []]) if (row.anchor && !md.includes(`id="${row.anchor}"`)) failures.push(`API reference omits ${module.entrypoint}:${entry.name}:${row.name}`);
  });
  const bound = await attempt('artifact/source binding', () => binding(repository,{site,artifact}));
  await attempt('execution evidence', async () => {
    failures.push(...await checkExecution(repository,evidence,bound?.sha256,variants,[...pages.keys()]));
  });
  return { schemaVersion: 1, sourceSha, complete: failures.length === 0, bindingSha256: bound?.sha256 ?? null, counts, failures: [...new Set(failures)] };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), options = {};
    const summary = args.includes('--summary');
    while (args.length) { const flag = args.shift(); if (flag === '--summary') continue; if (!['--site','--artifact','--evidence'].includes(flag) || !args.length) throw new Error('Usage: audit.mjs [--summary] [--site relative-dir] [--artifact relative-dir] [--evidence relative-json]'); options[flag.slice(2)] = args.shift(); }
    const result = await audit(options);
    const groups={};for (const failure of result.failures) { const kind=failure.startsWith('/')?'route-output':failure.split(':')[0];groups[kind]=(groups[kind]??0)+1; }
    console.log(JSON.stringify(summary ? {...result,failures:result.failures.slice(0,20),failureKinds:groups,failureCount:result.failures.length} : result,null,2)); if (!result.complete) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
