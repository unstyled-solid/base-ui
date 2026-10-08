import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import type { ScrollAreaRootState } from './ScrollAreaRoot';
import * as attributes from './ScrollAreaRootDataAttributes';

const attr = (name: string) => (value: boolean) => value ? { [name]: '' } : null;
export const scrollAreaStateAttributesMapping: StateAttributesMapping<ScrollAreaRootState> = {
  hasOverflowX: attr(attributes.hasOverflowX),
  hasOverflowY: attr(attributes.hasOverflowY),
  overflowXStart: attr(attributes.overflowXStart),
  overflowXEnd: attr(attributes.overflowXEnd),
  overflowYStart: attr(attributes.overflowYStart),
  overflowYEnd: attr(attributes.overflowYEnd),
  cornerHidden: null,
};
