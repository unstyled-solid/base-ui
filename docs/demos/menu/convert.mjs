import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';

// Reproducible, family-local adaptation of the immutable React demo inventory.
const root = resolve(import.meta.dirname, '../../..');
const source = resolve(root, 'upstream/base-ui/docs/src/app/(docs)/react/components/menu/demos');
const target = import.meta.dirname;
const names = readdirSync(source, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort((a, b) => a === 'hero' ? -1 : b === 'hero' ? 1 : a.localeCompare(b));
function write(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}
const imports = [];
const entries = [];
write(resolve(target, '_index.module.css'), readFileSync(resolve(source, '_index.module.css')));
for (const [index, name] of names.entries()) {
  const variants = [];
  for (const variant of ['css-modules', 'tailwind']) {
    const input = resolve(source, name, variant, 'index.tsx');
    const output = resolve(target, name, variant, 'index.tsx');
    let text = readFileSync(input, 'utf8').replace(/'use client';\n/g, '').replace("import * as React from 'react';", "import type { ComponentProps } from '@solidjs/web';");
    text = text.replaceAll('@base-ui/react/menu', 'baseui-solid2/menu').replaceAll('className=', 'class=').replaceAll('React.ComponentProps', 'ComponentProps');
    text = text.replace(/<React.Fragment(?: key=\{[^}]+\})?>/g, '<>').replaceAll('</React.Fragment>', '</>').replace(/ key=\{[^}]+\}/g, '');
    text = text.replace(/function (\w+Icon)\(props: ComponentProps<'svg'>\)/g, "function $1(props: ComponentProps<'svg'> = {})");
    text = text.replaceAll("style={{ display: 'block', ...props.style }}", "style={typeof props.style === 'string' ? `display: block; ${props.style}` : { display: 'block', ...props.style }}");
    const signals = [];
    text = text.replace(/const \[(\w+), (\w+)\] = React.useState(?:<([^>]+)>)?\(([^;]+)\);/g, (_, getter, setter, type, initial) => {
      signals.push(getter);
      return `const [${getter}, ${setter}] = createSignal${type ? `<${type}>` : ''}(${initial});`;
    });
    for (const signal of signals) text = text.replaceAll(`={${signal}}`, `={${signal}()}`);
    if (signals.length) text = "import { createSignal } from 'solid-js';\n" + text;
    // Handles belong to an island instance; two copies must not share a store.
    const handle = text.match(/const demoMenu = Menu.createHandle[^;]+;/)?.[0];
    if (handle) {
      text = text.replace(handle + '\n', '');
      text = text.replace(/(export default function \w+\(\) \{)/, `$1\n  ${handle}`);
    }
    write(output, text);
    const files = [relative(root, output)];
    if (variant === 'css-modules') {
      for (const file of readdirSync(resolve(source, name, variant))) {
        if (file.endsWith('.css')) {
          const path = resolve(target, name, variant, file);
          write(path, readFileSync(resolve(source, name, variant, file)));
          files.push(relative(root, path));
        }
      }
      if (text.includes('../../_index.module.css')) files.push('docs/demos/menu/_index.module.css');
    }
    const identifier = `Demo${index}${variant === 'css-modules' ? 'CssModules' : 'Tailwind'}`;
    imports.push(`import ${identifier} from './${name}/${variant}/index';`);
    variants.push(`      { id: '${variant}', label: '${variant === 'css-modules' ? 'CSS Modules' : 'Tailwind'}', component: ${identifier}, files: ${JSON.stringify(files)} },`);
  }
  entries.push(`  {\n    id: 'menu/${name}',\n    upstream: '${relative(root, resolve(source, name, 'index.ts'))}',\n    variants: [\n${variants.join('\n')}\n    ],\n  },`);
}
write(resolve(target, 'entry.ts'), `import type { DemoEntry } from '../shared/types';\n${imports.join('\n')}\n\nexport default [\n${entries.join('\n')}\n] satisfies readonly DemoEntry[];\n`);
console.log(`Converted ${names.length} demos / ${names.length * 2} variants.`);
