import { createContext, useContext } from 'solid-js';
import type { MutableCell } from '../../internals/contracts/core';
import type { BaseUIChangeEventDetails } from '../../internals/createBaseUIEventDetails';

/** Menu-owned host seams. Public hosts provide these exact contexts. */
export interface ContextMenuRootContext {
  anchor: { getBoundingClientRect(): DOMRect };
  setAnchor: (value: ContextMenuRootContext['anchor'] | ((previous: ContextMenuRootContext['anchor']) => ContextMenuRootContext['anchor'])) => void;
  backdropRef: MutableCell<HTMLDivElement | null>;
  internalBackdropRef: MutableCell<HTMLDivElement | null>;
  actionsRef: MutableCell<{ setOpen(open: boolean, details: BaseUIChangeEventDetails<string>): void } | null>;
  positionerRef: MutableCell<HTMLElement | null>;
  allowMouseUpTriggerRef: MutableCell<boolean>;
  initialCursorPointRef: MutableCell<{ x: number; y: number } | null>;
  rootId: string | undefined;
}
export const ContextMenuRootContext = createContext<ContextMenuRootContext | null>(null);
export function useContextMenuRootContext(optional: false): ContextMenuRootContext;
export function useContextMenuRootContext(optional?: true): ContextMenuRootContext | null;
export function useContextMenuRootContext(optional = true) {
  const context = useContext(ContextMenuRootContext);
  if (!context && !optional) throw new Error('Base UI: ContextMenuRootContext is missing. ContextMenu parts must be placed within <ContextMenu.Root>.');
  return context;
}

export interface MenubarContext {
  modal: boolean;
  disabled: boolean;
  contentElement: HTMLElement | null;
  setContentElement(element: HTMLElement | null): void;
  hasSubmenuOpen: boolean;
  setHasSubmenuOpen(open: boolean): void;
  orientation: 'horizontal' | 'vertical';
  allowMouseUpTriggerRef: MutableCell<boolean>;
  rootId: string | undefined;
}
export const MenubarContext = createContext<MenubarContext | null>(null);
export function useMenubarContext(optional?: false): MenubarContext;
export function useMenubarContext(optional: true): MenubarContext | null;
export function useMenubarContext(optional = false) {
  const context = useContext(MenubarContext);
  if (!context && !optional) throw new Error('Base UI: MenubarContext is missing. Menubar parts must be placed within <Menubar>.');
  return context;
}
