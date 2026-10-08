import { createContext, useContext, type Accessor, type Setter } from 'solid-js';
import type { Coords, HiddenState, OverflowEdges, ScrollAreaRootState, Size } from './ScrollAreaRoot';

export type Orientation = 'vertical' | 'horizontal';
export type Part = 'root' | 'viewport' | 'scrollbarX' | 'scrollbarY' | 'thumbX' | 'thumbY' | 'corner';
export interface ScrollAreaRootContextValue {
  nodes: Record<Part, HTMLDivElement | null>;
  revision: Accessor<number>;
  register(part: Part, node: HTMLDivElement | null): void;
  readonly rootId: string;
  readonly viewportState: ScrollAreaRootState;
  readonly cornerSize: Size;
  readonly thumbSize: Size;
  readonly hiddenState: HiddenState;
  readonly overflowEdges: OverflowEdges;
  readonly overflowEdgeThreshold: Record<keyof OverflowEdges, number>;
  readonly hasMeasuredScrollbar: boolean;
  readonly hovering: boolean;
  readonly scrollingX: boolean;
  readonly scrollingY: boolean;
  readonly touchModality: boolean;
  setCornerSize: Setter<Size>;
  setThumbSize: Setter<Size>;
  setHiddenState: Setter<HiddenState>;
  setOverflowEdges: Setter<OverflowEdges>;
  setHasMeasuredScrollbar: Setter<boolean>;
  setHovering: Setter<boolean>;
  handleScroll(position: Coords): void;
  canStart(event: PointerEvent): boolean;
  disableViewportSnap(): void;
  handlePointerDown(event: PointerEvent, orientation: Orientation): void;
  handlePointerMove(event: PointerEvent): void;
  handlePointerUp(event: PointerEvent): void;
  endGesture(): void;
}
export const ScrollAreaRootContext = createContext<ScrollAreaRootContextValue | null>(null);
export function useScrollAreaRootContext() {
  const context = useContext(ScrollAreaRootContext);
  if (!context) throw new Error('Base UI: ScrollAreaRootContext is missing. ScrollArea parts must be placed within <ScrollArea.Root>.');
  return context;
}
