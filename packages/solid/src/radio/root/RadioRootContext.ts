import { createContext, useContext } from 'solid-js';
import type { RadioRootState } from './RadioRoot';

export const RadioRootContext = createContext<RadioRootState>();
export function useRadioRootContext() { return useContext(RadioRootContext); }
