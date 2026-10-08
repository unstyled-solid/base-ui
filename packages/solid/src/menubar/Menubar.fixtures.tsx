import type { JSX } from '@solidjs/web';
import { omit } from 'solid-js';
import { Menubar, type MenubarProps } from './Menubar';
import * as Menu from '../menu/index.parts';

export type Variant = 'contained' | 'detached' | 'multiple';
type Definition = { name: string; items: string[]; submenu?: string };
const definitions: Definition[] = [
  { name: 'file', items: ['Open', 'Save'], submenu: 'share' },
  { name: 'edit', items: ['Copy', 'Paste'] },
  { name: 'view', items: ['Zoom In', 'Zoom Out'], submenu: 'layout' },
];

function Content(props: { menu?: Definition }) {
  return <Menu.Portal>
    <Menu.Positioner data-testid={`${props.menu?.name}-menu`}>
      <Menu.Popup>
        {props.menu?.items.map((label, index) =>
          <Menu.Item data-testid={`${props.menu?.name}-item-${index + 1}`}>{label}</Menu.Item>)}
        {props.menu?.submenu && <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger data-testid={`${props.menu.submenu}-trigger`}>{props.menu.submenu}</Menu.SubmenuTrigger>
          <Menu.Portal>
            <Menu.Positioner data-testid={`${props.menu.submenu}-menu`}>
              <Menu.Popup>
                {props.menu.submenu === 'layout' ? <Menu.RadioGroup defaultValue="single">
                  <Menu.RadioItem value="single" data-testid="layout-item-1">Single column</Menu.RadioItem>
                  <Menu.RadioItem value="two" data-testid="layout-item-2">Two columns</Menu.RadioItem>
                </Menu.RadioGroup> : <>
                  <Menu.Item data-testid="share-item-1">Email</Menu.Item>
                  <Menu.Item data-testid="share-item-2">Print</Menu.Item>
                </>}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.SubmenuRoot>}
      </Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>;
}

export function TestMenubar(props: MenubarProps & { variant?: Variant }) {
  const hostProps = omit(props, 'variant');
  // Handles are setup-owned; no global mutable menu state.
  const handle = new Menu.Handle<Definition>();
  function Triggers() {
    return definitions.map((menu) => <Menu.Trigger handle={handle} payload={menu} data-testid={`${menu.name}-trigger`}>{menu.name}</Menu.Trigger>);
  }
  function DynamicMenu(props: { children?: JSX.Element }) {
    return <Menu.Root handle={handle}>
      {(state: { payload: Definition | undefined }) => <>{props.children}<Content menu={state.payload} /></>}
    </Menu.Root>;
  }
  return <>
    <Menubar {...hostProps} style={{ display: 'flex', 'max-width': '25vw' }}>
      {props.variant === 'detached' ? <Triggers /> : props.variant === 'multiple' ?
        <DynamicMenu><Triggers /></DynamicMenu> : definitions.map((menu) =>
          <Menu.Root>
            <Menu.Trigger data-testid={`${menu.name}-trigger`}>{menu.name}</Menu.Trigger>
            <Content menu={menu} />
          </Menu.Root>)}
    </Menubar>
    {props.variant === 'detached' && <DynamicMenu />}
  </>;
}
