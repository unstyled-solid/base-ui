import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { adaptPage, ownedPages, sourceSha } from '../../content/handbooks/overlays.mjs';
import { snippets } from '../../content/handbooks/snippets.mjs';
import { adaptSnippet } from '../../content/handbooks/source-snippets.mjs';
import { transformPage } from '../../content/transforms/page.mjs';
import { readPages } from '../../scripts/site/generate.mjs';
import { compile, verifyToolchain } from '../../../scripts/distribution/build/compiler.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
test('all ten pinned pages preserve provenance, headings and immutable section evidence', async () => {
  for (const key of ownedPages) {
    const source = `docs/src/app/(docs)/react/${key}/page.mdx`;
    const value = await fs.readFile(`${root}docs/upstream/base-ui/${source}`, 'utf8');
    const page = await transformPage(value, source, root);
    const before = JSON.stringify(page);
    const adapted = adaptPage(page);
    assert.equal(JSON.stringify(page), before);
    assert.deepEqual(adapted.provenance, page.provenance);
    assert.deepEqual(adapted.sourceHeadings, page.headings);
    assert.deepEqual(adapted.headings.map((h) => h.properties), page.headings.map((h) => h.properties));
    assert.equal(adapted.publishable, false);
    assert.ok(adapted.semanticOverlay.mappings.length);
    assert.equal(adaptPage(adapted), adapted);
    function check(node) {
      if (node.type === 'code') {
        if (node.data?.frameworkContext) {
          assert.equal(node.data.frameworkContext, 'Upstream React integration');
          assert.match(node.value, /motion\.|AnimatePresence|useActionState|react-hook-form|@tanstack\/react|@emotion\/|radix-ui/);
        } else assert.doesNotMatch(node.value, /React\.|@base-ui\/react|className|react-hook-form|@tanstack\/react|render=\{</);
      }
      for (const child of node.children ?? []) check(child);
    }
    check(adapted.ast);
    assert.throws(() => adaptPage({ ...page, provenance: { sourceSha: 'wrong' } }), /requires/);
  }
  const unowned = { source: 'component-owned' };
  assert.equal(adaptPage(unowned), unowned);
});

const nodes = (tree) => [tree, ...(tree.children ?? []).flatMap(nodes)];
test('source inline structure and examples survive across all generated Solid routes', async () => {
  const pages = await readPages();
  assert.equal(pages.length, 84);
  for (const page of pages) {
    const adapted = adaptPage(page);
    if (page.route !== '/solid' && !page.route.startsWith('/solid/')) {
      assert.equal(adapted, page, 'React history remains source history');
      continue;
    }
    const before = nodes(page.ast);
    const after = nodes(adapted.ast);
    for (const type of ['link', 'emphasis', 'strong']) {
      assert.deepEqual(after.filter((n) => n.type === type).map((n) => [n.type, n.url, n.position]),
        before.filter((n) => n.type === type).map((n) => [n.type, n.url, n.position]), `${page.route}: ${type}`);
    }
    if (!page.route.endsWith('/use-render') && !page.route.endsWith('/quick-start')) {
      assert.equal(after.filter((n) => n.type === 'inlineCode').length, before.filter((n) => n.type === 'inlineCode').length, page.route);
    }
    assert.equal(after.filter((n) => n.type === 'code').length,
      before.filter((n) => n.type === 'code').length + (page.route.endsWith('/quick-start') ? 3 : page.route.endsWith('/use-render') ? -1 : 0), page.route);
    assert.equal(adapted.ast.children.length, page.ast.children.length, 'no generic appendix');
    for (const node of after.filter((n) => n.type === 'code')) {
      if (node.data?.frameworkContext) {
        const source = before.find((n) => n.type === 'code' && n.position?.start.offset === node.position?.start.offset);
        assert.equal(node.value, source.data.sourceValue ?? source.value, 'React integration keeps source imports');
      } else assert.doesNotMatch(node.value, /React\.|className|render=\{\s*</, page.route);
    }
  }
});

test('native snippet adaptation retains live render, collections, refs and JSX types', () => {
  const value = adaptSnippet(`import * as React from 'react';
function Button({ render, ...props }: useRender.ComponentProps<'button'>) {
  return useRender({ defaultTagName: 'button', render, props });
}
const [open, setOpen] = React.useState(false);
const actionsRef = React.useRef<Menu.Root.Actions>(null);
<Menu.Root open={open} actionsRef={actionsRef} render={<button />} />;`);
  assert.match(value, /function Button\(props:/);
  assert.match(value, /get render\(\)/);
  assert.match(value, /return props.render/);
  assert.match(value, /open=\{open\(\)\}/);
  assert.match(value, /let actionsRef: Menu.Root.Actions \| null = null/);
  assert.match(value, /actionsRef=\{value =>/);
  assert.match(value, /<button \{\.\.\.renderProps\}/);
  const toast = adaptSnippet(`function Toasts() {
    const { toasts } = Toast.useToastManager();
    return <>{toasts.map((toast) => <Toast.Root key={toast.id} toast={toast} />)}</>;
  }`);
  assert.match(toast, /<For each=\{toastManager.toasts\}/);
  assert.doesNotMatch(toast, /key=|const \{ toasts \}/);
  const filtered = adaptSnippet(`const [query, setQuery] = React.useState('');
    const results = actions.filter((action) => contains(action.label, query));
    <Menu.FilterProvider value={query}>{results}</Menu.FilterProvider>;`);
  assert.match(filtered, /const results = createMemo\(/);
  assert.match(filtered, /contains\(action.label, query\(\)\)/);
  assert.match(filtered, /\{results\(\)\}/);
});

test('accessibility keeps each source section; merged refs have one example', async () => {
  const pages = await readPages();
  const accessibility = pages.find((p) => p.route === '/solid/overview/accessibility');
  const original = nodes(accessibility.ast).filter((n) => n.type === 'paragraph');
  const adapted = nodes(adaptPage(accessibility).ast).filter((n) => n.type === 'paragraph');
  assert.equal(adapted.length, original.length);
  assert.deepEqual(adapted.slice(0, -1), original.slice(0, -1));
  assert.match(adapted.at(-1).children[0].value, /Upstream React Base\u00a0UI is tested/);
  const refs = nodes(adaptPage(pages.find((p) => p.route === '/solid/utils/use-render')).ast).filter((n) => n.type === 'code');
  assert.equal(refs.filter((n) => n.value === snippets.renderRefs).length, 1);
});

test('every complete snippet typechecks against real APIs and compiles with pinned RC13 DOM/server', () => {
  verifyToolchain();
  const options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.Preserve,
    jsxImportSource: '@solidjs/web', strict: true, skipLibCheck: true, noEmit: true,
    baseUrl: root, paths: { 'baseui-solid2/*': ['packages/solid/src/*/index.ts'] } };
  const sources = new Map(Object.entries(snippets).map(([key, value]) => [`${root}docs/tests/handbooks/${key}.virtual.tsx`, value]));
  const host = ts.createCompilerHost(options);
  const read = host.readFile.bind(host);
  const exists = host.fileExists.bind(host);
  host.readFile = (file) => sources.get(file) ?? read(file);
  host.fileExists = (file) => sources.has(file) || exists(file);
  const program = ts.createProgram([...sources.keys()], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).filter((entry) => entry.file && sources.has(entry.file.fileName));
  assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, host));
  for (const [filename, value] of sources) for (const mode of ['dom', 'ssr']) {
    assert.ok(compile(value, filename, mode).code);
  }
});
