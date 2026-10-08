import type { StateAttributesMapping } from '../../internals/contracts/render';
import type { TransitionStatus } from '../../internals/contracts/core';

// Base UI 19511bb (MIT): these are Popover's public styling contracts.
export const popupStateMapping = {
  open: (open: boolean) => ({ [open ? 'data-open' : 'data-closed']: '' }),
};
export const popupTransitionStateMapping = {
  ...popupStateMapping,
  transitionStatus: (status: TransitionStatus): Record<string, string> | null => status === 'starting'
    ? { 'data-starting-style': '' }
    : status === 'ending' ? { 'data-ending-style': '' } : null,
} satisfies StateAttributesMapping<{ open: boolean; transitionStatus: TransitionStatus }>;

export const OPEN_DELAY = 300;
