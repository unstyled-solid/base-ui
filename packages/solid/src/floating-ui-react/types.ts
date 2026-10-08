import type { createBaseUIFloating } from './hooks/createFloating';
import type { FloatingRootContext as RootContext } from '../internals/contracts/floating';

// Retain the source type entry's runtime re-exports. The public /types entry is
// separate and entirely type-only.
export * from './index';
export type { FloatingDelayGroupProps } from './components/FloatingDelayGroup';
export type { FloatingFocusManagerProps } from './components/FloatingFocusManager';
export type { FloatingPortalProps } from './components/FloatingPortal';
export type { UseFloatingPortalNodeProps } from './hooks/createFloatingPortalNode';
export type { UseClientPointProps } from './hooks/createClientPoint';
export type { DismissOptions as UseDismissProps } from './hooks/createDismiss';
export type { FocusOptions as UseFocusProps } from './hooks/createFocus';
export type { HandleCloseContext, HandleClose, HoverDelay as Delay } from './hooks/hoverShared';
export type { UseHoverFloatingInteractionProps } from './hooks/createHoverFloatingInteraction';
export type { UseHoverReferenceInteractionProps } from './hooks/createHoverReferenceInteraction';
export type { UseListNavigationProps } from './hooks/createListNavigation';
export type { UseTypeaheadProps } from './hooks/createTypeahead';
export type { UseFloatingRootContextOptions } from './hooks/createFloatingRootContext';
export type { UseFloatingOptions } from './hooks/createFloating';
export type { SafePolygonOptions } from './safePolygon';
export type { FloatingTreeProps, FloatingNodeProps } from './components/FloatingTree';
export type {
  FloatingEvents,
  FloatingRootContext,
  FloatingNodeType,
  FloatingTreeType,
  ReferenceType,
} from '../internals/contracts/floating';
export type { InteractionProps as ElementProps } from './hooks/createDismiss';
export type {
  AlignedPlacement, Alignment, ArrowOptions, AutoPlacementOptions, AutoUpdateOptions,
  Axis, Boundary, ClientRectObject, ComputePositionConfig, ComputePositionReturn,
  Coords, DetectOverflowOptions, Dimensions, ElementContext, ElementRects, Elements,
  FlipOptions, FloatingElement, HideOptions, InlineOptions, Length, Middleware,
  MiddlewareArguments, MiddlewareData, MiddlewareReturn, MiddlewareState,
  NodeScroll, OffsetOptions, Padding, Placement, Platform, Rect, ReferenceElement,
  RootBoundary, ShiftOptions, Side, SideObject, SizeOptions, Strategy, VirtualElement,
} from '@floating-ui/dom';

export type NarrowedElement<T> = T extends Element ? T : Element;
// Derive native getter/setter shapes from the implementation: no React refs or
// synthetic events, and no independently maintained geometry interface.
export type UseFloatingReturn = ReturnType<typeof createBaseUIFloating>;
export type UseFloatingData = UseFloatingReturn;
export type FloatingContext = UseFloatingReturn['context'];
export type ExtendedRefs = UseFloatingReturn['refs'];
export type ExtendedElements = UseFloatingReturn['elements'];
export type ContextData = RootContext['data'];
export type FloatingTreeStore = ReturnType<typeof import('./components/createFloatingTree').createFloatingTree>;
