import type { FloatingRootContext, FloatingTreeType, FloatingTreeEventMap } from '../../internals/contracts/floating';
import type { MenuOpenEventDetails } from './types';
import type { MenuRootChangeEventReason } from '../root/MenuRoot';
export interface MenuTreeEvents extends FloatingTreeEventMap {
  menuopenchange: MenuOpenEventDetails;
  close: { domEvent: Event | undefined; reason: MenuRootChangeEventReason };
  itemhover: { nodeId: string | undefined; target: Element | null };
}
export type MenuTree = FloatingTreeType<FloatingRootContext, MenuTreeEvents>;
