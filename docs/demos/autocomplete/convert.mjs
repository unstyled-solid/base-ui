// Reproducible source migration from the read-only pinned React documentation.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../../..');
const source = 'upstream/base-ui/docs/src/app/(docs)/react/components/autocomplete/demos';
const sha = '19511bb171f3b360b006c94cf6d07e53cb446505';
if (execFileSync('rtk', ['proxy', 'git', '-C', path.join(root, 'upstream/base-ui'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() !== sha) throw new Error('Unexpected upstream revision');
const demos = fs.readdirSync(path.join(root, source)).sort((a, b) => a === 'hero' ? -1 : b === 'hero' ? 1 : a.localeCompare(b));
const entries = [];
const imports = [];
// Keep framework-neutral dependencies local: no manifest or shared-library edits.
const vendor = path.join(import.meta.dirname, 'vendor');
fs.mkdirSync(vendor, { recursive: true });
async function download(url, name, adapt = (text) => text) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Cannot fetch ${url}: ${response.status}`);
  fs.writeFileSync(path.join(vendor, name), adapt(await response.text()).replace(/\/\/# sourceMappingURL=.*$/gm, ''));
}
await download('https://unpkg.com/match-sorter@8.3.0/dist/match-sorter.esm.js', 'match-sorter.js', text => text.replace("from 'remove-accents'", "from './remove-accents.js'"));
await download('https://unpkg.com/match-sorter@8.3.0/dist/index.d.ts', 'match-sorter.d.ts');
await download('https://unpkg.com/match-sorter@8.3.0/LICENSE', 'match-sorter.LICENSE');
await download('https://unpkg.com/remove-accents@0.5.0/index.js', 'remove-accents.js', text => text.replace('module.exports = removeAccents;', 'export default removeAccents;').replace('module.exports.has = hasAccents;', '').replace('module.exports.remove = removeAccents;', ''));
await download('https://unpkg.com/remove-accents@0.5.0/LICENSE', 'remove-accents.LICENSE');
for (const name of ['index.js', 'index.d.ts', 'utils.js', 'utils.d.ts']) {
  await download(`https://unpkg.com/@tanstack/virtual-core@3.17.11/dist/esm/${name}`, `virtual-${name}`, text => text.replaceAll('./utils.js', './virtual-utils.js').replaceAll('"./utils"', '"./virtual-utils"'));
}
await download('https://unpkg.com/@tanstack/virtual-core@3.17.11/LICENSE', 'virtual-core.LICENSE');
for (const name of ['lazy-measurements.js', 'lazy-measurements.d.ts']) {
  await download(`https://unpkg.com/@tanstack/virtual-core@3.17.11/dist/esm/${name}`, name);
}
for (const demo of demos) {
  const index = fs.readFileSync(path.join(root, source, demo, 'index.ts'), 'utf8');
  if (!index.includes('createDemoWithVariants')) throw new Error(`Unmapped createDemo: ${demo}`);
  const variants = [];
  for (const variant of ['css-modules', 'tailwind']) {
    const dir = path.join(import.meta.dirname, demo, variant);
    fs.mkdirSync(dir, { recursive: true });
    let code = fs.readFileSync(path.join(root, source, demo, variant, 'index.tsx'), 'utf8');
    code = code.replace("'use client';\n", '').replace("import * as React from 'react';\n", '');
    code = code.replaceAll('@base-ui/react/', 'baseui-solid2/').replaceAll('className=', 'class=');
    code = code.replace(/\s+key=\{[^}]+\}/g, '').replaceAll('React.ComponentProps', 'ComponentProps').replaceAll('React.ReactNode', 'JSX.Element').replaceAll('React.KeyboardEvent', 'KeyboardEvent').replaceAll('React.CSSProperties', 'JSX.CSSProperties').replaceAll('<React.Fragment>', '<>').replaceAll('</React.Fragment>', '</>');
    code = code.replace(/React.useState/g, 'createSignal').replace(/React.useId\(\)/g, 'createUniqueId()');
    const signals = [...code.matchAll(/const \[(\w+), \w+\] = createSignal/g)].map(m => m[1]);
    for (const name of signals) {
      // Only read occurrences are converted; declarations retain accessor identifiers.
      code = code.replace(new RegExp(`(?<![\\w.])\\b${name}\\b(?!\\s*:)`, 'g'), `${name}()`);
      code = code.replace(new RegExp(`const \\[${name}\\(\\),`, 'g'), `const [${name},`);
      code = code.replaceAll(`${name}()=`, `${name}=`);
      if (name === 'open') code = code.replace('              open()\n', '              open\n');
    }
    if (demo === 'limit') {
      code = code.replace('React.useMemo(() => {', 'createMemo(() => {').replace('}, [value(), contains]);', '});');
      code = code.replace('const moreCount = Math.max(0, totalMatches - limit);', 'const moreCount = () => Math.max(0, totalMatches() - limit);').replaceAll('moreCount >', 'moreCount() >').replaceAll('${moreCount}', '${moreCount()}');
    }
    if (demo === 'command-palette') code = code.replace("...props.style", "...(typeof props.style === 'object' ? props.style : {})");
    if (demo === 'keyboard-shortcuts') {
      code = code.replace('const actionsRef = React.useRef<Autocomplete.Root.Actions>(null);', 'let actions: Autocomplete.Root.Actions | null = null;').replaceAll('actionsRef.current', 'actions').replace('actionsRef={actionsRef}', 'actionsRef={(value) => { actions = value; }}');
    }
    if (demo === 'grid') {
      code = code.replace('const textInputRef = React.useRef<HTMLInputElement | null>(null);', 'let textInput: HTMLInputElement | undefined;').replaceAll('textInputRef.current', 'textInput').replace('ref={textInputRef}', 'ref={(element) => { textInput = element; }}').replace('onChange={(event) => setTextValue(event.target.value)}', 'onInput={(event) => setTextValue(event.currentTarget.value)}');
      code = code.replace('input.setSelectionRange(caretPos, caretPos);', 'queueMicrotask(() => input.setSelectionRange(caretPos, caretPos));');
    }
    if (demo === 'async') {
      code = code.replace('const [isPending, startTransition] = React.useTransition();', 'const [isPending, setPending] = createSignal(false);');
      code = code.replaceAll('if (isPending)', 'if (isPending())').replaceAll('aria-busy={isPending ||', 'aria-busy={isPending() ||');
      code = code.replace('const abortControllerRef = React.useRef<AbortController | null>(null);', 'let controllerRef: AbortController | null = null;\n  onCleanup(() => controllerRef?.abort());').replaceAll('abortControllerRef.current', 'controllerRef');
      code = code.replace('const status = getStatus();', 'const status = getStatus;').replaceAll('!status}', '!status()}').replaceAll('{status &&', '{status() &&').replaceAll('{status}', '{status()}');
      code = code.replace('setError(null);\n          return;', 'setError(null);\n          setPending(false);\n          return;');
      code = code.replace('startTransition(async () => {', 'setPending(true);\n        void (async () => {').replace('startTransition(() => {\n            setSearchResults(result.movies);\n            setError(result.error);\n          });', 'setSearchResults(result.movies);\n          setError(result.error);\n          setPending(false);').replace('        });\n      }}', '        })();\n      }}');
    }
    if (demo === 'fuzzy-matching') code = code.replace("from 'match-sorter'", "from '../../vendor/match-sorter'");
    if (demo === 'virtualized') {
      code = code.replace("import { useVirtualizer } from '@tanstack/react-virtual';", "import { createVirtualizer, type DemoVirtualizer } from '../../virtualizer';");
      code = code.replace('const virtualizerRef = React.useRef<Virtualizer | null>(null);', 'const virtualizerRef: { current: DemoVirtualizer | null } = { current: null };');
      code = code.replace('React.RefObject<Virtualizer | null>', '{ current: DemoVirtualizer | null }');
      code = code.replace('const scrollElementRef = React.useRef<HTMLDivElement | null>(null);', 'let scrollElement: HTMLDivElement | null = null;');
      code = code.replace('useVirtualizer({', 'createVirtualizer({').replace('count: filteredItems.length,', 'count: () => filteredItems().length,').replace('scrollElementRef.current', 'scrollElement');
      code = code.replace('React.useImperativeHandle(virtualizerRef, () => virtualizer);', 'virtualizerRef.current = virtualizer;\n  onCleanup(() => { virtualizerRef.current = null; });');
      code = code.replace('const handleScrollElementRef = React.useCallback(', 'const handleScrollElementRef = (').replace('    },\n    [virtualizer],\n  );', '    }\n  );').replaceAll('scrollElementRef.current', 'scrollElement');
      code = code.replace('const totalSize = virtualizer.getTotalSize();', 'const totalSize = () => virtualizer.getTotalSize();').replace('  if (!filteredItems.length) {\n    return null;\n  }\n', '');
      code = code.replaceAll('filteredItems.length', 'filteredItems().length').replaceAll('filteredItems[', 'filteredItems()[').replaceAll('${totalSize}', '${totalSize()}').replaceAll('height: totalSize', 'height: `${totalSize()}px`').replaceAll('height: virtualItem.size', 'height: `${virtualItem.size}px`');
      code = code.replace(/type Virtualizer = ReturnType<[^\n]+;\n?/, '');
    }
    code = code.replace(/aria-hidden(?=\s|\s*\/?>)/g, 'aria-hidden="true"').replaceAll('aria-busy={isPending() || undefined}', 'aria-busy={isPending() ? "true" : undefined}').replaceAll('strokeLinecap=', 'stroke-linecap=').replaceAll('strokeLinejoin=', 'stroke-linejoin=').replaceAll('minWidth:', '"min-width":');
    code = `// Adapted from Base UI (MIT), ${sha}.\nimport { createSignal, createMemo, createUniqueId, onCleanup } from 'solid-js';\nimport type { ComponentProps, JSX } from '@solidjs/web';\n${code}`;
    fs.writeFileSync(path.join(dir, 'index.tsx'), code);
    const files = [`docs/demos/autocomplete/${demo}/${variant}/index.tsx`];
    if (variant === 'css-modules') {
      fs.copyFileSync(path.join(root, source, demo, variant, 'index.module.css'), path.join(dir, 'index.module.css'));
      files.push(`docs/demos/autocomplete/${demo}/${variant}/index.module.css`);
    }
    if (demo === 'virtualized') files.push('docs/demos/autocomplete/virtualizer.ts', 'docs/demos/autocomplete/vendor/virtual-index.js', 'docs/demos/autocomplete/vendor/virtual-utils.js', 'docs/demos/autocomplete/vendor/lazy-measurements.js');
    if (demo === 'fuzzy-matching') files.push('docs/demos/autocomplete/vendor/match-sorter.js', 'docs/demos/autocomplete/vendor/remove-accents.js');
    const identifier = `Demo${entries.length}${variant === 'css-modules' ? 'CssModules' : 'Tailwind'}`;
    imports.push(`import ${identifier} from './${demo}/${variant}';`);
    variants.push(`{ id: '${variant}', label: '${variant === 'css-modules' ? 'CSS Modules' : 'Tailwind'}', component: ${identifier}, files: ${JSON.stringify(files)} }`);
  }
  entries.push(`{ id: 'autocomplete/${demo}', upstream: '${source}/${demo}/index.ts', variants: [${variants.join(', ')}] }`);
}
fs.writeFileSync(path.join(import.meta.dirname, 'entry.ts'), `import type { DemoEntry } from '../shared/types';\n${imports.join('\n')}\n\nexport default [\n  ${entries.join(',\n  ')}\n] satisfies DemoEntry[];\n`);
console.log(`Converted ${entries.length} demos / ${imports.length} executable variants`);
