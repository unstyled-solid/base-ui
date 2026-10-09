import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
import { JSDOM } from 'jsdom';

const islands = readFileSync(new URL('../site/islands.tsx', import.meta.url), 'utf8');
const runtime = readFileSync(new URL('../demos/shared/runtime.tsx', import.meta.url), 'utf8');
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.React } }).outputText;
const settle = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };

test('repository links follow the selected Solid catalog file and styling variant', async () => {
  const dom = new JSDOM('<div id="host"></div>', { url: 'https://example.test' });
  const source = runtime.replace(/^import .*;\n/gm, '').replace(/if \(import\.meta\.hot\)/, 'if (false)').replace('import.meta.hot.dispose', '({ dispose() {} }).dispose').replace('export function mountDemo', 'function mountDemo');
  const errors = [];
  const mountDemo = new Function('render', 'highlightSource', 'console', `${transpile(source).replace('export {};', '')}; return mountDemo;`)(() => () => {}, (code, raw) => { code.textContent = raw; }, { error: (...args) => errors.push(args) });
  const host = dom.window.document.getElementById('host');
  const files = ['docs/demos/accordion/hero/css-modules/index.tsx', 'docs/demos/accordion/_index.module.css'];
  const dispose = mountDemo(host, 'accordion/hero', {
    loadDemo: async () => ({ variants: [{ id: 'css-modules', label: 'CSS Modules', component() {}, files }, { id: 'tailwind', label: 'Tailwind', component() {}, files: ['docs/demos/accordion/hero/tailwind/index.tsx'] }] }),
    loadSource: async () => 'example source',
  });
  await settle();
  const link = host.querySelector('.DemoSourceLink');
  const prefix = 'https://github.com/unstyled-solid/base-ui/blob/241d7cba64c63356e77128068a1f223352403c2a/';
  assert.equal(link.href, prefix + files[0]);
  assert.match(link.textContent, /repository source/);
  assert.equal(link.title, 'Repository source uses workspace imports');
  const pre = host.querySelector('.DemoCode');
  const copy = host.querySelector('.DemoCopyButton');
  const label = host.ownerDocument.getElementById(pre.getAttribute('aria-describedby'));
  assert.equal(label.textContent, 'Public package imports');
  assert.equal(label.hidden, false);
  assert.equal(copy.getAttribute('aria-describedby'), label.id);
  assert.match(label.title, /Displayed and copied TypeScript uses public npm package imports/);
  host.querySelectorAll('[role="tab"]')[1].click();
  await settle();
  assert.equal(link.href, prefix + files[1]);
  assert.equal(label.hidden, true);
  assert.equal(pre.hasAttribute('aria-describedby'), false);
  assert.equal(copy.hasAttribute('aria-describedby'), false);
  const select = host.querySelector('select');
  select.value = 'tailwind';
  select.dispatchEvent(new dom.window.Event('change'));
  await settle();
  assert.equal(link.href, prefix + 'docs/demos/accordion/hero/tailwind/index.tsx');
  assert.equal(label.hidden, false);
  assert.equal(copy.getAttribute('aria-describedby'), label.id);
  dispose();
  const failure = new Error('internal task name and stack details');
  const disposeFailure = mountDemo(host, 'fixture/failure', { loadDemo: async () => { throw failure; } });
  await settle();
  assert.equal(host.querySelector('[role="alert"] a').href, 'https://github.com/unstyled-solid/base-ui');
  assert.doesNotMatch(host.textContent, /internal task name|stack details/);
  assert.equal(errors.at(-1)[1], failure);
  disposeFailure();
  dom.window.close();
});

test('page code copy shows a check and live status, resets, and cancels on page disposal', async () => {
  const dom = new JSDOM('<figure><pre><code>const example = 1;</code></pre><button class="CodeCopy" title="Copy code" aria-label="Copy code"><svg data-original="true"></svg></button></figure>');
  const { window } = dom;
  const timers = new Map();
  let next = 0;
  window.setTimeout = (callback) => { timers.set(++next, callback); return next; };
  window.clearTimeout = (id) => timers.delete(id);
  let copied;
  Object.defineProperty(window.navigator, 'clipboard', { value: { writeText: async (text) => { copied = text; } } });
  const section = islands.slice(islands.indexOf('const codeCopyDisposals'), islands.indexOf('// Vite virtual module'));
  const dispose = new Function('document', 'window', 'navigator', `${transpile(section)}; return () => codeCopyDisposals.splice(0).forEach(dispose => dispose());`)(window.document, window, window.navigator);
  const button = window.document.querySelector('button');
  button.click();
  await settle();
  assert.equal(copied, 'const example = 1;');
  assert.equal(button.getAttribute('aria-label'), 'Code copied');
  assert.equal(button.querySelector('path').getAttribute('d'), 'm2.5 8.5 4 4 7-9');
  assert.equal(window.document.querySelector('[aria-live="polite"]').textContent, 'Code copied.');
  [...timers.values()][0]();
  assert.equal(button.title, 'Copy code');
  assert.ok(button.querySelector('[data-original]'));
  button.click();
  await settle();
  dispose();
  assert.equal(timers.size, 0);
  assert.equal(window.document.querySelector('[role="status"]'), null);
  dom.window.close();
});

test('search guards active descendant and advertises the platform shortcut; failures retain diagnostics', () => {
  assert.match(islands, /aria-activedescendant=\{results\(\)\[selected\(\)\] \?/);
  assert.match(islands, /aria-keyshortcuts=\{apple \? 'Meta\+K' : 'Control\+K'\}/);
  assert.match(islands, /apple \? '⌘K' : 'Ctrl\+K'/);
  assert.doesNotMatch(islands, /bsolid-docs-demos/);
  assert.doesNotMatch(runtime, /https:\/\/github\.com\/mui\/base-ui/);
  for (const source of [runtime, islands]) {
    assert.match(source, /console\.error\(/);
    assert.match(source, /https:\/\/github\.com\/unstyled-solid\/base-ui/);
  }
});
