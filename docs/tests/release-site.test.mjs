import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { readPages, preparePublicPages, navigation } from '../scripts/site/generate.mjs';
import { renderPage } from '../scripts/site/render.mjs';
import { shell } from '../scripts/site/shell.mjs';
import { publicIdentity, repository, resolveOrigin, allowIndexing } from '../scripts/site/release.mjs';
import { reviewReleasePage } from '../scripts/site/review.mjs';

const sources = await readPages();
const pages = preparePublicPages(sources);
const api = JSON.parse(await fs.readFile(new URL('../generated/api/catalog.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(await fs.readFile(new URL('../generated/demos/catalog.json', import.meta.url), 'utf8'));
const context = { pages, api, demos: catalog.entries, demoReferences: catalog.references };
const find = route => pages.find(page => page.route === route);
const nodes = node => [node, ...(node.children ?? []).flatMap(nodes)];

test('public routes retain captured inputs and separate port releases from upstream history', () => {
  assert.equal(sources.length, 84);
  assert.equal(pages.length, 86);
  assert(find('/solid/overview/releases'));
  assert(find('/solid/overview/releases/v0-0-1'));
  const nav = navigation(pages);
  assert(nav[0].pages.some(page => page.route === '/solid/overview/releases'));
  assert(!nav.flatMap(section => section.pages).some(page => page.route.startsWith('/upstream/')));
  assert(!JSON.stringify(sources).includes('consumer-index'));
  for (const route of ['/solid', '/solid/overview', '/solid/handbook', '/solid/components', '/solid/utils']) {
    const page = find(route);
    const rendered = renderPage(page, context);
    assert.equal(rendered.issues.length, 0);
    assert.doesNotMatch(rendered.html, /Keywords:|Headless React|React Portal Setup/);
    assert(page.links.length > 0);
  }
});

test('all non-historical examples use the public package and native render semantics', () => {
  for (const page of pages.filter(page => page.route.startsWith('/solid/'))) {
    for (const node of nodes(page.ast).filter(node => node.type === 'code' && !node.data?.frameworkContext)) {
      assert.doesNotMatch(node.value, /(?:from\s*|import\s*\(\s*)['"]baseui-solid2(?:\/|['"])/, page.route);
      assert.doesNotMatch(node.value, /React\.|render=\{\s*</, page.route);
    }
  }
  assert.doesNotMatch(renderPage(find('/solid/overview/quick-start'), context).html, /pre-styled Solid components|rtk pnpm|workspace:\*/);
});

test('release shell uses public identity, real source links, social assets and conditional indexing', () => {
  const page = find('/solid/components/button');
  const { html, issues } = renderPage(page, context);
  assert.equal(issues.length, 0);
  assert(html.includes(`${repository}/tree/HEAD/packages/solid/src/button`));
  const options = { base: '/docs/', nav: navigation(pages), identity: publicIdentity, origin: 'https://release.test' };
  const doc = new JSDOM(shell(page, html, options)).window.document;
  assert.equal(doc.querySelector('link[rel=canonical]').href, 'https://release.test/docs/solid/components/button');
  assert.equal(doc.querySelector('meta[name=robots]'), null);
  assert.equal(doc.querySelector('meta[property="og:image"]').content, 'https://release.test/docs/static/apple-touch-icon.png');
  assert(doc.querySelector('link[rel=icon]'));
  assert(doc.querySelector('.SiteFooter').textContent.includes('@unstyled-solid/base-ui 0.0.1'));
  assert(!doc.querySelector('.SiteFooter').textContent.includes('baseui-solid2'));
  const preview = new JSDOM(shell(page, html, { ...options, indexable: false })).window.document;
  assert.match(preview.querySelector('meta[name=robots]').content, /noindex/);
  const historical = pages.find(page => page.route.startsWith('/upstream/'));
  const archive = new JSDOM(shell(historical, '', options)).window.document;
  assert.match(archive.querySelector('meta[name=robots]').content, /noindex/);
});

test('Netlify origins and previews are explicit; no placeholder canonical domains', () => {
  assert.equal(resolveOrigin(''), '');
  assert.equal(resolveOrigin('https://example.netlify.app'), 'https://example.netlify.app');
  for (const value of ['https://docs.example.invalid', 'https://example.test/docs/', 'https://example.test/?x=1', 'https://user:password@example.test']) assert.throws(() => resolveOrigin(value));
  assert.equal(allowIndexing('https://release.test', { CONTEXT: 'production' }), true);
  assert.equal(allowIndexing('https://release.test', { CONTEXT: 'deploy-preview' }), false);
  assert.equal(allowIndexing('https://release.test', { CONTEXT: 'branch-deploy' }), false);
  assert.equal(allowIndexing('https://release.test', { DOCS_NOINDEX: 'true' }), false);
  assert.equal(allowIndexing('', {}), false);
});

test('Solid troubleshooting and missing-content fallbacks have actionable public support', () => {
  const { html } = renderPage(find('/production-error'), context);
  assert.doesNotMatch(html, /upstream React error|Production error #/);
  assert(html.includes(repository));
  const result = renderPage(find('/solid/components/button'), { pages, demos: [], api: null });
  assert(result.issues.length > 0, 'missing integrations must still fail diagnostics');
  assert.doesNotMatch(result.html, /bsolid-docs-|Add a real DemoEntry|Generate Solid declarations|docs\/src\/app/);
  assert(result.html.includes(repository));
});

test('release review fails closed on unresolved integrations and unknown semantic changes', () => {
  const page = find('/solid/components/button');
  const rendered = renderPage(page, context);
  const reviewed = reviewReleasePage(page, { rendered, handlers: ['demo', 'api', 'html', 'subtitle', 'metadata'] });
  assert(reviewed.releaseReview.decisions.length > 0);
  const unknown = { kind: 'future-unsupported-semantics', location: `${page.source}:1:1`, detail: 'must review explicitly' };
  const changed = reviewReleasePage({ ...page, adaptations: [...page.adaptations, unknown] }, { rendered, handlers: [] });
  assert.equal(changed.publishable, false);
  assert(changed.releaseReview.pending.some(value => value.includes('future-unsupported-semantics')));
  const unresolved = reviewReleasePage(page, { rendered: { issues: [{ kind: 'demo', detail: 'unresolved' }] }, handlers: ['demo', 'api'] });
  assert.equal(unresolved.publishable, false);
});
