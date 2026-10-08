import { omit, Show } from 'solid-js';
import { FloatingPortalLite } from '../../utils/FloatingPortalLite';
import type { BaseUIComponentProps } from '../../internals/contracts/render';
import type { PortalContainer } from '../../internals/contracts/portal';
import { usePreviewCardRootContext } from '../root/PreviewCardContext';
import { PreviewCardPortalContext } from './PreviewCardPortalContext';

export function PreviewCardPortal(props: PreviewCardPortal.Props) {
  const store = usePreviewCardRootContext();
  const portalProps = omit(props, 'keepMounted');
  return (
    <Show when={store.state.mounted || props.keepMounted}>
      <PreviewCardPortalContext value={() => props.keepMounted ?? false}>
        <FloatingPortalLite {...portalProps} />
      </PreviewCardPortalContext>
    </Show>
  );
}
export interface PreviewCardPortalState {}
export interface PreviewCardPortalProps extends BaseUIComponentProps<'div', PreviewCardPortalState> {
  keepMounted?: boolean;
  container?: PortalContainer;
}
export namespace PreviewCardPortal {
  export type State = PreviewCardPortalState;
  export type Props = PreviewCardPortalProps;
}
