import type { TransitionStatus } from './contracts/core';
import type { StateAttributesMapping } from './getStateAttributesProps';
import * as TransitionStatusDataAttributes from './TransitionStatusDataAttributes';
export { TransitionStatusDataAttributes };
const starting = { [TransitionStatusDataAttributes.startingStyle]: '' };
const ending = { [TransitionStatusDataAttributes.endingStyle]: '' };
export const transitionStatusMapping = {
  transitionStatus: (value: TransitionStatus) => value === 'starting' ? starting : value === 'ending' ? ending : null,
} satisfies StateAttributesMapping<{ transitionStatus: TransitionStatus }>;
