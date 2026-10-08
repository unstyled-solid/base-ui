import type { StateAttributesMapping } from '../../internals/getStateAttributesProps';
import { fieldValidityMapping } from '../../internals/field-constants/constants';
import { pressableTriggerOpenStateMapping } from '../../utils/popupStateMapping';
export { popupStateMapping } from '../../utils/popupStateMapping';
export const triggerStateAttributesMapping = {
  ...pressableTriggerOpenStateMapping,
  ...fieldValidityMapping,
  popupSide: (side: string | null) => side ? { 'data-popup-side': side } : null,
  listEmpty: (empty: boolean) => empty ? { 'data-list-empty': '' } : null,
  readOnly: (readOnly: boolean) => readOnly ? { 'data-readonly': '' } : null,
} satisfies StateAttributesMapping<{
  open: boolean;
  valid: boolean | null;
  popupSide: string | null;
  listEmpty: boolean;
  readOnly: boolean;
}>;
