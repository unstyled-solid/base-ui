import { omit } from 'solid-js';
import type { BaseUIComponentProps, PortalContainer } from '../../internals/types';
import { FloatingPortal } from '../../floating-ui-react/components/FloatingPortal';
import { InternalBackdrop } from '../../utils/InternalBackdrop';
import { useDialogRootContext } from '../root/DialogRootContext';
import { DialogPortalContext } from './DialogPortalContext';

export function DialogPortal(props: DialogPortalProps) {
  const store = useDialogRootContext();
  const portalProps = omit(props, 'keepMounted', 'children');
  return <>{(store.state.mounted || props.keepMounted) &&
    <DialogPortalContext value={() => props.keepMounted ?? false}>
      <FloatingPortal {...portalProps}>
        {store.state.mounted && store.state.modal === true &&
          <InternalBackdrop ref={store.setInternalBackdropElement} inert={!store.state.open} />}
        {props.children}
      </FloatingPortal>
    </DialogPortalContext>
  }</>;
}
export interface DialogPortalState {}
export interface DialogPortalProps extends BaseUIComponentProps<'div', DialogPortalState> { keepMounted?: boolean; container?: PortalContainer; id?: string }
export namespace DialogPortal { export type Props = DialogPortalProps; export type State = DialogPortalState; }
