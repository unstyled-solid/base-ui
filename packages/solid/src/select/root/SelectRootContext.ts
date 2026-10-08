import { createContext, useContext } from 'solid-js';
import type { SelectModel } from '../store';

export const SelectRootContext = createContext<SelectModel>();
export function useSelectRootContext() { return useContext(SelectRootContext); }
export function useSelectFloatingContext() { return useSelectRootContext().popup.state.floatingRootContext; }
