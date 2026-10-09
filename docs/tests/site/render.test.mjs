import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readPages, navigation, shell } from '../../scripts/site/generate.mjs';
import { renderPage, highlight } from '../../scripts/site/render.mjs';
import { basePath, localUrl, routeFile } from '../../scripts/site/paths.mjs';
import { adaptPage } from '../../content/handbooks/overlays.mjs';
const pages = await readPages();
const button = pages.find((p) => p.route === '/solid/components/button');

test('all 84 source ASTs and handbook overlays render readable static HTML without source module evaluation', () => {
  assert.equal(pages.length, 84);
  for (const source of pages) {
    const page = adaptPage(source);
    const rendered = renderPage(page, { pages });
    const doc = new JSDOM(rendered.html).window.document;
    assert.ok(doc.querySelector('h1'), page.source);
    assert.ok(doc.body.textContent.includes(page.title), page.source);
    assert.equal(doc.querySelector('script'), null);
  }
});
test('strict handler fails an injected MDX expression and unknown component at exact location', () => {
  for (const node of [{ type: 'mdxFlowExpression', value: 'process.exit()' }, { type: 'mdxJsxFlowElement', name: 'Unknown', data: { handler: 'html' } }, { type: 'html', value: '<script>bad()</script>' }]) {
    const page = structuredClone(button);
    page.ast.children.push({ ...node, position: { start: { line: 999, column: 4 } } });
    assert.throws(() => renderPage(page), /page\.mdx:999:4:.*bounded docs-site handler/);
  }
});
test('missing integrations are actionable; real catalog data renders API and demo descriptors', () => {
  const missing = renderPage(button);
  assert.equal(missing.issues.filter((i) => i.kind === 'demo').length, 2);
  assert.equal(missing.issues.filter((i) => i.kind === 'api').length, 1);
  const demo = button.nodes.find((n) => n.handler === 'demo');
  const api = button.nodes.find((n) => n.handler === 'api');
  const real = renderPage(button, { demoReferences: { [demo.reference]: 'button/hero' }, demos: [{ id: 'button/hero', upstream: 'source', variants: [{ id: 'css', label: 'CSS Modules', files: [] }] }], api: { entries: [{ reference: api.reference, part: '', props: [{ name: 'disabled', type: 'boolean', description: '<unsafe>', default: 'false' }] }] } });
  assert.match(real.html, /data-demo-id="button\/hero"/);
  assert.match(real.html, /data-api-status="generated"/);
  assert.match(real.html, /&lt;unsafe&gt;/);
});
test('base paths, navigation and canonical metadata retain source order and source heading IDs', () => {
  assert.equal(localUrl('/solid/components/button#anatomy', '/preview/'), '/preview/solid/components/button#anatomy');
  assert.throws(() => basePath('/../'), /DOCS_BASE/);
  assert.throws(() => routeFile('/../../x'), /Unsafe route/);
  assert.throws(() => localUrl('javascript:alert(1)'), /Unsafe URL/);
  const html = shell(button, renderPage(button).html, { base: '/preview/', nav: navigation(pages), identity: { name: 'baseui-solid2', version: '0.0.0' }, origin: 'https://docs.example.test' });
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelector('link[rel=canonical]').href, 'https://docs.example.test/preview/solid/components/button');
  assert.equal(doc.querySelector('a[aria-current=page]').getAttribute('href'), '/preview/solid/components/button');
  assert.ok(doc.getElementById('anatomy'));
  assert.equal(doc.querySelector('meta[name=robots]'), null, 'release origin makes primary docs indexable');
  const preview = new JSDOM(shell(button, '', { base: '/preview/', nav: navigation(pages), identity: { name: '@unstyled-solid/base-ui', version: '0.0.1' }, origin: 'https://docs.example.test', indexable: false })).window.document;
  assert.equal(preview.querySelector('meta[name=robots]').content, 'noindex, follow');
});
test('compiler-token highlighting preserves source bytes as text and escapes executable HTML', () => {
  const raw = 'const s = "<script>alert(1)</script>"; // comment\n';
  const html = highlight(raw, 'ts');
  const doc = new JSDOM(`<pre>${html}</pre>`).window.document;
  assert.equal(doc.querySelector('pre').textContent, raw);
  assert.equal(doc.querySelector('script'), null);
  assert.match(html, /SiteToken-keyword/);
});
