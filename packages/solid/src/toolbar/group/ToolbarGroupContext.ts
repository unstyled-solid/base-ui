import { createContext, useContext } from 'solid-js';

export interface ToolbarGroupContext {
  readonly disabled: boolean;
}

export const ToolbarGroupContext = createContext<ToolbarGroupContext | null>(null);

export function useToolbarGroupContext(): ToolbarGroupContext | null {
  return useContext(ToolbarGroupContext);
}
