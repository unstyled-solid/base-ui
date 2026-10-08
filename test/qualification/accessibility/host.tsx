import { For, Show, createSignal, onSettled } from 'solid-js';
import { render } from '@solidjs/web';
import { Button } from 'baseui-solid2/button';
import { Toggle } from 'baseui-solid2/toggle';
import { Checkbox } from 'baseui-solid2/checkbox';
import { Switch } from 'baseui-solid2/switch';
import { Radio } from 'baseui-solid2/radio';
import { RadioGroup } from 'baseui-solid2/radio-group';
import { Tabs } from 'baseui-solid2/tabs';
import { Accordion } from 'baseui-solid2/accordion';
import { Form } from 'baseui-solid2/form';
import { Field } from 'baseui-solid2/field';
import { Fieldset } from 'baseui-solid2/fieldset';
import { Input } from 'baseui-solid2/input';
import { Dialog } from 'baseui-solid2/dialog';
import { Combobox } from 'baseui-solid2/combobox';
import { Select } from 'baseui-solid2/select';
import { Toast } from 'baseui-solid2/toast';
import { Meter } from 'baseui-solid2/meter';
import { Progress } from 'baseui-solid2/progress';
import { Separator } from 'baseui-solid2/separator';
import { DirectionProvider } from 'baseui-solid2/direction-provider';

declare global {
  interface Window {
    __a11y: { ready: boolean; dispose?: () => void; events: unknown[]; removeItem?: () => void };
  }
}
const query = new URLSearchParams(location.search);
const scene = query.get('scenario');
const direction = query.get('environment') === 'rtl' ? 'rtl' : 'ltr';
document.documentElement.dir = direction;
window.__a11y = { ready: false, events: [] };
const record = (kind: string, value?: unknown) => { window.__a11y.events.push({ kind, value }); };

function Notifications() {
  const manager = Toast.useToastManager();
  return <>
    <Button data-testid="add-low" onClick={() => manager.add({ id: 'low', title: 'Saved', description: 'Changes saved', priority: 'low', timeout: 0 })}>Notify</Button>
    <Button data-testid="add-high" onClick={() => manager.add({ id: 'high', title: 'Failed', description: 'Try again', priority: 'high', timeout: 0 })}>Alert</Button>
    <Toast.Portal><Toast.Viewport data-testid="viewport"><For each={manager.toasts} keyed={(toast) => toast.id}>{(toast) =>
      <Toast.Root toast={toast()} data-testid={`toast-${toast().id}`}><Toast.Content>
        <Toast.Title /><Toast.Description /><Toast.Close aria-label="Dismiss notification">Dismiss</Toast.Close>
      </Toast.Content></Toast.Root>
    }</For></Toast.Viewport></Toast.Portal>
  </>;
}

