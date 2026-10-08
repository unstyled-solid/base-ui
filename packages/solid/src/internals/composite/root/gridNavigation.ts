import { createGridCellMap, getGridCellIndexOfCorner, getGridCellIndices, getGridNavigatedIndex, isListIndexDisabled } from '../../../floating-ui-react/utils/composite';
export interface CompositeGridItemSize { width: number; height: number }
export interface CompositeGridConfig { cols: number; dense?: boolean | undefined; itemSizes?: CompositeGridItemSize[] | undefined }
export interface CompositeGridNavigationState {
  event: KeyboardEvent; elementsRef: { current: (HTMLElement | null)[] }; highlightedIndex: number;
  minIndex: number; maxIndex: number; orientation: 'horizontal' | 'vertical' | 'both'; loopFocus: boolean;
  onLoop?: ((event: KeyboardEvent, previous: number, next: number) => number) | undefined;
  disabledIndices?: readonly number[] | undefined; rtl: boolean;
}
export type CompositeGridNavigator = (state: CompositeGridNavigationState) => number;
export function gridNavigation(config: CompositeGridConfig): CompositeGridNavigator {
  return (state) => {
    const sizes = config.itemSizes ?? Array.from({ length: state.elementsRef.current.length }, () => ({ width: 1, height: 1 }));
    const cells = createGridCellMap(sizes, config.cols, config.dense ?? false);
    const min = cells.findIndex((index) => index != null && !isListIndexDisabled(state.elementsRef.current, index, state.disabledIndices));
    const max = cells.reduce<number>((last, index, cell) => index != null && !isListIndexDisabled(state.elementsRef.current, index, state.disabledIndices) ? cell : last, -1);
    const disabled = state.disabledIndices ?? state.elementsRef.current.map((_, index) => isListIndexDisabled(state.elementsRef.current, index) ? index : undefined);
    const cellIndex = getGridNavigatedIndex(cells.map((index) => index != null ? state.elementsRef.current[index] ?? null : null), {
      event: state.event, orientation: state.orientation, loopFocus: state.loopFocus, onLoop: state.onLoop, cols: config.cols,
      disabledIndices: getGridCellIndices([...disabled, undefined], cells), minIndex: min, maxIndex: max,
      prevIndex: getGridCellIndexOfCorner(state.highlightedIndex > state.maxIndex ? state.minIndex : state.highlightedIndex, sizes, cells, config.cols,
        state.event.key === 'ArrowDown' ? 'bl' : state.event.key === (state.rtl ? 'ArrowLeft' : 'ArrowRight') ? 'tr' : 'tl'), rtl: state.rtl,
    });
    return cells[cellIndex] ?? state.highlightedIndex;
  };
}
