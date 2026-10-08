import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@base-ui/react/button';
import { Toggle } from '@base-ui/react/toggle';
import { Form } from '@base-ui/react/form';
import { Field } from '@base-ui/react/field';
import { Dialog } from '@base-ui/react/dialog';
import { Select } from '@base-ui/react/select';
import { Combobox } from '@base-ui/react/combobox';
import { Tooltip } from '@base-ui/react/tooltip';
import { scenario, record, change, submitted } from '../browser/protocol';

// Independently rendered React source components; no Solid implementation or expected DOM imported.
function PointerDownDialog() {
  const [open, setOpen] = React.useState(false);
  return <><button type="button" data-testid="trigger" onPointerDown={() => setOpen(true)}>Open</button>
    <Dialog.Root open={open} onOpenChange={(value, details) => { record('open', value, details); setOpen(value); }}>
      <Dialog.Portal><Dialog.Backdrop data-testid="backdrop" />
        <Dialog.Popup data-testid="popup">Dialog</Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root></>;
}

function Fixture() {
  React.useEffect(() => { window.__qualification.ready = true; }, []);
  switch (scenario) {
    case 'button':
    case 'button-custom':
    case 'button-disabled':
      return <div onClick={() => record('ancestor-click')}>
        <Button data-testid="trigger" disabled={scenario === 'button-disabled'}
          focusableWhenDisabled={scenario === 'button-disabled'}
          nativeButton={scenario !== 'button-custom'}
          render={scenario === 'button-custom' ? <span onClick={() => record('render-click')}
            onClickCapture={() => record('capture-click')} /> : undefined}
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
          <Combobox.List>{(item) => <Combobox.Item key={item} value={item}>{item}</Combobox.Item>}</Combobox.List>
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
const element = document.getElementById('fixture');
if (!element) throw new Error('Missing qualification fixture mount');
const root = createRoot(element);
root.render(<Fixture />);
window.__qualification.dispose = () => root.unmount();
