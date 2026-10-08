import { createSignal, onCleanup, omit } from 'solid-js';
import type { JSX } from '@solidjs/web';
import { FloatingNode, FloatingTree, createFloatingNodeId, useFloatingTree } from '../floating-ui-react/components/FloatingTree';
import { CompositeRoot } from '../internals/composite';
import { createBaseUiId } from '../internals/createBaseUiId';
import type { BaseUIComponentProps, HTMLProps, StateAttributesMapping } from '../internals/types';
import { REASONS } from '../internals/reasons';
import type { MenuOpenEventDetails } from '../menu/utils/types';
import type { MenuTreeEvents } from '../menu/utils/MenuTreeEvents';
import { MenubarContext, useMenubarContext } from './MenubarContext';
import * as MenubarDataAttributes from './MenubarDataAttributes';

const stateAttributesMapping: StateAttributesMapping<MenubarState> = {
  hasSubmenuOpen: (value) => value ? { [MenubarDataAttributes.hasSubmenuOpen]: '' } : null,
};

/** The container for menus. Roving focus is owned by the shared composite. */
export function Menubar(props: MenubarProps): JSX.Element {
  const local = props;
  const elementProps = omit(props,
    'orientation', 'loopFocus', 'render', 'class', 'style', 'modal', 'disabled', 'id', 'ref',
  );
  const [contentElement, setContentElement] = createSignal<HTMLElement | null>(null);
  const [hasSubmenuOpen, setHasSubmenuOpen] = createSignal(false);
  const generatedId = createBaseUiId(() => typeof local.id === 'string' ? local.id : undefined);
  const id = () => local.id === null || local.id === false ? undefined : generatedId();
  const state: MenubarState = {
    get orientation() { return local.orientation ?? 'horizontal'; },
    get modal() { return local.modal ?? true; },
    get hasSubmenuOpen() { return hasSubmenuOpen(); },
  };
  const context: MenubarContext = {
    get contentElement() { return contentElement(); },
    setContentElement,
    get hasSubmenuOpen() { return hasSubmenuOpen(); },
    setHasSubmenuOpen,
    get modal() { return state.modal; },
    get disabled() { return local.disabled ?? false; },
    get orientation() { return state.orientation; },
    allowMouseUpTriggerRef: { current: false },
    get rootId() { return id(); },
  };

  return (
    <MenubarContext value={context}>
      <FloatingTree>
        <MenubarContent>
          <CompositeRoot
            render={local.render}
            class={local.class}
            style={local.style}
            state={state}
            stateAttributesMapping={stateAttributesMapping}
            refs={[local.ref, setContentElement]}
            props={[{ role: 'menubar', get id() { return id(); }, get 'aria-orientation'() { return state.orientation; } }, elementProps]}
            orientation={state.orientation}
            loopFocus={local.loopFocus ?? true}
            enableHomeAndEndKeys
            stopEventPropagation
            highlightItemOnHover={hasSubmenuOpen()}
          />
        </MenubarContent>
      </FloatingTree>
    </MenubarContext>
  );
}

function MenubarContent(props: { children?: JSX.Element }): JSX.Element {
  const nodeId = createFloatingNodeId();
  const tree = useFloatingTree<MenuTreeEvents>();
  const context = useMenubarContext();
  // Subscribe during setup, before a default-open child can publish. Cleanup belongs
  // to this owner, never to a ref callback or a reactive context snapshot.
  function onSubmenuOpenChange(details: MenuOpenEventDetails) {
    if (!details.nodeId || details.parentNodeId !== nodeId()) return;
    if (details.open) {
      context.setHasSubmenuOpen(true);
    } else if (details.reason !== REASONS.siblingOpen && details.reason !== REASONS.listNavigation) {
      context.setHasSubmenuOpen(false);
    }
  }
  tree?.events.on('menuopenchange', onSubmenuOpenChange);
  onCleanup(() => tree?.events.off('menuopenchange', onSubmenuOpenChange));
  return <FloatingNode id={nodeId()}>{props.children}</FloatingNode>;
}

export interface MenubarState {
  orientation: 'horizontal' | 'vertical';
  modal: boolean;
  hasSubmenuOpen: boolean;
}
export interface MenubarProps extends BaseUIComponentProps<'div', MenubarState, HTMLProps<HTMLDivElement>> {
  /** Whether menus are modal. @default true */
  modal?: boolean;
  /** Whether all menus are disabled. @default false */
  disabled?: boolean;
  /** The menubar's orientation. @default 'horizontal' */
  orientation?: MenubarState['orientation'];
  /** Wrap arrow-key focus at either end. @default true */
  loopFocus?: boolean;
}
export namespace Menubar {
  export type State = MenubarState;
  export type Props = MenubarProps;
}
