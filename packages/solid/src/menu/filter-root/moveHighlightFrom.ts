import { getMaxListIndex, getMinListIndex, getNextListIndex } from '../../floating-ui-react/utils/composite';
import type { MenuStore } from '../store/MenuStore';
import type { MenuRootOrientation } from '../root/MenuRoot';
import { isMainOrientationToEndKey } from '../../floating-ui-react/hooks/createListNavigation';
export interface MoveHighlightOptions { orientation: MenuRootOrientation; rtl: boolean; loopFocus: boolean; allowEscape: boolean }
/** Menu's parent-handoff policy delegates the actual step to the shared navigator. */
export function moveHighlightFrom(store: MenuStore, item: HTMLElement, event: KeyboardEvent, options: MoveHighlightOptions): HTMLElement | undefined {
  const list = store.context.itemDomElements;
  const { index } = getNextListIndex(list.current, list.current.indexOf(item), {
    decrement: !isMainOrientationToEndKey(event.key, options.orientation, options.rtl), loopFocus: options.loopFocus, allowEscape: options.allowEscape,
    disabledIndices: [], minIndex: getMinListIndex(list, []), maxIndex: getMaxListIndex(list, []),
  });
  const next = list.current[index];
  if (next) {
    store.setActiveIndex(index, 'keyboard', event);
    next.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }
  return next ?? undefined;
}
