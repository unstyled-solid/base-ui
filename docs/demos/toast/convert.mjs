// Reproduce the demo port from the read-only, pinned upstream sources.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const target = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(target, '../../..');
const source = path.join(root, 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos');
const names = ['hero', 'custom', 'deduplicate', 'promise', 'varying-heights', 'undo', 'position', 'anchored'];
const entries = [];
const imports = [];
for (const name of names) {
  const variants = [];
  for (const variant of ['css-modules', 'tailwind']) {
    const input = path.join(source, name, variant);
    if (!fs.existsSync(input)) continue;
    const output = path.join(target, name, variant);
    fs.mkdirSync(output, { recursive: true });
    let text = fs.readFileSync(path.join(input, 'index.tsx'), 'utf8');
    text = text.replace(/'use client';\n/, '')
      .replace(/import \* as React from 'react';\n/, '')
      .replaceAll('@base-ui/react/', 'baseui-solid2/')
      .replaceAll('className=', 'class=')
      .replace(/\s+key=\{toast.id\}/g, '')
      .replaceAll('const countRef = React.useRef(0);', 'let count = 0;')
      .replaceAll('countRef.current', 'count')
      .replaceAll('const { toasts } = Toast.useToastManager();', 'const toastManager = Toast.useToastManager();')
      .replaceAll('toasts.map((toast) => (', '<For each={toastManager.toasts}>{(toast) => (')
      .replaceAll('  ));', '  )}</For>;');
    // Only list map endings are changed above; all other calls end with `);`.
    text = text.replaceAll('const [copied, setCopied] = React.useState(false);', 'const [copied, setCopied] = createSignal(false);')
      .replaceAll('const buttonRef = React.useRef<HTMLButtonElement | null>(null);', 'let buttonRef: HTMLButtonElement | null = null;')
      .replaceAll('buttonRef.current', 'buttonRef')
      .replaceAll('ref={buttonRef}', 'ref={(element) => { buttonRef = element; }}')
      .replaceAll('disabled={copied}', 'disabled={copied()}')
      .replaceAll('{copied ?', '{copied() ?')
      .replaceAll('render={<Button disabled={copied()} focusableWhenDisabled />}', 'render={(props) => <Button {...props} disabled={copied()} focusableWhenDisabled />}')
      .replaceAll('React.ComponentProps', 'ComponentProps')
      .replaceAll('strokeWidth=', 'stroke-width=')
      .replaceAll("style={{ display: 'block', ...props.style }}", "style={typeof props.style === 'string' ? `display:block;${props.style}` : { display: 'block', ...props.style }}");
    // Lists embedded in JSX have a brace outside the map expression.
    text = text.replaceAll('{<For', '<For').replaceAll('))}', ')}</For>');
    text = text.replace('return toasts.map((toast) => <PulseToastItem toast={toast} />);', 'return <For each={toastManager.toasts}>{(toast) => <PulseToastItem toast={toast} />}</For>;');
    if (name === 'deduplicate') {
      text = text.replace('function PulseToastItem({ toast }: { toast: Toast.Root.ToastObject }) {', 'function PulseToastItem(props: { toast: Toast.Root.ToastObject }) {');
      const start = text.indexOf('  let pulseClassName:');
      const end = text.indexOf('\n  return (', start);
      text = text.slice(0, start) + `  const className = () => [styles.Toast, props.toast.updateKey ? (props.toast.updateKey % 2 === 0 ? styles.PulseEven : styles.PulseOdd) : null].filter(Boolean).join(' ');\n` + text.slice(end);
      text = text.replace('<Toast.Root toast={toast} class={className}>', '<Toast.Root toast={props.toast} class={className()}>');
    }
    text = text.replaceAll('<For each={toastManager.toasts}>', '<For each={toastManager.toasts} keyed={(item) => item.id}>')
      .replaceAll('toast={toast}', 'toast={toast()}')
      .replaceAll('toast.title', 'toast().title')
      .replaceAll('isCustomToast(toast)', 'isCustomToast(toast())')
      .replaceAll('toast.data', 'toast().data');
    // The type guard receives a value, while keyed list callbacks receive accessors.
    text = text.replace('return toast().data?.userId', 'return toast.data?.userId');
    text = "import { For" + (name === 'anchored' ? ', createSignal' : '') + " } from 'solid-js';\n" + (name === 'anchored' ? "import type { ComponentProps } from '@solidjs/web';\n" : '') + text;
    fs.writeFileSync(path.join(output, 'index.tsx'), text);
    const files = [`docs/demos/toast/${name}/${variant}/index.tsx`];
    if (variant === 'css-modules') {
      fs.copyFileSync(path.join(input, 'index.module.css'), path.join(output, 'index.module.css'));
      files.push(`docs/demos/toast/${name}/${variant}/index.module.css`);
    }
    const identifier = `Demo${imports.length}`;
    imports.push(`import ${identifier} from './${name}/${variant}/index';`);
    variants.push(`{ id: '${variant}', label: '${variant === 'css-modules' ? 'CSS Modules' : 'Tailwind'}', component: ${identifier}, files: ${JSON.stringify(files)} }`);
  }
  entries.push(`  { id: 'toast/${name}', upstream: 'upstream/base-ui/docs/src/app/(docs)/react/components/toast/demos/${name}/index.ts', variants: [${variants.join(', ')}] }`);
}
fs.writeFileSync(path.join(target, 'entry.ts'), `import type { DemoEntry } from '../shared/types';\n${imports.join('\n')}\n\nexport default [\n${entries.join(',\n')}\n] satisfies DemoEntry[];\n`);
console.log(`${entries.length} demos, ${imports.length} variants converted`);
