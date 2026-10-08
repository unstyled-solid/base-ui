import { createContext, useContext, type Accessor } from 'solid-js';
export const ComboboxPortalContext = createContext<Accessor<boolean>>(() => false);
export const useComboboxPortalContext = () => useContext(ComboboxPortalContext);