function Fixture() {
  onSettled(() => { window.__a11y.ready = true; });
  const [middle, setMiddle] = createSignal(true);
  const [items, setItems] = createSignal(['apple', 'banana', 'cherry']);
  // Test driver removes a highlighted item without moving focus to a separate button.
  window.__a11y.removeItem = () => { setMiddle(false); setItems(['apple', 'cherry']); };
  switch (scene) {
    case 'button': return <>
      <Button data-testid="disabled" disabled onClick={() => record('disabled')}>Disabled save</Button>
      <Button data-testid="control" onClick={() => record('activate')}>Save</Button>
      <Button data-testid="custom" nativeButton={false} render={(props) => <span {...props} />}
        onClick={() => record('custom')}>Custom save</Button>
    </>;
    case 'toggle': return <>
      <Toggle data-testid="control">Bold</Toggle>
      <Toggle data-testid="cancel" onPressedChange={(_, details) => { details.cancel(); record('cancel'); }}>Canceled</Toggle>
      <Toggle data-testid="disabled" disabled>Disabled bold</Toggle>
    </>;
    case 'checks': return <>
      <Checkbox.Root data-testid="checkbox" aria-label="Accept terms" required><Checkbox.Indicator>✓</Checkbox.Indicator></Checkbox.Root>
      <Switch.Root data-testid="switch" aria-label="Notifications"><Switch.Thumb /></Switch.Root>
      <Checkbox.Root data-testid="readonly-check" aria-label="Readonly terms" readOnly />
      <Switch.Root data-testid="readonly-switch" aria-label="Readonly notifications" readOnly />
      <Checkbox.Root data-testid="disabled-check" aria-label="Disabled terms" disabled />
      <Switch.Root data-testid="disabled-switch" aria-label="Disabled notifications" disabled />
    </>;
    case 'radio': return <>
      <RadioGroup data-testid="group" aria-label="Fruit" defaultValue="apple">
        <Radio.Root value="apple" data-testid="apple" aria-label="Apple" />
        <Radio.Root value="banana" data-testid="banana" aria-label="Banana" />
        <Radio.Root value="cherry" data-testid="cherry" aria-label="Cherry" />
      </RadioGroup>
      <RadioGroup aria-label="Unselected fruit"><Radio.Root value="orange" data-testid="unselected-radio" aria-label="Orange" /></RadioGroup>
      <RadioGroup data-testid="readonly-group" aria-label="Readonly fruit" readOnly>
        <Radio.Root value="pear" data-testid="readonly-radio" aria-label="Pear" />
      </RadioGroup>
      <RadioGroup data-testid="disabled-group" aria-label="Disabled fruit" disabled>
        <Radio.Root value="plum" data-testid="disabled-radio" aria-label="Plum" />
      </RadioGroup>
    </>;
    case 'tabs': return <Tabs.Root defaultValue="a">
      <Tabs.List aria-label="Sections" activateOnFocus={false}>
        <Tabs.Tab value="a" data-testid="tab-a">Overview</Tabs.Tab>
        <Show when={middle()}><Tabs.Tab value="b" data-testid="tab-b">Details</Tabs.Tab></Show>
        <Tabs.Tab value="disabled" data-testid="tab-disabled" disabled>Unavailable</Tabs.Tab>
        <Tabs.Tab value="c" data-testid="tab-c">History</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="a" data-testid="panel-a">Overview content</Tabs.Panel>
      <Tabs.Panel value="b">Details content</Tabs.Panel><Tabs.Panel value="c">History content</Tabs.Panel>
    </Tabs.Root>;
    case 'accordion': return <Accordion.Root>
      <Accordion.Item value="a"><Accordion.Header><Accordion.Trigger data-testid="control">Shipping</Accordion.Trigger></Accordion.Header>
        <Accordion.Panel data-testid="panel">Ships tomorrow</Accordion.Panel></Accordion.Item>
      <Accordion.Item value="b" disabled><Accordion.Header><Accordion.Trigger data-testid="disabled">Disabled section</Accordion.Trigger></Accordion.Header>
        <Accordion.Panel>Unavailable</Accordion.Panel></Accordion.Item>
    </Accordion.Root>;
    case 'form': return <Form onSubmit={(event) => { event.preventDefault(); record('submit'); }}>
      <Fieldset.Root><Fieldset.Legend>Account</Fieldset.Legend>
        <Field.Root name="custom" validate={(value) => value === 'ok' ? null : 'Use ok'}>
          <Field.Label>Custom name</Field.Label><Field.Control data-testid="control" defaultValue="bad" />
          <Field.Description>Enter ok</Field.Description><Field.Error data-testid="custom-error" />
        </Field.Root>
        <Field.Root name="required"><Field.Label>Required name</Field.Label><Field.Control data-testid="required" required />
          <Field.Error data-testid="required-error" /></Field.Root>
        <label for="readonly">Readonly name</label><Input id="readonly" data-testid="readonly" readonly defaultValue="fixed" />
        <label for="disabled">Disabled name</label><Input id="disabled" data-testid="disabled" disabled defaultValue="fixed" />
        <Button type="submit" data-testid="submit">Submit</Button>
      </Fieldset.Root>
    </Form>;
    case 'dialog': return <Dialog.Root>
      <Dialog.Trigger data-testid="control">Open account</Dialog.Trigger>
      <Dialog.Portal><Dialog.Backdrop /><Dialog.Popup data-testid="outer">
        <Dialog.Title>Account settings</Dialog.Title><Dialog.Description>Edit account settings</Dialog.Description>
        <input aria-label="Account name" data-testid="outer-input" />
        <Dialog.Root><Dialog.Trigger data-testid="inner-trigger">Open confirmation</Dialog.Trigger>
          <Dialog.Portal><Dialog.Backdrop /><Dialog.Popup data-testid="inner">
            <Dialog.Title>Confirm change</Dialog.Title><Dialog.Description>Review change</Dialog.Description>
            <input aria-label="Confirmation" data-testid="inner-input" /><Dialog.Close>Close confirmation</Dialog.Close>
          </Dialog.Popup></Dialog.Portal>
        </Dialog.Root><Dialog.Close>Close account</Dialog.Close>
      </Dialog.Popup></Dialog.Portal>
    </Dialog.Root>;
    case 'combobox': return <Combobox.Root items={items()} onValueChange={(value) => record('value', value)}>
      <Combobox.Input aria-label="Choose fruit" data-testid="control" />
      <Combobox.Portal><Combobox.Positioner><Combobox.Popup data-testid="popup">
        <Combobox.List>{(item: string) => <Combobox.Item value={item} data-testid={item}>{item}</Combobox.Item>}</Combobox.List>
      </Combobox.Popup></Combobox.Positioner></Combobox.Portal>
    </Combobox.Root>;
    case 'select': return <Select.Root defaultValue="apple" onValueChange={(value) => record('value', value)}>
      <Select.Trigger aria-label="Choose fruit" data-testid="control"><Select.Value /></Select.Trigger>
      <Select.Portal><Select.Positioner alignItemWithTrigger={false}><Select.Popup data-testid="popup">
        <Select.Item value="apple">Apple</Select.Item><Select.Item value="banana">Banana</Select.Item>
      </Select.Popup></Select.Positioner></Select.Portal>
    </Select.Root>;
    case 'toast': return <Toast.Provider><Notifications /></Toast.Provider>;
    case 'ranges': return <>
      <Progress.Root value={40} aria-label="Upload" data-testid="progress"><Progress.Track><Progress.Indicator /></Progress.Track></Progress.Root>
      <Meter.Root value={60} min={0} max={100} aria-label="Storage" data-testid="meter"><Meter.Track><Meter.Indicator /></Meter.Track></Meter.Root>
      <Separator data-testid="separator" orientation="vertical" />
    </>;
    default: throw new Error(`Unknown accessibility fixture ${scene}`);
  }
}
window.__a11y.dispose = render(() => <DirectionProvider direction={direction}>
  <button data-testid="before">Before fixture</button><main aria-label="Qualification fixture"><Fixture /></main>
  <button data-testid="after">After fixture</button>
</DirectionProvider>, document.getElementById('fixture')!);
