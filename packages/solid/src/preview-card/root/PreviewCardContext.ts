import { createContext, useContext } from 'solid-js';
import type { PreviewCardStore } from '../store/PreviewCardStore';

export const PreviewCardRootContext = createContext<PreviewCardStore<unknown> | null>(null);
export function usePreviewCardRootContext(optional: true): PreviewCardStore<unknown> | null;
export function usePreviewCardRootContext(optional?: false): PreviewCardStore<unknown>;
export function usePreviewCardRootContext(optional = false) {
  const context = useContext(PreviewCardRootContext);
  if (!context && !optional) {
    throw new Error('Base UI: PreviewCardRootContext is missing. PreviewCard parts must be placed within <PreviewCard.Root>.');
  }
  return context;
}
