import { createContext, useContext } from 'solid-js';
export interface CSPContextValue { readonly nonce?: string | undefined; readonly disableStyleElements?: boolean | undefined }
export const CSPContext = createContext<CSPContextValue | null>(null);
export function useCSPContext(): CSPContextValue | null { return useContext(CSPContext); }
