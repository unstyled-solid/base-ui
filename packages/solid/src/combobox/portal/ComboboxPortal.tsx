import { Show } from 'solid-js';
import type { BaseUIComponentProps } from '../../internals/types';
import type { PortalContainer } from '../../internals/contracts/portal';
import { FloatingPortal, type FloatingPortalProps } from '../../floating-ui-react/components/FloatingPortal';
import { useComboboxRootContext } from '../root/ComboboxRootContext';
import { ComboboxPortalContext } from './ComboboxPortalContext';
export interface ComboboxPortalState {}
export interface ComboboxPortalProps extends FloatingPortalProps {}
export function ComboboxPortal(props: ComboboxPortalProps) {
  const model = useComboboxRootContext();
  return <ComboboxPortalContext value={() => props.keepMounted ?? false}>
    <Show when={model.state.mounted || model.state.forceMounted || props.keepMounted}>
      <FloatingPortal {...props}>{props.children}</FloatingPortal>
    </Show>
  </ComboboxPortalContext>;
}
export namespace ComboboxPortal { export type Props = ComboboxPortalProps; export type State = ComboboxPortalState }
