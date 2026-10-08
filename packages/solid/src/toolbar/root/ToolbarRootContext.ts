import { createContext, useContext } from 'solid-js';
import type { Orientation } from '../../internals/types';

export interface ToolbarRootContext {
  readonly disabled: boolean;
  readonly orientation: Orientation;
}

/** Optional host seam used by ToggleGroup outside a toolbar as well. */
export const ToolbarRootContext = createContext<ToolbarRootContext | null>(null);

export function useToolbarRootContext(optional?: false): ToolbarRootContext;
export function useToolbarRootContext(optional: true): ToolbarRootContext | null;
export function useToolbarRootContext(optional = false): ToolbarRootContext | null {
  const context = useContext(ToolbarRootContext);
  if (context === null && !optional) {
    throw new Error(
      'Base UI: ToolbarRootContext is missing. Toolbar parts must be placed within <Toolbar.Root>.',
    );
  }
  return context;
}
