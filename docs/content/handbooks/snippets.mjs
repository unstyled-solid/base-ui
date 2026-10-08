// Reviewed complete examples, compiled by docs/tests/handbooks/overlays.test.mjs.
export const snippets = {
  renderRefs: `import { useRender } from 'baseui-solid2/use-render';
function Text(props: useRender.ComponentProps<'p'>) {
  let internalRef: HTMLElement | null = null;
  const element = useRender({
    defaultTagName: 'p',
    ref: [(node) => { internalRef = node; }],
    props,
    get render() { return props.render; },
  });
  return element;
}`,
  manualUnmount: `import { createSignal, onCleanup } from 'solid-js';
import { Popover } from 'baseui-solid2/popover';
export default function Example() {
  const [open, setOpen] = createSignal(false);
  let actions: Popover.Root.Actions | null = null;
  let popup: HTMLDivElement | undefined;
  let animation: Animation | undefined;
  onCleanup(() => animation?.cancel());
  return <Popover.Root open={open()} actionsRef={(value) => { actions = value; }}
    onOpenChange={(nextOpen, details) => {
      animation?.cancel();
      if (!nextOpen && popup) {
        details.preventUnmountOnClose();
        animation = popup.animate([{ transform: 'scale(1)' }, { transform: 'scale(.8)' }], { duration: 150, fill: 'forwards' });
        animation.onfinish = () => actions?.unmount();
      }
      setOpen(nextOpen);
    }}>
    <Popover.Trigger>Trigger</Popover.Trigger>
    <Popover.Portal keepMounted><Popover.Positioner><Popover.Popup ref={(node) => { popup = node ?? undefined; }}>
      Popup
    </Popover.Popup></Popover.Positioner></Popover.Portal>
  </Popover.Root>;
}`,
  composition: `import { Button } from 'baseui-solid2/button';
export default function Example() {
  return <Button render={(props, state) => <button {...props} data-disabled={state.disabled}>Open menu</button>} />;
}`,
  styling: `import { Switch } from 'baseui-solid2/switch';
export default function Example() {
  return <Switch.Root><Switch.Thumb class={(state) => state.checked ? 'checked' : 'unchecked'} /></Switch.Root>;
}`,
  customization: `import { createSignal, createEffect } from 'solid-js';
import { Dialog } from 'baseui-solid2/dialog';
export default function Example() {
  const [open, setOpen] = createSignal(false);
  createEffect(() => true, () => {
    const timeout = setTimeout(() => setOpen(true), 1000);
    return () => clearTimeout(timeout);
  });
  return <Dialog.Root open={open()} onOpenChange={(nextOpen, details) => {
    if (details.reason === 'escape-key') { details.cancel(); return; }
    setOpen(nextOpen);
  }}><Dialog.Trigger>Open</Dialog.Trigger></Dialog.Root>;
}`,
  forms: `import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';
export default function Example() {
  return <Form onSubmit={(event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(data.get('username'));
  }}><Field.Root name="username"><Field.Label>Username</Field.Label>
    <Field.Control required minlength={3} /><Field.Error />
  </Field.Root><button type="submit">Submit</button></Form>;
}`,
  typescript: `import type { ComponentProps } from '@solidjs/web';
import { Button } from 'baseui-solid2/button';
export function MyButton(props: ComponentProps<typeof Button>) {
  return <Button {...props} />;
}`,
  'use-render': `import { createRender } from 'baseui-solid2/use-render';
export function Text(props: createRender.ComponentProps<'p'>) {
  return createRender({ defaultTagName: 'p', props, get render() { return props.render; } });
}`,
  refs: `import { createEffect, createSignal } from 'solid-js';
export function Example() {
  const [element, setElement] = createSignal<HTMLButtonElement | undefined>(undefined);
  createEffect(() => element(), (node) => {
    if (!node) return;
    const listener = () => console.log('focused');
    node.addEventListener('focus', listener);
    return () => node.removeEventListener('focus', listener);
  });
  return <button ref={(node) => { setElement(node); }}>Focus me</button>;
}`,
  events: `import { Button } from 'baseui-solid2/button';
export function Example() {
  return <Button onClick={(event) => {
    event.preventBaseUIHandler();
  }}>Skip Base UI handling</Button>;
}`,
  'csp-provider': `import { CSPProvider } from 'baseui-solid2/csp-provider';
export function App(props: { nonce: string }) {
  return <CSPProvider nonce={props.nonce}><main>Application</main></CSPProvider>;
}`,
  'quick-start': `import { render } from '@solidjs/web';
import { Button } from 'baseui-solid2/button';
const root = document.getElementById('root');
if (!root) throw new Error('Missing root');
render(() => <Button class="Button">Hello</Button>, root);`,
  validation: `import { Field } from 'baseui-solid2/field';

<Field.Root
  name="username"
  validationMode="onChange"
  validationDebounceTime={300}
  validate={async (value) => {
    if (value === 'admin') return 'Reserved for system use.';
    const response = await fetch('/api/usernames/' + encodeURIComponent(String(value)));
    const result: { available: boolean } = await response.json();
    if (!result.available) return \`\${value} is unavailable.\`;
    return null;
  }}
>
  <Field.Control required minlength={3} />
  <Field.Error />
</Field.Root>;`,
  serverErrors: `import { createSignal } from 'solid-js';
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';

async function submitToServer() {
  return { errors: { promoCode: 'This promo code has expired' } };
}

function Example() {
  const [errors, setErrors] = createSignal<Record<string, string>>({});
  return <Form errors={errors()} onSubmit={async (event) => {
    event.preventDefault();
    const response = await submitToServer();
    setErrors(response.errors);
  }}>
    <Field.Root name="promoCode" />
  </Form>;
}`,
  vite: `import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';
export default defineConfig({ plugins: [solid({ compiler: 'babel' })] });`,
};
