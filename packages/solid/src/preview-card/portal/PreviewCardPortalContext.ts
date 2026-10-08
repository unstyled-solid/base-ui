import { createContext, useContext, type Accessor } from 'solid-js';

export const PreviewCardPortalContext = createContext<Accessor<boolean> | null>(null);
export function usePreviewCardPortalContext() {
  const context = useContext(PreviewCardPortalContext);
  if (context === null) throw new Error('Base UI: <PreviewCard.Portal> is missing.');
  return context;
}
