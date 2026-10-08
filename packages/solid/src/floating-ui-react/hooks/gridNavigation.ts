import { getGridNavigatedIndex, isIndexOutOfListBounds, type DisabledIndices } from '../utils/composite';
/** Source floating grid call shape; all grid work remains opt-in. */
export function gridNavigation(event: KeyboardEvent, index: number, list: { current: (HTMLElement | null)[] }, orientation: 'horizontal' | 'vertical' | 'both', loopFocus: boolean, rtl: boolean, disabledIndices: DisabledIndices | undefined, minIndex: number, maxIndex: number, cols = 2): number | undefined {
  const next = getGridNavigatedIndex(list.current, { event, orientation, loopFocus, rtl, cols, disabledIndices, minIndex, maxIndex, prevIndex: index > maxIndex ? minIndex : index, stopEvent: true });
  return isIndexOutOfListBounds(list.current, next) ? undefined : next;
}
