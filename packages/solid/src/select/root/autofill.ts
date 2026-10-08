import { stringifyAsLabel, stringifyAsValue } from '../../internals/resolveValueLabel';
export interface AutofillItem<Value> { value: Value; renderedLabel: string | null | undefined }
/** Scalar autofill matching from pinned SelectRoot: serialization/string labels
 * precede DOM labels, and comparisons are case-insensitive without trimming. */
export function matchAutofillItem<Value>(items: readonly AutofillItem<Value>[], text: string, itemToStringValue?: (value: NonNullable<Value>) => string, itemToStringLabel?: (value: NonNullable<Value>) => string): AutofillItem<Value> | undefined {
  const query = text.toLowerCase();
  return items.find(item => stringifyAsValue(item.value, itemToStringValue).toLowerCase() === query || stringifyAsLabel(item.value, itemToStringLabel).toLowerCase() === query)
    ?? items.find(item => item.renderedLabel != null && item.renderedLabel.toLowerCase() === query);
}
