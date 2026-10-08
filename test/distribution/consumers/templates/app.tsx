import { createSignal, onCleanup } from 'solid-js';
import { Toggle, Separator, CSPProvider, ScrollArea, Tabs } from 'baseui-solid2';

// Default hosts and real families are deliberate: a custom native render callback
// could hide a broken packed createRenderElement/compiler/runtime seam.
export function App(props: { cleanup?: () => void }) {
  const [pressed, setPressed] = createSignal(false);
  onCleanup(() => props.cleanup?.());
  return <CSPProvider nonce="packed-consumer-nonce"><section id="package-smoke">
    <Toggle<string> id="package-toggle" pressed={pressed()} onPressedChange={setPressed}>Package toggle</Toggle>
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
