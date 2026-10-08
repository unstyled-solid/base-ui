import { createContext, useContext } from 'solid-js';
import type { CheckboxRootState } from './CheckboxRoot';

export const CheckboxRootContext = createContext<CheckboxRootState>();
export function useCheckboxRootContext() { return useContext(CheckboxRootContext); }
