import type { TransitionStatus } from '../../internals/contracts/core';

export type TooltipInstant = 'delay' | 'dismiss' | 'focus' | undefined;

// Derive the temporary group override; never write it over the interaction's
// instant type. Interrupted exits therefore cannot restore stale metadata.
export function tooltipInstant(
  status: TransitionStatus,
  groupInstant: boolean,
  reason: string | null,
  interactionInstant: TooltipInstant,
): TooltipInstant {
  return (status === 'ending' ? reason === 'none' : groupInstant)
    ? 'delay'
    : interactionInstant;
}
