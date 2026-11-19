import { createMemo, createSignal, merge } from 'solid-js';
import { dynamic, type JSX } from '@solidjs/web';
import * as Public from '../../packages/solid/src';
import inventory from './composition-parts.generated.json';
import { tracePropReads } from './allocationTrace';

// The checker-generated inventory includes aliases. Each distinct implementation
// is mounted in a real family tree; aliases are checked against the same export.
const UI = Public as unknown as Record<string, any>;
type Render = (props: Record<string, any>) => JSX.Element;
type Recipe = (parts: Record<string, any>, props: (name: string) => Record<string, any>) => JSX.Element;
const image = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/%3E';
export const compositionHostClaims: Element[] = [];

export const recipes: Record<string, Recipe> = {
  Accordion: (C, p) => <C.Root defaultValue={['one']} {...p('Root')}><C.Item value="one" {...p('Item')}><C.Header {...p('Header')}><C.Trigger {...p('Trigger')}>Trigger</C.Trigger></C.Header><C.Panel keepMounted {...p('Panel')}>Panel</C.Panel></C.Item></C.Root>,
  Collapsible: (C, p) => <C.Root defaultOpen {...p('Root')}><C.Trigger {...p('Trigger')}>Trigger</C.Trigger><C.Panel keepMounted {...p('Panel')}>Panel</C.Panel></C.Root>,
  Avatar: (C, p) => <C.Root {...p('Root')}><C.Image keepMounted src={p('Fallback').render ? undefined : image} alt="Avatar" {...p('Image')} /><C.Fallback {...p('Fallback')}>Fallback</C.Fallback></C.Root>,
  Checkbox: (C, p) => <C.Root defaultChecked {...p('Root')}>Checkbox<C.Indicator keepMounted {...p('Indicator')}>Checked</C.Indicator></C.Root>,
  Radio: (C, p) => <Public.RadioGroup defaultValue="one"><C.Root value="one" {...p('Root')}>Radio<C.Indicator keepMounted {...p('Indicator')}>Selected</C.Indicator></C.Root></Public.RadioGroup>,
  Switch: (C, p) => <C.Root defaultChecked {...p('Root')}>Switch<C.Thumb {...p('Thumb')}>Thumb</C.Thumb></C.Root>,
  Field: (C, p) => <C.Root invalid {...p('Root')}><C.Item {...p('Item')}><C.Label {...p('Label')}>Label</C.Label><C.Control defaultValue="seed" {...p('Control')} /><C.Description {...p('Description')}>Description</C.Description><C.Error match {...p('Error')}>Error</C.Error></C.Item></C.Root>,
  Fieldset: (C, p) => <C.Root {...p('Root')}><C.Legend {...p('Legend')}>Legend</C.Legend></C.Root>,
  Meter: (C, p) => <C.Root value={40} {...p('Root')}><C.Label {...p('Label')}>Meter</C.Label><C.Track {...p('Track')}><C.Indicator {...p('Indicator')} /></C.Track><C.Value {...p('Value')} /></C.Root>,
  Progress: (C, p) => <C.Root value={40} {...p('Root')}><C.Label {...p('Label')}>Progress</C.Label><C.Track {...p('Track')}><C.Indicator {...p('Indicator')} /></C.Track><C.Value {...p('Value')} /></C.Root>,
  Tabs: (C, p) => <C.Root defaultValue="one" {...p('Root')}><C.List {...p('List')}><C.Tab value="one" {...p('Tab')}>One</C.Tab><C.Indicator {...p('Indicator')} /></C.List><C.Panel value="one" keepMounted {...p('Panel')}>Panel</C.Panel></C.Root>,
  Toolbar: (C, p) => <C.Root {...p('Root')}><C.Group {...p('Group')}><C.Button {...p('Button')}>Button</C.Button><C.Link href="#composition" {...p('Link')}>Link</C.Link><C.Input aria-label="Input" {...p('Input')} /><C.Separator {...p('Separator')} /></C.Group></C.Root>,
  NumberField: (C, p) => <C.Root defaultValue={4} {...p('Root')}><C.Group {...p('Group')}><C.Decrement {...p('Decrement')}>Decrease</C.Decrement><C.Input aria-label="Number" {...p('Input')} /><C.Increment {...p('Increment')}>Increase</C.Increment></C.Group><C.ScrubArea {...p('ScrubArea')}>Scrub<C.ScrubAreaCursor {...p('ScrubAreaCursor')}>Cursor</C.ScrubAreaCursor></C.ScrubArea></C.Root>,
  OTPField: (C, p) => <Public.Field.Root><Public.Field.Label>Code</Public.Field.Label><C.Root length={1} defaultValue="1" {...p('Root')}><C.Input {...p('Input')} /></C.Root></Public.Field.Root>,
  Slider: (C, p) => <C.Root defaultValue={40} {...p('Root')}><C.Label {...p('Label')}>Slider</C.Label><C.Control {...p('Control')}><C.Track {...p('Track')}><C.Indicator {...p('Indicator')} /><C.Thumb {...p('Thumb')} /></C.Track></C.Control><C.Value {...p('Value')} /></C.Root>,
  ScrollArea: (C, p) => <C.Root style={{ width: '120px', height: '80px' }} {...p('Root')}><C.Viewport style={{ width: '120px', height: '80px' }} {...p('Viewport')}><C.Content style={{ width: '400px', height: '400px' }} {...p('Content')}>Scrollable content</C.Content></C.Viewport><C.Scrollbar style={{ width: '12px', height: '80px' }} keepMounted {...p('Scrollbar')}><C.Thumb {...p('Thumb')} /></C.Scrollbar><C.Scrollbar style={{ width: '120px', height: '12px' }} orientation="horizontal" keepMounted><C.Thumb /></C.Scrollbar><C.Corner {...p('Corner')} /></C.Root>,
  Dialog: (C, p) => <C.Root defaultOpen modal={false}><C.Trigger {...p('Trigger')}>Open</C.Trigger><C.Portal keepMounted {...p('Portal')}><C.Backdrop keepMounted {...p('Backdrop')} /><C.Viewport {...p('Viewport')}><C.Popup {...p('Popup')}><C.Title {...p('Title')}>Title</C.Title><C.Description {...p('Description')}>Description</C.Description><C.Close {...p('Close')}>Close</C.Close></C.Popup></C.Viewport></C.Portal></C.Root>,
  Popover: (C, p) => <C.Root defaultOpen modal={false}><C.Trigger {...p('Trigger')}>Open</C.Trigger><C.Portal keepMounted {...p('Portal')}><C.Backdrop keepMounted {...p('Backdrop')} /><C.Positioner {...p('Positioner')}><C.Popup {...p('Popup')}><C.Title {...p('Title')}>Title</C.Title><C.Description {...p('Description')}>Description</C.Description><C.Viewport {...p('Viewport')}>Viewport</C.Viewport><C.Arrow {...p('Arrow')} /><C.Close {...p('Close')}>Close</C.Close></C.Popup></C.Positioner></C.Portal></C.Root>,
  PreviewCard: (C, p) => <C.Root defaultOpen><C.Trigger href="#composition" {...p('Trigger')}>Open</C.Trigger><C.Portal keepMounted {...p('Portal')}><C.Backdrop {...p('Backdrop')} /><C.Positioner {...p('Positioner')}><C.Popup {...p('Popup')}><C.Viewport {...p('Viewport')}>Preview</C.Viewport><C.Arrow {...p('Arrow')} /></C.Popup></C.Positioner></C.Portal></C.Root>,
  Tooltip: (C, p) => <C.Provider><C.Root defaultOpen><C.Trigger {...p('Trigger')}>Tooltip</C.Trigger><C.Portal keepMounted {...p('Portal')}><C.Positioner {...p('Positioner')}><C.Popup {...p('Popup')}><C.Viewport {...p('Viewport')}>Tip</C.Viewport><C.Arrow {...p('Arrow')} /></C.Popup></C.Positioner></C.Portal></C.Root></C.Provider>,
  Select: (C, p) => <C.Root defaultOpen defaultValue="one"><C.Label {...p('Label')}>Select</C.Label><C.Trigger {...p('Trigger')}><C.Value {...p('Value')} /><C.Icon {...p('Icon')}>Icon</C.Icon></C.Trigger><C.Portal keepMounted {...p('Portal')} /><C.Backdrop {...p('Backdrop')} /><C.Positioner alignItemWithTrigger={false} {...p('Positioner')}><C.Popup {...p('Popup')}><C.ScrollUpArrow keepMounted {...p('ScrollUpArrow')}>Up</C.ScrollUpArrow><C.List {...p('List')}><C.Group {...p('Group')}><C.GroupLabel {...p('GroupLabel')}>Group</C.GroupLabel><C.Item value="one" {...p('Item')}><C.ItemText {...p('ItemText')}>One</C.ItemText><C.ItemIndicator keepMounted {...p('ItemIndicator')}>Selected</C.ItemIndicator></C.Item></C.Group><C.Separator {...p('Separator')} /></C.List><C.ScrollDownArrow keepMounted {...p('ScrollDownArrow')}>Down</C.ScrollDownArrow><C.Arrow {...p('Arrow')} /></C.Popup></C.Positioner></C.Root>,
  Combobox: (C, p) => <C.Root defaultOpen multiple defaultValue={['one']} items={['one']}><C.Label {...p('Label')}>Combobox</C.Label><C.InputGroup {...p('InputGroup')}><C.Input aria-label="Combobox" {...p('Input')} /><C.Trigger {...p('Trigger')}>Open</C.Trigger><C.Icon {...p('Icon')}>Icon</C.Icon><C.Clear keepMounted {...p('Clear')}>Clear</C.Clear></C.InputGroup><C.Chips {...p('Chips')}><C.Chip {...p('Chip')}>One<C.ChipRemove {...p('ChipRemove')}>Remove</C.ChipRemove></C.Chip></C.Chips><C.Status {...p('Status')}>Status</C.Status><C.Portal keepMounted {...p('Portal')} /><C.Backdrop {...p('Backdrop')} /><C.Positioner {...p('Positioner')}><C.Popup {...p('Popup')}><C.List {...p('List')}><C.Group {...p('Group')}><C.GroupLabel {...p('GroupLabel')}>Group</C.GroupLabel><C.Row {...p('Row')}><C.Item value="one" {...p('Item')}>One<C.ItemIndicator keepMounted {...p('ItemIndicator')}>Selected</C.ItemIndicator></C.Item></C.Row></C.Group><C.Separator {...p('Separator')} /></C.List><C.Empty {...p('Empty')}>Empty</C.Empty><C.Arrow {...p('Arrow')} /></C.Popup></C.Positioner></C.Root>,
  Menu: (C, p) => <C.Root defaultOpen modal={false}><C.Trigger {...p('Trigger')}>Open</C.Trigger><C.Portal keepMounted {...p('Portal')} /><C.Backdrop {...p('Backdrop')} /><C.Positioner {...p('Positioner')}><C.Popup {...p('Popup')}><C.List {...p('List')}><C.Group {...p('Group')}><C.GroupLabel {...p('GroupLabel')}>Group</C.GroupLabel><C.Item closeOnClick={false} {...p('Item')}>Item</C.Item><C.LinkItem href="#composition" closeOnClick={false} {...p('LinkItem')}>Link</C.LinkItem><C.CheckboxItem defaultChecked closeOnClick={false} {...p('CheckboxItem')}>Check<C.CheckboxItemIndicator keepMounted {...p('CheckboxItemIndicator')}>Checked</C.CheckboxItemIndicator></C.CheckboxItem><C.RadioGroup defaultValue="one" {...p('RadioGroup')}><C.RadioItem value="one" closeOnClick={false} {...p('RadioItem')}>Radio<C.RadioItemIndicator keepMounted {...p('RadioItemIndicator')}>Selected</C.RadioItemIndicator></C.RadioItem></C.RadioGroup></C.Group><C.Separator {...p('Separator')} /><C.SubmenuRoot><C.SubmenuTrigger {...p('SubmenuTrigger')}>Submenu</C.SubmenuTrigger></C.SubmenuRoot></C.List><C.Viewport {...p('Viewport')}>Viewport</C.Viewport><C.Arrow {...p('Arrow')} /></C.Popup></C.Positioner></C.Root>,
  NavigationMenu: (C, p) => <C.Root defaultValue="one" {...p('Root')}><C.List {...p('List')}><C.Item value="one" {...p('Item')}><C.Trigger {...p('Trigger')}>Open<C.Icon {...p('Icon')}>Icon</C.Icon></C.Trigger><C.Content keepMounted {...p('Content')}><C.Link href="#composition" {...p('Link')}>Link</C.Link></C.Content></C.Item></C.List><C.Portal keepMounted {...p('Portal')}><C.Backdrop {...p('Backdrop')} /><C.Positioner {...p('Positioner')}><C.Popup {...p('Popup')}><C.Viewport {...p('Viewport')} /><C.Arrow {...p('Arrow')} /></C.Popup></C.Positioner></C.Portal></C.Root>,
  Drawer: (C, p) => <C.Provider><C.IndentBackground {...p('IndentBackground')}><C.Indent {...p('Indent')}>Background</C.Indent></C.IndentBackground><C.Root defaultOpen={!p('SwipeArea').render} modal={false}><C.Trigger {...p('Trigger')}>Open</C.Trigger><C.SwipeArea {...p('SwipeArea')}>Swipe</C.SwipeArea><C.Portal keepMounted><C.Backdrop {...p('Backdrop')} /><C.Viewport {...p('Viewport')}><C.Popup {...p('Popup')}><C.Content {...p('Content')}>Content</C.Content></C.Popup></C.Viewport></C.Portal></C.Root></C.Provider>,
  Toast: (C, p) => {
    const toast = { id: 'composition-toast', title: 'Title', description: 'Description', timeout: 0 };
    return <C.Provider><C.Portal {...p('Portal')} /><C.Viewport {...p('Viewport')}><C.Root toast={toast} {...p('Root')}><C.Content {...p('Content')}><C.Title {...p('Title')}>Title</C.Title><C.Description {...p('Description')}>Description</C.Description><C.Action {...p('Action')}>Action</C.Action><C.Close {...p('Close')}>Close</C.Close></C.Content></C.Root></C.Viewport><C.Positioner toast={toast} {...p('Positioner')}><C.Arrow {...p('Arrow')} /></C.Positioner></C.Provider>;
  },
};

