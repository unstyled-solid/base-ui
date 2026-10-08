import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';
export const ComboboxPositionerContext = createContext<AnchorPositioningResult | null>(null);
export function useComboboxPositionerContext(optional: true): AnchorPositioningResult | null;
export function useComboboxPositionerContext(optional?: false): AnchorPositioningResult;
export function useComboboxPositionerContext(optional = false) {
  const value = useContext(ComboboxPositionerContext);
  if (!optional && !value) throw new Error('Base UI: ComboboxPositionerContext is missing. Place this part inside Combobox.Positioner.');
  return value;
}
