import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Reproducible source adaptation from the read-only pinned React demos.
const root = resolve(import.meta.dirname, '../../..');
const upstream = 'upstream/base-ui/docs/src/app/(docs)/react/components/navigation-menu/demos';
const demos = ['hero', 'nested', 'nested-inline'];
for (const demo of demos) {
  for (const variant of ['css-modules', 'tailwind']) {
    const target = resolve(import.meta.dirname, demo, variant);
    mkdirSync(target, { recursive: true });
    let source = readFileSync(resolve(root, upstream, demo, variant, 'index.tsx'), 'utf8');
    source = source.replace("'use client';\n", '')
      .replace("import * as React from 'react';", "import type { ComponentProps } from '@solidjs/web';")
      .replaceAll('@base-ui/react/', 'baseui-solid2/')
      .replaceAll('className=', 'class=')
      .replace(/ key=\{[^}]+\}/g, '')
      .replaceAll("React.ComponentProps<'svg'>", "ComponentProps<'svg'>")
      .replaceAll("...props.style", "...(typeof props.style === 'object' ? props.style : {})")
      .replace(/render=\{[\s\S]*?<a \/>\s*\}/g, 'render={(linkProps) => <a {...linkProps} />}')
      .replaceAll('useMediaQuery', 'createMediaQuery')
      .replaceAll("orientation={isDesktop ?", "orientation={isDesktop() ?");
    writeFileSync(resolve(target, 'index.tsx'), source);
    if (variant === 'css-modules') {
      writeFileSync(resolve(target, 'index.module.css'), readFileSync(resolve(root, upstream, demo, variant, 'index.module.css')));
    }
  }
}
writeFileSync(resolve(import.meta.dirname, 'nested-inline/data.ts'), readFileSync(resolve(root, upstream, 'nested-inline/data.ts')));
const imports = demos.flatMap((demo, i) => [
  `import CssModules${i} from './${demo}/css-modules';`,
  `import Tailwind${i} from './${demo}/tailwind';`,
]).join('\n');
const entries = demos.map((demo, i) => {
  const base = `docs/demos/navigation-menu/${demo}`;
  const data = demo === 'nested-inline' ? `, '${base}/data.ts'` : '';
  return `  {\n    id: 'navigation-menu/${demo}',\n    upstream: '${upstream}/${demo}/index.ts',\n    variants: [\n      { id: 'css-modules', label: 'CSS Modules', component: CssModules${i}, files: ['${base}/css-modules/index.tsx', '${base}/css-modules/index.module.css'${data}] },\n      { id: 'tailwind', label: 'Tailwind', component: Tailwind${i}, files: ['${base}/tailwind/index.tsx'${data}] },\n    ],\n  }`;
}).join(',\n');
writeFileSync(resolve(import.meta.dirname, 'entry.ts'), `import type { DemoEntry } from '../shared/types';\n${imports}\n\nexport default [\n${entries},\n] satisfies readonly DemoEntry[];\n`);
