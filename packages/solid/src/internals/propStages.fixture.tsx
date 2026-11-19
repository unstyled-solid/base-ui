import { createMemo, createSignal, omit } from 'solid-js';
import { dynamic, type JSX } from '@solidjs/web';
import { Button } from '../button';
import { Toggle } from '../toggle';
import { Popover } from '../popover';
import { Dialog } from '../dialog';
import { Collapsible } from '../collapsible';
import { Accordion } from '../accordion';
import { Tabs } from '../tabs';
import { Toolbar } from '../toolbar';
import { Field } from '../field';
import { Checkbox } from '../checkbox';
import { Switch } from '../switch';
import { Radio } from '../radio';
import { RadioGroup } from '../radio-group';
import { Select } from '../select';
import { Combobox } from '../combobox';
import { NumberField } from '../number-field';
import { Menu } from '../menu';
import { Separator } from '../separator';
import { mergeProps } from '../merge-props';

type Props = Record<string, any>;
type Render = (props: Props) => JSX.Element;

// One real consumer of each distinct composition path, including validation,
// descriptions, composite/menu item stages, propGetter and ordinary prop bags.
// These supplement, rather than replace, each family's behavioral suite.
export const propStageParts: Record<string, (render: Render) => JSX.Element> = {
  Button: (render) => <Button render={render}>Button</Button>,
  Toggle: (render) => <Toggle render={render}>Toggle</Toggle>,
  PopoverTrigger: (render) => <Popover.Root><Popover.Trigger render={render}>Popover</Popover.Trigger></Popover.Root>,
  DialogTrigger: (render) => <Dialog.Root><Dialog.Trigger render={render}>Dialog</Dialog.Trigger></Dialog.Root>,
  CollapsibleTrigger: (render) => <Collapsible.Root><Collapsible.Trigger render={render}>Collapsible</Collapsible.Trigger></Collapsible.Root>,
  AccordionTrigger: (render) => <Accordion.Root><Accordion.Item value="item"><Accordion.Header><Accordion.Trigger render={render}>Accordion</Accordion.Trigger></Accordion.Header><Accordion.Panel>Panel</Accordion.Panel></Accordion.Item></Accordion.Root>,
  TabsTab: (render) => <Tabs.Root defaultValue="one"><Tabs.List><Tabs.Tab value="one">One</Tabs.Tab><Tabs.Tab value="two" render={render}>Two</Tabs.Tab></Tabs.List><Tabs.Panel value="two">Panel</Tabs.Panel></Tabs.Root>,
  ToolbarButton: (render) => <Toolbar.Root><Toolbar.Button render={render}>Toolbar</Toolbar.Button></Toolbar.Root>,
  FieldControl: (render) => <Field.Root invalid><Field.Label>Field</Field.Label><Field.Control render={render} defaultValue="seed" /><Field.Description>Description</Field.Description></Field.Root>,
  Checkbox: (render) => <Field.Root><Checkbox.Root render={render} aria-label="Checkbox">Checkbox</Checkbox.Root><Field.Description>Description</Field.Description></Field.Root>,
  Switch: (render) => <Field.Root><Switch.Root render={render} aria-label="Switch">Switch</Switch.Root><Field.Description>Description</Field.Description></Field.Root>,
  Radio: (render) => <RadioGroup defaultValue="one"><Radio.Root value="one" aria-label="One">One</Radio.Root><Radio.Root value="two" render={render} aria-label="Two">Two</Radio.Root></RadioGroup>,
  SelectTrigger: (render) => <Select.Root><Select.Trigger render={render}>Select</Select.Trigger></Select.Root>,
  ComboboxTrigger: (render) => <Combobox.Root><Combobox.Trigger render={render}>Combobox</Combobox.Trigger></Combobox.Root>,
  NumberFieldIncrement: (render) => <NumberField.Root defaultValue={1}><NumberField.Input /><NumberField.Increment render={render}>Increment</NumberField.Increment></NumberField.Root>,
  MenuTrigger: (render) => <Menu.Root><Menu.Trigger render={render}>Menu</Menu.Trigger></Menu.Root>,
  MenuItem: (render) => <Menu.Root defaultOpen><Menu.Trigger>Open</Menu.Trigger><Menu.Positioner><Menu.Popup><Menu.Item closeOnClick={false} render={render}>Item</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Root>,
  Separator: (render) => <Separator render={render} />,
};

/** Children can construct JSX; they are not scalar props to eagerly materialize.
 * Reading event/ref values is fine, but invoking them would perform an action.
 */
export function readStageProps(props: Props, count: number) {
  for (let iteration = 0; iteration < count; iteration += 1) {
    for (const key of Object.keys(props)) {
      if (key !== 'children') void props[key];
    }
  }
}

function ButtonHost(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  const rest = omit(props, 'children');
  const type = createMemo(() => props.type ?? 'button');
  return <button {...rest} type={type()} data-button-type={type()} data-composed-host="">{props.children}</button>;
}
function InputHost(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const type = createMemo(() => props.type ?? 'text');
  return <input {...props} type={type()} data-input-type={type()} data-composed-host="" />;
}
function DivHost(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const role = createMemo(() => props.role);
  return <div {...props} role={role()} data-host-role={role()} data-composed-host="" />;
}

const componentHostParts = Object.fromEntries(Object.entries(propStageParts).map(([name, Part]) => [name,
  () => {
    const [events, setEvents] = createSignal(0);
    const change = () => setEvents((count) => count + 1);
    const render = (input: Props) => {
      const hostProps = mergeProps<any>(input, {
        get 'data-revision'() { return events(); },
        ...(name === 'FieldControl' ? { onInput: change } : { onClick: change }),
      });
      return name === 'FieldControl' ? <InputHost {...hostProps} /> : ['Separator', 'Checkbox', 'Switch', 'Radio', 'MenuItem'].includes(name)
        ? <DivHost {...hostProps} /> : <ButtonHost {...hostProps} />;
    };
    return <>{Part(render)}<button data-update="" onClick={change}>Update</button><output data-events="">{events()}</output></>;
  },
]));

export function PropStageHydrationFixture(props: { part: string }) {
  const Part = dynamic(() => componentHostParts[props.part]);
  return <Part />;
}
