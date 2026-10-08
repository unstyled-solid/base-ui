import fs from 'node:fs/promises';
import path from 'node:path';
import postcss from 'postcss';
import { createHash } from 'node:crypto';
import { root } from './paths.mjs';

// Bounded PostCSS adaptation of pinned CSS, preserving layers, tokens and selectors.
// Fonts with unresolved redistribution provenance are deliberately not emitted.
export async function sourceStyles() {
  const snapshot = path.join(root, 'docs/upstream/base-ui');
  const media = new Map();
  const sources = new Map();
  async function expand(file, stack = []) {
    if (stack.includes(file)) throw new Error(`CSS import cycle: ${file}`);
    let contents;
    try { contents = await fs.readFile(file, 'utf8'); }
    catch (e) {
      if (e.code !== 'ENOENT') throw e;
      // Shell styles excluded from content capture are read from the pinned,
      // read-only checkout. Their hashes remain in the site provenance report.
      file = path.join(root, 'upstream/base-ui', path.relative(snapshot, file));
      contents = await fs.readFile(file, 'utf8');
    }
    const tree = postcss.parse(contents, { from: file });
    sources.set(path.relative(root, file), createHash('sha256').update(contents).digest('hex'));
    const imports = []; tree.walkAtRules('import', (n) => imports.push(n));
    for (const node of imports) {
      const ref = node.params.match(/^['"]([^'"]+)['"]/)?.[1];
      if (!ref) throw new Error(`Unsupported CSS import ${node.params}`);
      if (ref.startsWith('tailwindcss/') || ref.includes('fonts/')) { node.remove(); continue; }
      const logicalFile = file.startsWith(path.join(root, 'upstream/base-ui')) ? path.join(snapshot, path.relative(path.join(root, 'upstream/base-ui'), file)) : file;
      const target = ref.startsWith('docs/') ? path.join(snapshot, ref) : path.resolve(path.dirname(logicalFile), ref);
      if (!target.startsWith(snapshot + path.sep)) throw new Error(`CSS import escapes snapshot: ${ref}`);
      node.replaceWith((await expand(target, [...stack, file])).nodes);
    }
    tree.walkAtRules('custom-media', (n) => { const m = n.params.match(/^(--[\w-]+)\s+(.+)$/); if (!m) throw new Error(`Unsupported custom media: ${n.params}`); media.set(m[1], m[2]); n.remove(); });
    tree.walkAtRules('source', (n) => n.remove());
    tree.walkAtRules('theme', (n) => { n.walkDecls((d) => { if (d.prop.includes('*')) d.remove(); }); n.replaceWith(postcss.rule({ selector: ':root', nodes: n.nodes })); });
    return tree;
  }
  const files = ['docs/src/css/index.css', 'docs/src/css/mdx-components.css', 'docs/src/app/(docs)/layout.css', 'docs/src/components/Header.css', 'docs/src/components/SearchTrigger.css', 'docs/src/components/SkipNav.css', 'docs/src/components/SideNav.css', 'docs/src/components/QuickNav/QuickNav.css', 'docs/src/components/Subtitle/Subtitle.css', 'docs/src/components/CodeBlock/CodeBlock.css', 'docs/src/components/Demo/Demo.css'];
  const tree = postcss.root();
  // The upstream shell relies on Preflight for headings, lists, borders and
  // inherited control typography. Its existing data-demo rules isolate CSS Modules.
  tree.append(postcss.parse(`@layer base {\n${await fs.readFile(path.join(root, 'node_modules/tailwindcss/preflight.css'), 'utf8')}\n}`));
  for (const file of files) tree.append((await expand(path.join(snapshot, file))).nodes);
  tree.walkAtRules('media', (n) => { n.params = n.params.replace(/\((--[\w-]+)\)/g, (_, key) => { if (!media.has(key)) throw new Error(`Unknown custom media: ${key}`); return media.get(key); }); });
  tree.walkDecls((n) => { if (/url\(/.test(n.value)) throw new Error(`Unresolved stylesheet asset at ${n.source.input.file}: ${n.value}`); });
  tree.walkDecls(/^--font-sans(?:-b)?$/, n => { n.value = 'system-ui, sans-serif'; });
  // The Solid search island owns its button; keep upstream trigger styling on it.
  tree.walkRules(n => { n.selector = n.selector.replace(/\.SearchTrigger(?![\w-])/g, ':is(.SearchTrigger, #shell-island > button)'); });
  return { css: `/* Adapted from mui/base-ui 19511bb171f3b360b006c94cf6d07e53cb446505; MIT, Copyright (c) 2019 Material-UI SAS. Fonts excluded pending provenance. Tailwind source globs are owned by demos. */\n${tree.toString()}`, sources: [...sources].sort().map(([file, sha256]) => ({ file, sha256 })) };
}
