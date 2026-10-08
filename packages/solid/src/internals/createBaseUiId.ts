import { type Accessor } from 'solid-js';
import { createId } from '../utils/createId';

export function createBaseUiId(idOverride?: string | Accessor<string | undefined>): Accessor<string> {
  return createId(idOverride, 'base-ui');
}
export { createBaseUiId as useBaseUiId };
