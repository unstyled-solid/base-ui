import { createContext, useContext } from 'solid-js';
import type { FloatingRootContext, FloatingTreeType, LogicalLayer } from '../../internals/contracts/floating';
import type { TransitionStatus } from '../../internals/contracts/core';
import type { NavigationMenuRoot } from './NavigationMenuRoot';

export interface NavigationMenuRootContext<Value = any> {
  readonly value: Value | null;
  readonly open: boolean;
  readonly mounted: boolean;
  readonly transitionStatus: TransitionStatus;
  readonly nested: boolean;
  readonly delay: number;
  readonly closeDelay: number;
  readonly orientation: 'horizontal' | 'vertical';
  readonly activationDirection: 'left' | 'right' | 'up' | 'down' | null;
  readonly rootElement: HTMLElement | null;
  readonly popupElement: HTMLElement | null;
  readonly positionerElement: HTMLElement | null;
  readonly viewportElement: HTMLElement | null;
  readonly viewportTargetElement: HTMLElement | null;
  readonly currentContent: HTMLElement | null;
  readonly activeTrigger: HTMLElement | null;
  readonly floatingRootContext: FloatingRootContext;
  setFloatingRootContext(context: FloatingRootContext | null): void;
  readonly logicalLayer: LogicalLayer | null;
  registerLogicalLayer(layer: LogicalLayer): () => void;
  readonly tree: FloatingTreeType;
  readonly nodeId: string;
  readonly viewportInert: boolean;
  readonly guards: { beforeInside: HTMLElement | null; afterInside: HTMLElement | null; beforeOutside: HTMLElement | null; afterOutside: HTMLElement | null };
  setValue(value: Value | null, details: Omit<NavigationMenuRoot.ChangeEventDetails, 'preventUnmountOnClose'>): boolean;
  setRootElement(element: HTMLElement | null): void;
  setPopupElement(element: HTMLElement | null): void;
  setPositionerElement(element: HTMLElement | null): void;
  setViewportElement(element: HTMLElement | null): void;
  setViewportTargetElement(element: HTMLElement | null): void;
  setViewportInert(inert: boolean): void;
  registerTrigger(entry: { readonly value: Value; readonly element: HTMLElement | null }): () => void;
  registerContent(entry: { readonly value: Value; readonly element: HTMLElement | null }): () => void;
  activate(element: HTMLElement): void;
  prepareActivation(value: Value, element: HTMLElement): void;
}

export const NavigationMenuRootContext = createContext<NavigationMenuRootContext | null>(null, { name: 'NavigationMenuRootContext' });
export function useNavigationMenuRootContext<Value = any>(optional: true): NavigationMenuRootContext<Value> | null;
export function useNavigationMenuRootContext<Value = any>(optional?: false): NavigationMenuRootContext<Value>;
export function useNavigationMenuRootContext<Value = any>(optional = false) {
  const context = useContext(NavigationMenuRootContext);
  if (!context && !optional) throw new Error('Base UI: NavigationMenuRootContext is missing. Navigation Menu parts must be placed within <NavigationMenu.Root>.');
  return context as NavigationMenuRootContext<Value> | null;
}
export const NavigationMenuTreeContext = createContext<string | undefined>(undefined);
export function useNavigationMenuTreeContext() { return useContext(NavigationMenuTreeContext); }
