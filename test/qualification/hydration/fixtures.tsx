import { createMemo, createSignal, Errored, For, Loading, onCleanup, onSettled } from 'solid-js';
import { isServer } from '@solidjs/web';
import { Field } from 'baseui-solid2/field';
import { Input } from 'baseui-solid2/input';
import { Toggle } from 'baseui-solid2/toggle';
import { Tabs } from 'baseui-solid2/tabs';
import { Dialog } from 'baseui-solid2/dialog';
import { Slider } from 'baseui-solid2/slider';
import { ScrollArea } from 'baseui-solid2/scroll-area';
import { Select } from 'baseui-solid2/select';
import { CSPProvider } from 'baseui-solid2/csp-provider';

export type Kind = 'controls' | 'tabs' | 'dialog' | 'detached' | 'stream' | 'error' | 'csp';
export interface Hooks {
  event(name: string): void;
  ready(): void;
  cleanup(): void;
  update?(fn: () => void): void;
  close?(fn: () => void): void;
  load?(request: string, version: number): Promise<{ id: string; text: string }[]>;
  delayTrigger?: Promise<void>;
}
export interface FixtureProps {
  kind: Kind;
  request: string;
  initialOpen?: boolean;
  keepMounted?: boolean;
  disabledStyles?: boolean;
  noSelection?: boolean;
  nonce?: string;
  container?: Element;
  hooks?: Hooks;
}

function Controls(props: FixtureProps) {
  const [value, setValue] = createSignal('initial');
  return <section data-request={props.request}>
    <Field.Root><Field.Label data-probe="label">{props.request}</Field.Label>
      <Input data-probe="input" value={value()} onValueChange={(next) => {
        props.hooks?.event('input'); setValue(next);
      }} /><Field.Description data-probe="description">Description</Field.Description>
    </Field.Root>
    <Toggle data-probe="toggle" onClick={() => props.hooks?.event('click')}
      onPressedChange={() => props.hooks?.event('pressed')}>Toggle</Toggle>
    <output data-probe="value">{value()}</output>
    <div data-probe="nested-mount" />
  </section>;
}

function TabControls(props: FixtureProps) {
  const [conditional, setConditional] = createSignal(true);
  return <section data-request={props.request}>
    <button data-probe="conditional" onClick={() => setConditional(value => !value)}>Conditional</button>
    <Tabs.Root defaultValue="a"><Tabs.List>
      <Tabs.Tab value="a" data-probe="tab-a">A</Tabs.Tab>
      <Tabs.Tab value="b" data-probe="tab-b">B</Tabs.Tab>
    </Tabs.List>
      <Tabs.Panel value="a" data-probe="panel-a">Initially open</Tabs.Panel>
      <Tabs.Panel value="b" keepMounted={props.keepMounted} data-probe="panel-b">
        {conditional() && <Input data-probe="conditional-input" defaultValue="retained" />}
      </Tabs.Panel>
    </Tabs.Root>
  </section>;
}

function DialogControls(props: FixtureProps) {
  return <section data-request={props.request}>
    <Dialog.Root defaultOpen={props.initialOpen} modal={false}
      onOpenChange={() => props.hooks?.event('open-change')}>
      <Dialog.Trigger data-probe="trigger" onClick={() => props.hooks?.event('trigger-click')}>Open</Dialog.Trigger>
      <Dialog.Portal container={props.container} keepMounted={props.keepMounted}>
        <Dialog.Popup data-probe="popup" initialFocus={false} finalFocus={false}>
          <Dialog.Title>{props.request}</Dialog.Title><Dialog.Description>Portal content</Dialog.Description>
          <Toggle data-probe="portal-toggle" onClick={() => props.hooks?.event('portal-click')}
            onPressedChange={() => props.hooks?.event('portal-pressed')}>Portal toggle</Toggle>
          <Dialog.Close data-probe="close">Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  </section>;
}