function tagFor(id: string) {
  if (id === 'Field.Label') return 'label';
  if (id === 'Tabs.Tab') return 'button';
  if (id.endsWith('.Clear')) return 'button';
  if (id === 'Avatar.Image') return 'img';
  if (id.endsWith('.Arrow')) return 'svg';
  if (id === 'Input' || id.endsWith('.Input') || id === 'Field.Control') return 'input';
  if (id.endsWith('.Link') || id.endsWith('.LinkItem') || id === 'PreviewCard.Trigger') return 'a';
  if (id === 'Button' || id === 'Toggle' || /\.(Button|Close|Action|Increment|Decrement|ChipRemove)$/.test(id) || (id.endsWith('.Trigger') && id !== 'ContextMenu.Trigger')) return 'button';
  return 'div';
}

export function resolvePart(name: string): any {
  return name.split('.').reduce((value, key) => value[key], UI);
}

function fixtureFor(id: string) {
  const [familyName, member = 'Root'] = id.split('.');
  let family = familyName;
  let selected = member;
  let components = UI[family];
  if (/^Menu.*Plain$/.test(id)) {
    family = 'Menu'; selected = id.slice(4, -5); components = { ...UI.Menu, [selected]: UI[id] };
  }
  if (family === 'AlertDialog') components = { ...UI.Dialog, Trigger: UI.AlertDialog.Trigger };
  if (family === 'ContextMenu') components = { ...UI.Menu, ...UI.ContextMenu };
  if (family === 'Autocomplete') components = { ...UI.Combobox, ...UI.Autocomplete };
  if (family === 'Combobox' || family === 'Autocomplete') components = { ...components, Label: () => null };
  let recipe = recipes[family === 'AlertDialog' ? 'Dialog' : family === 'ContextMenu' ? 'Menu' : family === 'Autocomplete' ? 'Combobox' : family];
  if (family === 'Menu') recipe = (C, p) => <C.FilterProvider>{recipes.Menu({ ...C,
    Popup: (props: Record<string, any>) => <C.Popup {...props}><C.Input aria-label="Filter" />{props.children}</C.Popup>,
  }, p)}</C.FilterProvider>;
  if (family === 'Menu' && ['Input', 'Clear', 'Empty'].includes(member)) {
    recipe = (C, p) => <C.FilterProvider defaultValue="query"><C.Root defaultOpen modal={false}><C.Trigger>Open</C.Trigger><C.Positioner><C.Popup><C.Input aria-label="Filter" {...p('Input')} /><C.Clear {...p('Clear')}>Clear</C.Clear><C.List /><C.Empty {...p('Empty')}>Empty</C.Empty></C.Popup></C.Positioner></C.Root></C.FilterProvider>;
  }
  if (family === 'ContextMenu') {
    recipe = (C, p) => <C.Root defaultOpen={member !== 'Trigger'}><C.Trigger {...p('Trigger')}>Context target</C.Trigger><C.Positioner><C.Popup><C.Item>Item</C.Item><C.Separator {...p('Separator')} /></C.Popup></C.Positioner></C.Root>;
  }
  if (id === 'Combobox.Label') recipe = (C, p) => <C.Root><UI.Combobox.Label {...p('Label')}>Combobox</UI.Combobox.Label><C.Trigger>Open</C.Trigger></C.Root>;
  return function InventoryPart(options: { reads?: number } = {}) {
    const [revision, setRevision] = createSignal(0);
    const Host = (props: Record<string, any>) => {
      // Shared metadata is read in setup before the native claim, in an owned
      // tracked scope. Never freeze user props or expect strict-read warnings.
      const label = createMemo(() => {
        tracePropReads(() => {
          for (const key of Object.keys(props)) {
            if (key === 'children') continue;
            try { tracePropReads(() => { void props[key]; }, 1); }
            catch (error) { throw new Error(`${id}.${key}: ${String(error)}`); }
          }
        }, options.reads ?? 0);
        return props['data-inventory-revision'];
      });
      const hostProps = merge(props, { get 'data-inventory-read'() { return label(); }, 'data-inventory-host': id,
        get ref() { return [props.ref, (node: Element | null) => { if (node) compositionHostClaims.push(node); }]; },
      });
      switch (tagFor(id)) {
        case 'button': return <button {...hostProps} />;
        case 'input': return <input {...hostProps} />;
        case 'label': return <label {...hostProps} />;
        case 'img': return <img {...hostProps} />;
        case 'a': return <a {...hostProps} />;
        case 'svg': return <svg {...hostProps} />;
        default: return <div {...hostProps} />;
      }
    };
    const advance = (event: Event) => { event.preventDefault(); setRevision((value) => value + 1); };
    const targetProps = {
      id: id === 'Field.Control' ? undefined : `composition-host-${id.replaceAll('.', '-')}`,
      style: { 'min-width': '16px', 'min-height': '16px', display: 'inline-block' },
      render: (props: Record<string, any>) => <Host {...props} />,
      get 'data-inventory-revision'() { return revision(); },
      onClick: advance,
    };
    const p = (name: string) => ({ 'data-inventory-part': name, ...(name === selected ? targetProps : {}) });
    if (recipe) return recipe(components, p);
    const Part = UI[id];
    if (!Part) throw new Error(`Missing component inventory recipe: ${id}`);
    const simpleProps = id === 'Input' ? { defaultValue: 'seed' } : {};
    return <Part {...targetProps} {...simpleProps}>Composition</Part>;
  };
}

// Portal descendants intentionally mount after hydration; native Solid Portal
// has no server host. These paths still receive full browser composition checks.
export function clientMountedPart(id: string) {
  if (id.endsWith('.Portal') || id === 'NumberField.ScrubAreaCursor' || id === 'ScrollArea.Corner' || id === 'Menu.Empty') return true;
  const [family, member] = id.split('.');
  if (['Dialog', 'Popover', 'PreviewCard', 'Tooltip'].includes(family)) return member !== 'Trigger';
  if (family === 'Drawer') return ['Backdrop', 'Content', 'Popup', 'Viewport'].includes(member);
  if (family === 'NavigationMenu') return ['Arrow', 'Backdrop', 'Popup', 'Positioner', 'Viewport'].includes(member);
  return false;
}
export const compositionCases = inventory.parts.map((part) => ({ ...part, clientMounted: clientMountedPart(part.id), Fixture: fixtureFor(part.id) }));
const fixtures = Object.fromEntries(compositionCases.map((part) => [part.id, part.Fixture]));
export function CompositionInventoryFixture(props: { id: string }) {
  const Part = dynamic(() => fixtures[props.id]);
  return <Part />;
}
