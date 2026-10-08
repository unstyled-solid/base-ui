import type { ComboboxStore } from '../store';
import type { FieldRootState } from '../../internals/field-root-context';
import { DEFAULT_FIELD_ROOT_STATE } from '../../internals/field-constants/constants';
/** Root-local live view; the field engine owns validation and all mutations. */
export function createFieldPartState(model: ComboboxStore, detached: () => boolean = () => false): FieldRootState {
  const state = () => detached() ? DEFAULT_FIELD_ROOT_STATE : model.field?.state ?? DEFAULT_FIELD_ROOT_STATE;
  return {
    get disabled() { return state().disabled; }, get valid() { return state().valid; }, get touched() { return state().touched; },
    get dirty() { return state().dirty; }, get filled() { return state().filled; }, get focused() { return state().focused; },
  };
}
