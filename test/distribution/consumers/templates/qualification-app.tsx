import { createSignal } from 'solid-js';
import { CSPProvider, DirectionProvider, ScrollArea, Slider, Tabs, Toggle, Dialog, Select, Tooltip } from 'baseui-solid2';

export function QualificationApp(props: { prefix: string; vertical?: boolean; rtl?: boolean; disabledStyles?: boolean }) {
  const [pressed, setPressed] = createSignal(false);
  const [tab, setTab] = createSignal('one');
  const [value, setValue] = createSignal(25);
  return <CSPProvider nonce="qualification-nonce" disableStyleElements={props.disabledStyles}>
    <DirectionProvider direction={props.rtl ? 'rtl' : 'ltr'}>
      <section id={`${props.prefix}-app`}>
        <Toggle id={`${props.prefix}-toggle`} pressed={pressed()} onPressedChange={setPressed}>Toggle</Toggle>
        <output id={`${props.prefix}-pressed`}>{String(pressed())}</output>
        <Tabs.Root value={tab()} onValueChange={setTab} orientation={props.vertical ? 'vertical' : 'horizontal'}>
          <Tabs.List style={{ position: 'relative', display: 'flex', 'flex-direction': props.vertical ? 'column' : 'row', width: '240px' }}>
            <Tabs.Tab id={`${props.prefix}-one`} value="one" style={{ width: '100px', height: '40px' }}>One</Tabs.Tab>
            <Tabs.Tab id={`${props.prefix}-two`} value="two" style={{ width: '100px', height: '40px' }}>Two</Tabs.Tab>
            <Tabs.Indicator renderBeforeHydration id={`${props.prefix}-indicator`} style={{ position: 'absolute', width: 'var(--active-tab-width)', height: 'var(--active-tab-height)', left: 'var(--active-tab-left)', top: 'var(--active-tab-top)', 'pointer-events': 'none' }} />
          </Tabs.List>
          <Tabs.Panel value="one">First</Tabs.Panel><Tabs.Panel value="two">Second</Tabs.Panel>
        </Tabs.Root>
        <Slider.Root value={value()} onValueChange={setValue} thumbAlignment="edge" orientation={props.vertical ? 'vertical' : 'horizontal'}>
          <Slider.Control id={`${props.prefix}-control`} style={{ position: 'relative', width: props.vertical ? '40px' : '240px', height: props.vertical ? '160px' : '40px' }}>
            <Slider.Track><Slider.Indicator id={`${props.prefix}-fill`} /></Slider.Track>
            <Slider.Thumb id={`${props.prefix}-thumb`} aria-label="Value" style={{ width: '20px', height: '20px' }} />
          </Slider.Control>
        </Slider.Root>
        <output id={`${props.prefix}-value`}>{value()}</output>
        <ScrollArea.Root style={{ width: '120px', height: '60px' }}>
          <ScrollArea.Viewport id={`${props.prefix}-viewport`} style={{ width: '120px', height: '60px' }}>
            <ScrollArea.Content><div style={{ width: '240px', height: '180px' }}>Overflow</div></ScrollArea.Content>
          </ScrollArea.Viewport>
        </ScrollArea.Root>
        <Select.Root defaultValue="one">
          <Select.Trigger id={`${props.prefix}-select`}>Select</Select.Trigger>
          <Select.Portal><Select.Positioner><Select.Popup id={`${props.prefix}-select-popup`}>
            <Select.List><Select.Item value="one">One</Select.Item><Select.Item value="two">Two</Select.Item></Select.List>
          </Select.Popup></Select.Positioner></Select.Portal>
        </Select.Root>
        <Tooltip.Provider delay={0}>
          <Tooltip.Root><Tooltip.Trigger id={`${props.prefix}-hover`}>Hover</Tooltip.Trigger>
            <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup id={`${props.prefix}-tooltip`}>Tip</Tooltip.Popup></Tooltip.Positioner></Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
        <Dialog.Root>
          <Dialog.Trigger id={`${props.prefix}-open`}>Open dialog</Dialog.Trigger>
          <Dialog.Portal><Dialog.Backdrop style={{ position: 'fixed', inset: 0, 'z-index': 1000 }} /><Dialog.Popup id={`${props.prefix}-popup`} style={{ position: 'fixed', top: '40px', left: '40px', 'z-index': 1001, background: 'white', padding: '20px' }}>
            <Dialog.Title>Qualification dialog</Dialog.Title><Dialog.Description>Shared resource lifetime</Dialog.Description>
            <Dialog.Close id={`${props.prefix}-close`}>Close</Dialog.Close>
          </Dialog.Popup></Dialog.Portal>
        </Dialog.Root>
      </section>
    </DirectionProvider>
  </CSPProvider>;
}
