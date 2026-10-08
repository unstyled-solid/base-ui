import { createContext, useContext } from 'solid-js';
import type { JSX } from '@solidjs/web';
export const GroupCollectionContext = createContext<{ readonly items?: readonly any[] } | null>(null);
export const useGroupCollectionContext = () => useContext(GroupCollectionContext);
export function GroupCollectionProvider(props: { items?: readonly any[]; children?: JSX.Element }) {
  return <GroupCollectionContext value={props}>{props.children}</GroupCollectionContext>;
}
