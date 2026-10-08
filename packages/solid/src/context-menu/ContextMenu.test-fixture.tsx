import type { JSX } from '@solidjs/web';
import { ContextMenu } from './index';
import type { ContextMenuRootProps, ContextMenuTriggerProps, ContextMenuPositionerProps } from './index';

export function ContextMenuFixture(props: {
  root?: ContextMenuRootProps;
  trigger?: ContextMenuTriggerProps;
  positioner?: ContextMenuPositionerProps;
  children?: JSX.Element;
}) {
  return (
    <ContextMenu.Root {...props.root}>
      <ContextMenu.Trigger data-testid="trigger" {...props.trigger}>Surface</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Backdrop data-testid="backdrop" />
        <ContextMenu.Positioner data-testid="positioner" {...props.positioner}>
          <ContextMenu.Popup data-testid="popup">
            {props.children ?? <ContextMenu.Item data-testid="item">Action</ContextMenu.Item>}
          </ContextMenu.Popup>
        </ContextMenu.Positioner>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
}
