import { createMemo, createSignal, onCleanup, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { DirectionProvider } from '../direction-provider';
import { Toggle } from '../toggle';
import { Separator } from '../separator';
import { Popover } from '../popover';

function ComponentHost(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const rest = omit(props, 'children');
  // A design-system host shares its native type with styling metadata. This
  // setup-owned computation reads the spread before the native host claims its
  // hydration key, without freezing live props in an untracked setup snapshot.
  const type = createMemo(() => props.type ?? 'button');
  return <button {...rest} type={type()} data-button-type={type()}>{props.children}</button>;
}

export function ComponentHostHydrationFixture() {
  const [pressed, setPressed] = createSignal(false);
  return <section>
    <Toggle pressed={pressed()} onPressedChange={setPressed}
      render={(props) => <ComponentHost {...props}>Component toggle</ComponentHost>} />
    <Popover.Root>
      <Popover.Trigger render={(props) => <ComponentHost {...props}>Open component popup</ComponentHost>} />
      <Popover.Portal><Popover.Positioner><Popover.Popup>
        <Popover.Title>Component popup</Popover.Title>
        <Popover.Close>Close component popup</Popover.Close>
      </Popover.Popup></Popover.Positioner></Popover.Portal>
    </Popover.Root>
    <output>{pressed() ? 'on' : 'off'}</output>
  </section>;
}

// Mirrors the production package smoke's dynamic host + text-child graph.
export function RendererHydrationFixture(props: { disposed?: () => void }) {
  const [pressed, setPressed] = createSignal(false);
  onCleanup(() => props.disposed?.());
  return <DirectionProvider direction="ltr"><section>
    <Toggle<string> pressed={pressed()} onPressedChange={setPressed}>Package toggle</Toggle>
    <Separator orientation="vertical" />
    <output>{pressed() ? 'on' : 'off'}</output>
  </section></DirectionProvider>;
}
