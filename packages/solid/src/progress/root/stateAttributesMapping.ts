import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { ProgressRootState } from './ProgressRoot';
import * as attributes from './ProgressRootDataAttributes';

export const progressStateAttributesMapping: StateAttributesMapping<ProgressRootState> = {
  status(value): Record<string, string> | null {
    if (value === 'progressing') return { [attributes.progressing]: '' };
    if (value === 'complete') return { [attributes.complete]: '' };
    if (value === 'indeterminate') return { [attributes.indeterminate]: '' };
    return null;
  },
};