function Detached(props: FixtureProps) {
  const handle = Dialog.createHandle<number>();
  props.hooks?.close?.(() => handle.close());
  function Trigger() {
    // Async ownership is required here to exercise delayed trigger hydration.
    const ready = createMemo(async () => { await props.hooks?.delayTrigger; return true; });
    return <>{ready() && <Dialog.Trigger handle={handle} id={`${props.request}-trigger`}
      data-probe="detached-trigger" payload={7}>Detached trigger</Dialog.Trigger>}</>;
  }
  return <section data-request={props.request}>
    <Dialog.Root handle={handle} defaultOpen defaultTriggerId={`${props.request}-trigger`} modal={false}>
      <Dialog.Portal><Dialog.Popup initialFocus={false} finalFocus={false}>
        <Dialog.Title>Detached</Dialog.Title><Dialog.Close>Close</Dialog.Close>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>
    <Loading fallback={<p data-probe="trigger-pending">Pending trigger</p>}><Trigger /></Loading>
  </section>;
}

function AsyncControls(props: FixtureProps) {
  const [version, setVersion] = createSignal(0);
  props.hooks?.update?.(() => setVersion(value => value + 1));
  // Async memo owns one shared request consumed by the keyed list boundary.
  const rows = createMemo(async () => {
    const current = version();
    if (props.hooks?.load) return props.hooks.load(props.request, current);
    await new Promise(resolve => setTimeout(resolve, 20));
    if (props.kind === 'error') throw new Error(`expected:${props.request}`);
    return [{ id: 'a', text: `${props.request}:${current}:a` }, { id: 'b', text: `${props.request}:${current}:b` }];
  });
  return <section data-request={props.request}>
    <Errored fallback={(error) => <p data-probe="error">{String(error())}</p>}>
      <Loading fallback={<p data-probe="pending">Pending {props.request}</p>}>
        <div data-probe="rows"><For each={rows()} keyed={row => row.id}>{row =>
          <Toggle data-row={row().id} onClick={() => props.hooks?.event('row-click')}>{row().text}</Toggle>
        }</For></div>
      </Loading>
    </Errored>
  </section>;
}

function CSPControls(props: FixtureProps) {
  return <CSPProvider nonce={props.nonce} disableStyleElements={props.disabledStyles}>
    <section data-request={props.request}>
      <Tabs.Root value={props.noSelection ? null : 'a'}><Tabs.List class="tab-list">
        <Tabs.Tab value="a" class="tab" data-probe="active-tab">A</Tabs.Tab>
        <Tabs.Tab value="b" class="tab">B</Tabs.Tab>
        <Tabs.Indicator data-probe="indicator" renderBeforeHydration />
      </Tabs.List></Tabs.Root>
      <Slider.Root defaultValue={25} thumbAlignment="edge">
        <Slider.Control class="slider-control"><Slider.Track class="slider-track">
          <Slider.Indicator data-probe="slider-indicator" />
          <Slider.Thumb class="slider-thumb" data-probe="thumb" aria-label="Value" />
        </Slider.Track></Slider.Control>
      </Slider.Root>
      <ScrollArea.Root><ScrollArea.Viewport data-probe="viewport"><p>Scrollable content</p></ScrollArea.Viewport></ScrollArea.Root>
      <Select.Root defaultOpen><Select.Trigger data-probe="select-trigger"><Select.Value /></Select.Trigger>
        <Select.Portal><Select.Positioner><Select.Popup><Select.Item value="a">A</Select.Item></Select.Popup></Select.Positioner></Select.Portal>
      </Select.Root>
    </section>
  </CSPProvider>;
}

export function Fixture(props: FixtureProps) {
  onCleanup(() => props.hooks?.cleanup());
  if (!isServer) onSettled(() => { props.hooks?.ready(); });
  if (props.kind === 'controls') return <Controls {...props} />;
  if (props.kind === 'tabs') return <TabControls {...props} />;
  if (props.kind === 'dialog') return <DialogControls {...props} />;
  if (props.kind === 'detached') return <Detached {...props} />;
  if (props.kind === 'stream' || props.kind === 'error') return <AsyncControls {...props} />;
  return <CSPControls {...props} />;
}
