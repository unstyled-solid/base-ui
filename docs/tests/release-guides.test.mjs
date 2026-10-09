import test from 'node:test';
import assert from 'node:assert/strict';
import { readPages } from '../scripts/site/generate.mjs';
import { adaptPage } from '../content/handbooks/overlays.mjs';
import { adaptSnippet, stripPresentationAnnotations } from '../content/handbooks/source-snippets.mjs';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { compile, verifyToolchain } from '../../scripts/distribution/build/compiler.mjs';
import fs from 'node:fs/promises';

const walk = (node) => [node, ...(node.children ?? []).flatMap(walk)];
const text = (node) => node.value ?? (node.children ?? []).map(text).join('');

test('real Form submission prose, composition subtitle, and Radix comparison teach native contracts', async () => {
  const pages = await readPages();
  for (const route of ['/solid/components/form', '/solid/handbook/composition', '/solid/utils/use-render']) {
    const source = pages.find((page) => page.route === route);
    const snapshot = JSON.stringify(source);
    const page = adaptPage(source);
    const nodes = walk(page.ast);
    assert.equal(JSON.stringify(source), snapshot);
    assert.deepEqual(page.provenance, source.provenance);
    assert.deepEqual(page.sourceHeadings, source.headings);
    assert.deepEqual(page.headings.map((h) => h.properties.id), source.headings.map((h) => h.properties.id));
    assert.doesNotMatch(nodes.filter((n) => n.type === 'paragraph' || n.data?.handler === 'subtitle').map(text).join('\n'),
      /useActionState|your own React components|equivalent implementation to the Radix example above/);
    assert.ok(!nodes.some((n) => n.type === 'link' && /react.dev/.test(n.url)));
    if (route.endsWith('/form')) {
      assert.ok(page.headings.some((h) => h.text === 'Submit with server-side validation' && h.properties.id === 'submit-with-a-server-function'));
      const prose = nodes.filter((n) => n.type === 'paragraph').map(text).join('\n');
      assert.match(prose, /new FormData\(event.currentTarget\)/);
      assert.match(prose, /simulates an asynchronous server response/);
      assert.match(prose, /errors prop/);
      assert.match(prose, /form.reset\(\)/);
      assert.deepEqual(nodes.filter((n) => n.data?.handler === 'demo').map((n) => n.data.reference),
        walk(source.ast).filter((n) => n.data?.handler === 'demo').map((n) => n.data.reference));
      for (const variant of ['css-modules', 'tailwind']) {
        const demo = await fs.readFile(new URL(`../demos/form/form-action/${variant}/index.tsx`, import.meta.url), 'utf8');
        assert.match(demo, /onSubmit=\{async \(event\)/);
        assert.match(demo, /new FormData\(form\)/);
        assert.match(demo, /errors=\{state\(\).serverErrors\}/);
        assert.match(demo, /form.reset\(\)/);
      }
    }
    if (route.endsWith('/composition')) {
      assert.equal(page.subtitle, 'A guide to composing Base\u00a0UI components with your own Solid components.');
      assert.equal(text(nodes.find((n) => n.data?.handler === 'subtitle')), page.subtitle);
    }
    if (route.endsWith('/use-render')) {
      assert.match(nodes.filter((n) => n.type === 'paragraph').map(text).join('\n'), /useRender implements a live render callback/);
      assert.ok(nodes.some((n) => n.type === 'code' && /useRender\(/.test(n.value)));
    }
  }
});
test('release guides exclude framework-only recipes without mutating captured pages', async () => {
  const pages = await readPages();
  for (const topic of ['forms', 'animation', 'styling', 'avatar', 'navigation-menu', 'tabs', 'autocomplete', 'combobox']) {
    const page = pages.find((p) => p.route.startsWith('/solid/') && p.route.endsWith(`/${topic}`));
    const before = JSON.stringify(page);
    const result = adaptPage(page);
    assert.equal(JSON.stringify(page), before);
    assert.deepEqual(result.sourceHeadings, page.headings);
    const nodes = walk(result.ast);
    const code = nodes.filter((n) => n.type === 'code').map((n) => n.value).join('\n');
    assert.doesNotMatch(code, /motion\/react|AnimatePresence|react-hook-form|@tanstack\/react-form|useActionState|next\/(image|link)|@emotion\/|React\.memo|@highlight|baseui-solid2/);
    assert.deepEqual(result.headings.map((h) => h.text), nodes.filter((n) => n.type === 'heading').map((n) => n.children.map((c) => c.value).join('')));
    for (const h of result.headings) assert.ok(page.headings.some((source) => source.properties.id === h.properties.id));
    if (['forms', 'animation'].includes(topic)) assert.ok(result.semanticOverlay.mappings.some((m) => m.disposition === 'framework-only-exclusion'));
    if (topic === 'forms') {
      assert.ok(result.headings.some((h) => h.text === 'Server-side validation'));
      assert.ok(!result.headings.some((h) => /React Hook Form|TanStack Form/.test(h.text)));
    }
    if (topic === 'animation') assert.ok(result.headings.some((h) => h.text === 'Manual unmounting'));
    if (topic === 'avatar') assert.match(code, /keepMounted[\s\S]*render=\{\(props\) => <img \{\.\.\.props\} loading="lazy"/);
    if (['navigation-menu', 'tabs'].includes(topic)) assert.match(code, /render=\{renderProps => <a \{\.\.\.renderProps\}/);
  }
});

test('imports are AST adapted and presentation directives do not erase useful comments', () => {
  const code = adaptSnippet(`import { Tabs } from '@base-ui/react/tabs';\n// license retained\nconst name = '@base-ui/react';\n<Tabs.Tab render={<a href="/" />} />;`);
  assert.match(code, /from "@unstyled-solid\/base-ui\/tabs"/);
  assert.match(code, /license retained/);
  assert.match(code, /const name = '@base-ui\/react'/);
  assert.equal(stripPresentationAnnotations('/* license */\n/* @highlight-start */\na {}\n/* @highlight-end */'), '/* license */\n\na {}\n');
});

test('replacement image and anchor examples typecheck and compile against pinned Solid APIs', async () => {
  verifyToolchain();
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const sources = new Map();
  for (const page of await readPages()) {
    if (!['/solid/components/avatar', '/solid/components/navigation-menu', '/solid/components/tabs'].includes(page.route)) continue;
    for (const node of walk(adaptPage(page).ast)) {
      if (node.type === 'code' && /title="(?:Lazy-loaded image|Native anchor links)"/.test(node.meta ?? '')) {
        sources.set(`${root}docs/tests/${page.route.split('/').at(-1)}.virtual.tsx`, node.value);
      }
    }
  }
  assert.equal(sources.size, 3);
  const options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.Preserve,
    jsxImportSource: '@solidjs/web', strict: true, skipLibCheck: true, noEmit: true,
    baseUrl: root, paths: { '@unstyled-solid/base-ui/*': ['packages/solid/src/*/index.ts'] } };
  const host = ts.createCompilerHost(options);
  const read = host.readFile.bind(host);
  const exists = host.fileExists.bind(host);
  host.readFile = (file) => sources.get(file) ?? read(file);
  host.fileExists = (file) => sources.has(file) || exists(file);
  const program = ts.createProgram([...sources.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((d) => d.file && sources.has(d.file.fileName));
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
  for (const [file, value] of sources) for (const mode of ['dom', 'ssr']) assert.ok(compile(value, file, mode).code);
});
