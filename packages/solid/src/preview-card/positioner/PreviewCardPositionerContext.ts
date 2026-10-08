import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';

export const PreviewCardPositionerContext = createContext<AnchorPositioningResult | null>(null);
export function usePreviewCardPositionerContext() {
  const context = useContext(PreviewCardPositionerContext);
  if (context === null) {
    throw new Error('Base UI: PreviewCardPositionerContext is missing. PreviewCardPositioner parts must be placed within <PreviewCard.Positioner>.');
  }
  return context;
}
