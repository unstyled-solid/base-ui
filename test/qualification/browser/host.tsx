import { createSignal, onCleanup, onSettled } from 'solid-js';
import { render } from '@solidjs/web';
import type { JSX } from '@solidjs/web';
import { Button } from '../../../packages/solid/src/button';
import { Toggle } from '../../../packages/solid/src/toggle';
import { Form } from '../../../packages/solid/src/form';
import { Field } from '../../../packages/solid/src/field';
import { Dialog } from '../../../packages/solid/src/dialog';
import { Select } from '../../../packages/solid/src/select';
import { Combobox } from '../../../packages/solid/src/combobox';
import { Tooltip } from '../../../packages/solid/src/tooltip';
import { scenario, record, change, submitted } from './protocol';

function CaptureSpan(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  let element: HTMLSpanElement | undefined;
  const capture = () => record('capture-click');
  onCleanup(() => element?.removeEventListener('click', capture, true));
  return <span {...props} ref={[props.ref, (node) => { element = node; node.addEventListener('click', capture, true); }]}
    onClick={(event) => {
      record('render-click');
      const handler = props.onClick;
      if (typeof handler === 'function') handler(event);
      else if (handler) handler[0](handler[1], event);
    }} />;
}

function PointerDownDialog() {
  const [open, setOpen] = createSignal(false);
  return <><button type="button" data-testid="trigger" onPointerDown={() => setOpen(true)}>Open</button>
    <Dialog.Root open={open()} onOpenChange={(value, details) => { record('open', value, details); setOpen(value); }}>
      <Dialog.Portal><Dialog.Backdrop data-testid="backdrop" />
        <Dialog.Popup data-testid="popup">Dialog</Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root></>;
}

function Fixture() {
  onSettled(() => { window.__qualification.ready = true; });
  switch (scenario) {
    case 'button':
    case 'button-custom':
    case 'button-disabled':
      return <div onClick={() => record('ancestor-click')}>
        <Button data-testid="trigger" disabled={scenario === 'button-disabled'}
          focusableWhenDisabled={scenario === 'button-disabled'}
          nativeButton={scenario !== 'button-custom'}
          render={scenario === 'button-custom' ? (props) => <CaptureSpan {...props} /> : undefined}
          onClick={() => record('button-click')}>Save</Button>
      </div>;
    case 'toggle':
    case 'toggle-cancel':
      return <Toggle data-testid="trigger" defaultPressed={false}
        onPressedChange={change('pressed', scenario === 'toggle-cancel')}
        onClick={() => record('toggle-click')}>Bold</Toggle>;
    case 'form':
      return <Form data-testid="form" onSubmit={submitted} onFormSubmit={change('form-submit')}>
        <Field.Root name="name"><Field.Label>Name</Field.Label>
          <Field.Control data-testid="input" required /><Field.Error data-testid="error" /></Field.Root>
        <button type="submit" data-testid="submit">Submit</button>
      </Form>;
    case 'dialog-pointerdown': return <PointerDownDialog />;
    case 'dialog':
    case 'dialog-cancel':
      return <Dialog.Root onOpenChange={change('open', scenario === 'dialog-cancel')}
        onOpenChangeComplete={(open) => record('open-complete', open)}>
        <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
        <Dialog.Portal><Dialog.Backdrop data-testid="backdrop" />
          <Dialog.Popup data-testid="popup"><Dialog.Title>Example</Dialog.Title>
            <Dialog.Description>Dialog content</Dialog.Description>
            <Dialog.Close data-testid="close">Close</Dialog.Close>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>;
    case 'select':
    case 'select-cancel':
      return <form data-testid="form"><Select.Root name="choice" defaultValue="a"
        onOpenChange={change('open', scenario === 'select-cancel')}
        onValueChange={change('value')}>
        <Select.Trigger data-testid="trigger"><Select.Value data-testid="value" /></Select.Trigger>
        <Select.Portal><Select.Positioner alignItemWithTrigger={false}>
          <Select.Popup data-testid="popup"><Select.Item value="a">a</Select.Item>
            <Select.Item value="b">b</Select.Item></Select.Popup>
        </Select.Positioner></Select.Portal>
      </Select.Root></form>;
    case 'combobox':
    case 'combobox-escape':
      return <form data-testid="form"><Combobox.Root name="fruit" items={['apple', 'banana', 'cherry']}
        defaultOpen={scenario === 'combobox-escape'}
        onOpenChange={change('open')} onValueChange={change('value')} onInputValueChange={change('input')}>
        <Combobox.Input data-testid="input" />
        <Combobox.Portal><Combobox.Positioner><Combobox.Popup data-testid="popup">
          <Combobox.List>{(item: string) => <Combobox.Item value={item}>{item}</Combobox.Item>}</Combobox.List>
        </Combobox.Popup></Combobox.Positioner></Combobox.Portal>
      </Combobox.Root></form>;
    case 'tooltip':
      return <><Tooltip.Root onOpenChange={change('open')}>
        <Tooltip.Trigger data-testid="trigger" delay={0} closeDelay={0}>Help</Tooltip.Trigger>
        <Tooltip.Portal><Tooltip.Positioner><Tooltip.Popup data-testid="popup">Helpful text</Tooltip.Popup>
        </Tooltip.Positioner></Tooltip.Portal>
      </Tooltip.Root><button data-testid="after">After</button></>;
    default: throw new Error(`Unknown qualification scenario: ${scenario}`);
  }
}
window.__qualification.dispose = render(() => <Fixture />, document.getElementById('fixture')!);
