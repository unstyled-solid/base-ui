import { createContext, useContext } from 'solid-js';
import type { AnchorPositioningResult } from '../../internals/createAnchorPositioning';
export interface SelectPositionerContextValue {
  readonly positioning: AnchorPositioningResult;
  readonly side: AnchorPositioningResult['side'] | 'none';
  readonly alignItemWithTriggerActive: boolean;
  readonly layoutRevision: number;
  setAlignFallback(value: boolean): void;
  readonly scrollUpArrow: { current: HTMLElement | null };
  readonly scrollDownArrow: { current: HTMLElement | null };
}
export const SelectPositionerContext = createContext<SelectPositionerContextValue>();
export function useSelectPositionerContext() { return useContext(SelectPositionerContext); }
