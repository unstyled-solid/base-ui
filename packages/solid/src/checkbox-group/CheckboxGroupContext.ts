import { createContext, useContext } from 'solid-js';
import type { CheckboxGroupChangeEventDetails } from './CheckboxGroup';
import type { UseCheckboxGroupParentReturnValue } from './useCheckboxGroupParent';
import type { FieldValidation } from '../internals/field-root-context';
import type { LabelableContextValue } from '../internals/labelable-provider';

export interface CheckboxGroupContext {
  readonly allValues: readonly string[] | undefined;
  readonly value: readonly string[];
  /** Accepted uncontrolled proposal for another request in this commit turn. */
  getRequestValue(): readonly string[];
  setValue(value: string[], details: CheckboxGroupChangeEventDetails): void;
  reset(event: Event): void;
  readonly parent: UseCheckboxGroupParentReturnValue;
  readonly disabled: boolean;
  readonly validation: FieldValidation | undefined;
  readonly registerControlId: LabelableContextValue['registerControlId'] | undefined;
}
export const CheckboxGroupContext = createContext<CheckboxGroupContext | null>(null);
export function useCheckboxGroupContext() { return useContext(CheckboxGroupContext); }
