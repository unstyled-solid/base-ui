import { createSignal, createUniqueId } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { MenuRoot } from '../../menu/root/MenuRoot';
import { MenuRootContext } from '../../menu/root/MenuRootContext';
import { ContextMenuRootContext } from './ContextMenuRootContext';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';
import { ownerWindow } from '../../utils/owner';

/** Creates a context menu activated by right clicking or long pressing. */
export function ContextMenuRoot(props: ContextMenuRootProps) {
  const positionerRef: ContextMenuRootContext['positionerRef'] = { current: null };
  const [anchor, setAnchor] = createSignal<ContextMenuRootContext['anchor']>({
    getBoundingClientRect() {
      return ownerWindow(positionerRef.current).DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 });
    },
  });
  const context: ContextMenuRootContext = {
    get anchor() { return anchor(); },
    setAnchor,
    actionsRef: { current: null },
    backdropRef: { current: null },
    internalBackdropRef: { current: null },
    positionerRef,
    allowMouseUpTriggerRef: { current: true },
    initialCursorPointRef: { current: null },
    rootId: createUniqueId(),
  };
  return (
    <ContextMenuRootContext value={context}>
      <MenuRootContext value={null}>
        <MenuRoot {...props} />
      </MenuRootContext>
    </ContextMenuRootContext>
  );
}

export interface ContextMenuRootState {}
export interface ContextMenuRootProps extends Omit<MenuRoot.Props,
  'handle' | 'triggerId' | 'defaultTriggerId' | 'modal' | 'openOnHover' | 'delay' |
  'closeDelay' | 'closeParentOnEsc' | 'onOpenChange' | 'children'> {
  onOpenChange?: (open: boolean, eventDetails: ContextMenuRootChangeEventDetails) => void;
  /** @deprecated This prop has no effect on Context Menu. */
  closeParentOnEsc?: MenuRoot.Props['closeParentOnEsc'];
  children?: JSX.Element;
}
export type ContextMenuRootHighlightItemTarget = MenuRoot.HighlightItemTarget;
export interface ContextMenuRootActions {
  unmount: () => void;
  close: () => void;
  highlightItem: (target: ContextMenuRootHighlightItemTarget) => void;
}
export type ContextMenuRootChangeEventReason = MenuRoot.ChangeEventReason;
export type ContextMenuRootChangeEventDetails = BaseUIChangeEventDetails<ContextMenuRootChangeEventReason>;
export namespace ContextMenuRoot {
  export type State = ContextMenuRootState;
  export type Props = ContextMenuRootProps;
  export type Actions = ContextMenuRootActions;
  export type HighlightItemTarget = ContextMenuRootHighlightItemTarget;
  export type ChangeEventReason = ContextMenuRootChangeEventReason;
  export type ChangeEventDetails = ContextMenuRootChangeEventDetails;
}
