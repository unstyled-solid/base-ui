import { createContext, useContext, type Accessor } from 'solid-js';
export type TextDirection = 'ltr' | 'rtl';
export type DirectionContextType = Accessor<TextDirection>;
export const DirectionContext = createContext<DirectionContextType>(() => 'ltr');
export function useDirection(): Accessor<TextDirection> { return useContext(DirectionContext); }
