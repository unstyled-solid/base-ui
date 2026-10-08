import { createContext, useContext } from 'solid-js';

export interface DrawerVisualState { swipeProgress: number; frontmostHeight: number }
export interface DrawerVisualStateStore {
  getSnapshot(): DrawerVisualState;
  subscribe(listener: () => void): () => void;
  set(state: Partial<DrawerVisualState>): void;
}
export interface DrawerProviderContext {
  readonly active: boolean;
  setDrawerOpen(drawer: object, open: boolean): void;
  removeDrawer(drawer: object): void;
  registerDrawer(drawer: object, open: () => boolean): () => void;
  visualStateStore: DrawerVisualStateStore;
}
export const DrawerProviderContext = createContext<DrawerProviderContext | null>(null);
export function useDrawerProviderContext() { return useContext(DrawerProviderContext); }

/** Synchronous visual lane: native gesture callbacks must observe their own transaction. */
export function createVisualStateStore(): DrawerVisualStateStore {
  let state: DrawerVisualState = { swipeProgress: 0, frontmostHeight: 0 };
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    set(next) {
      const normalize = (value: number | undefined, previous: number) => value === undefined ? previous : Number.isFinite(value) ? value : 0;
      const swipeProgress = normalize(next.swipeProgress, state.swipeProgress);
      const frontmostHeight = normalize(next.frontmostHeight, state.frontmostHeight);
      if (swipeProgress === state.swipeProgress && frontmostHeight === state.frontmostHeight) return;
      state = { swipeProgress, frontmostHeight };
      listeners.forEach(listener => listener());
    },
  };
}
