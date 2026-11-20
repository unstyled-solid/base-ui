import { createSignal, onCleanup, untrack } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { Toggle, Separator, CSPProvider, ScrollArea, Tabs } from 'baseui-solid2';

// Read the merged props before claiming the host. Unlike a native spread, this
// exposes prop stages that allocate owner IDs on each read (issue #14).
function ComponentHost(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  // Initial styling metadata is deliberately a snapshot; forwarded native props
  // remain live. untrack keeps the host owner, unlike a memo which can conceal
  // allocations inside a prop stage by putting them under a separate owner.
  const initial = untrack(() => ({ type: props.type, disabled: props.disabled }));
  return <button {...props} data-initial-type={initial.type} data-initial-disabled={String(Boolean(initial.disabled))} />;
}
export function App(props: { cleanup?: () => void }) {
  const [pressed, setPressed] = createSignal(false);
  const [composed, setComposed] = createSignal(false);
  onCleanup(() => props.cleanup?.());
  return <CSPProvider nonce="packed-consumer-nonce"><section id="package-smoke">
    <Toggle<string> id="package-toggle" pressed={pressed()} onPressedChange={setPressed}>Package toggle</Toggle>
    <Toggle data-component-host pressed={composed()} onPressedChange={setComposed}
      render={(hostProps) => <ComponentHost {...hostProps} />}>Composed toggle</Toggle>
    <output id="package-composed-value">{composed() ? 'on' : 'off'}</output>
    <Separator id="package-separator" orientation="vertical" />
    <output id="package-value">{pressed() ? 'on' : 'off'}</output>
    <ScrollArea.Root style={{ width: '120px', height: '60px' }}>
      <ScrollArea.Viewport id="package-viewport" style={{ width: '120px', height: '60px' }}>
        <ScrollArea.Content><div style={{ width: '240px', height: '180px' }}>Overflow content</div></ScrollArea.Content>
      </ScrollArea.Viewport>
    </ScrollArea.Root>
    <Tabs.Root defaultValue="one"><Tabs.List>
      <Tabs.Tab value="one" id="package-tab-one">One</Tabs.Tab>
      <Tabs.Tab value="two" id="package-tab-two">Two</Tabs.Tab>
      <Tabs.Indicator id="package-indicator" />
    </Tabs.List><Tabs.Panel value="one">First panel</Tabs.Panel><Tabs.Panel value="two">Second panel</Tabs.Panel></Tabs.Root>
  </section></CSPProvider>;
}
