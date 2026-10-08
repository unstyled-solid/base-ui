import type { MenuRootChangeEventReason } from '../root/MenuRoot';
export interface MenuOpenEventDetails {
  open: boolean; nodeId: string | undefined; parentNodeId: string | null; reason: MenuRootChangeEventReason | null;
}
