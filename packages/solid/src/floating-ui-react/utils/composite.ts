// Base UI composite algorithms, MIT. Visibility has a single DOM-owned implementation.
import { closest } from './element';
import { isElementVisible } from './visibility';
export { isElementVisible, isHiddenByStyles } from './visibility';
export type DisabledIndices = readonly number[] | ((index: number) => boolean);
export const isDifferentGridRow = (index: number, cols: number, previous: number) => Math.floor(index / cols) !== previous;
export const isIndexOutOfListBounds = (list: readonly (HTMLElement | null)[], index: number) => index < 0 || index >= list.length;
export function isListIndexDisabled(list: readonly (HTMLElement | null)[], index: number, disabled?: DisabledIndices): boolean {
  if (typeof disabled === 'function' ? disabled(index) : disabled?.includes(index)) return true;
  const element = list[index]; if (!element) return false;
  return !isElementVisible(element) || element.matches(':disabled') || (!disabled && (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true'));
}
export function findNonDisabledListIndex(list: readonly (HTMLElement | null)[], { startingIndex = -1, decrement = false, disabledIndices, amount = 1 }: { startingIndex?: number; decrement?: boolean; disabledIndices?: DisabledIndices | undefined; amount?: number } = {}): number {
  let index = startingIndex;
  do { index += decrement ? -amount : amount; } while (index >= 0 && index < list.length && isListIndexDisabled(list, index, disabledIndices));
  return index;
}
export const getMinListIndex = (list: { current: readonly (HTMLElement | null)[] }, disabledIndices?: DisabledIndices) => findNonDisabledListIndex(list.current, { disabledIndices });
export const getMaxListIndex = (list: { current: readonly (HTMLElement | null)[] }, disabledIndices?: DisabledIndices) => findNonDisabledListIndex(list.current, { startingIndex: list.current.length, decrement: true, disabledIndices });
export interface ListStepOptions { decrement: boolean; loopFocus: boolean; allowEscape: boolean; disabledIndices?: DisabledIndices | undefined; minIndex: number; maxIndex: number }
export function getNextListIndex(list: readonly (HTMLElement | null)[], current: number, options: ListStepOptions): { index: number; wrapped: boolean } {
  const { decrement, loopFocus, allowEscape, disabledIndices, minIndex, maxIndex } = options;
  const step = () => findNonDisabledListIndex(list, { startingIndex: current, decrement, disabledIndices });
  let index: number, wrapped = false;
  if (!loopFocus) index = decrement ? Math.max(minIndex, step()) : Math.min(maxIndex, step());
  else if (decrement ? current <= minIndex : current >= maxIndex) {
    if (allowEscape && current !== (decrement ? -1 : list.length)) index = -1;
    else { index = decrement ? maxIndex : minIndex; wrapped = true; }
  } else index = step();
  return { index: isIndexOutOfListBounds(list, index) ? -1 : index, wrapped };
}
export interface GridNavigationOptions {
  event: KeyboardEvent; orientation: 'horizontal' | 'vertical' | 'both'; loopFocus: boolean;
  onLoop?: ((event: KeyboardEvent, previous: number, next: number) => number) | undefined;
  rtl: boolean; cols: number; disabledIndices: DisabledIndices | undefined; minIndex: number; maxIndex: number; prevIndex: number; stopEvent?: boolean | undefined;
}
export function getGridNavigatedIndex(list: (HTMLElement | null)[], options: GridNavigationOptions): number {
  const { event, orientation, loopFocus, onLoop, rtl, cols, disabledIndices, minIndex, maxIndex, prevIndex } = options;
  let next = prevIndex;
  const stop = () => { if (options.stopEvent) { event.preventDefault(); event.stopPropagation(); } };
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    stop();
    const up = event.key === 'ArrowUp';
    const rows: number[][] = [], rowIndexes: number[] = [];
    let roleRows = false, visible = 0, previousRow: Element | null = null, row = -1;
    list.forEach((element, index) => {
      if (!element) return; visible++;
      const rowElement = closest(element, '[role="row"]'); roleRows ||= rowElement !== null;
      if (rowElement !== previousRow || row === -1) { previousRow = rowElement; row++; rows[row] = []; }
      rows[row]!.push(index); rowIndexes[index] = row;
    });
    const inferredCols = roleRows ? Math.max(0, ...rows.map((row) => row.length)) : 0;
    const domRows = roleRows && rows.some((row) => row.length !== cols), virtualGaps = domRows && visible < list.length;
    const verticalCols = inferredCols || cols;
    let candidate: number | undefined;
    if (domRows && prevIndex !== -1 && rowIndexes[prevIndex] != null) {
      const currentRow = rowIndexes[prevIndex]!, column = rows[currentRow]!.indexOf(prevIndex), step = up ? -1 : 1;
      for (let nextRow = currentRow + step, count = 0; count < rows.length; count++, nextRow += step) {
        if (nextRow < 0 || nextRow >= rows.length) {
          if (!loopFocus || virtualGaps) break;
          nextRow = nextRow < 0 ? rows.length - 1 : 0;
          if (onLoop) { const row = rows[nextRow]!; nextRow = rowIndexes[onLoop(event, prevIndex, row[Math.min(column, row.length - 1)] ?? row[0]!)] ?? nextRow; }
        }
        const row = rows[nextRow]!;
        for (let columnIndex = Math.min(column, row.length - 1); columnIndex >= 0; columnIndex--) if (!isListIndexDisabled(list, row[columnIndex]!, disabledIndices)) { candidate = row[columnIndex]; break; }
        if (candidate !== undefined) break;
      }
    }
    if (candidate === undefined && virtualGaps && prevIndex !== -1) {
      const column = prevIndex % verticalCols, step = up ? -verticalCols : verticalCols;
      const lastRow = maxIndex - maxIndex % verticalCols;
      for (let rowStart = prevIndex - column + step, count = 0; count < Math.floor(maxIndex / verticalCols) + 1; count++, rowStart += step) {
        if (rowStart < 0 || rowStart > maxIndex) { if (!loopFocus) break; rowStart = rowStart < 0 ? lastRow : 0; }
        for (let index = Math.min(rowStart + column, Math.min(rowStart + verticalCols - 1, maxIndex)); index >= rowStart; index--) if (!isListIndexDisabled(list, index, disabledIndices)) { candidate = index; break; }
        if (candidate !== undefined) break;
      }
    }
    if (candidate !== undefined) next = candidate;
    else if (prevIndex === -1) next = up ? maxIndex : minIndex;
    else {
      next = findNonDisabledListIndex(list, { startingIndex: prevIndex, amount: verticalCols, decrement: up, disabledIndices });
      if (loopFocus && up && (prevIndex - verticalCols < minIndex || next < 0)) {
        const column = prevIndex % verticalCols, maxColumn = maxIndex % verticalCols, offset = maxIndex - (maxColumn - column);
        next = maxColumn === column ? maxIndex : maxColumn > column ? offset : offset - verticalCols;
        next = onLoop?.(event, prevIndex, next) ?? next;
      }
      if (loopFocus && !up && prevIndex + verticalCols > maxIndex) {
        next = findNonDisabledListIndex(list, { startingIndex: prevIndex % verticalCols - verticalCols, amount: verticalCols, disabledIndices });
        next = onLoop?.(event, prevIndex, next) ?? next;
      }
    }
    if (isIndexOutOfListBounds(list, next)) next = prevIndex;
  }
  if (orientation === 'both') {
    const previousRow = Math.floor(prevIndex / cols), right = event.key === (rtl ? 'ArrowLeft' : 'ArrowRight'), left = event.key === (rtl ? 'ArrowRight' : 'ArrowLeft');
    if (right || left) {
      stop(); const edge = left ? prevIndex % cols === 0 : prevIndex % cols === cols - 1;
      if (!edge) {
        next = findNonDisabledListIndex(list, { startingIndex: prevIndex, decrement: left, disabledIndices });
        if (loopFocus && isDifferentGridRow(next, cols, previousRow)) {
          next = findNonDisabledListIndex(list, { startingIndex: left ? prevIndex + cols - prevIndex % cols : prevIndex - prevIndex % cols - 1, decrement: left, disabledIndices });
          next = onLoop?.(event, prevIndex, next) ?? next;
        }
      } else if (loopFocus) {
        next = findNonDisabledListIndex(list, { startingIndex: left ? prevIndex + cols - prevIndex % cols : prevIndex - prevIndex % cols - 1, decrement: left, disabledIndices });
        next = onLoop?.(event, prevIndex, next) ?? next;
      }
      if (isDifferentGridRow(next, cols, previousRow)) next = prevIndex;
    }
    if (isIndexOutOfListBounds(list, next)) {
      if (loopFocus && Math.floor(maxIndex / cols) === previousRow) {
        next = left ? maxIndex : findNonDisabledListIndex(list, { startingIndex: prevIndex - prevIndex % cols - 1, disabledIndices });
        next = onLoop?.(event, prevIndex, next) ?? next;
      } else next = prevIndex;
    }
  }
  return next;
}
export interface GridItemSize { width: number; height: number }
export function createGridCellMap(sizes: readonly GridItemSize[], cols: number, dense: boolean): (number | undefined)[] {
  const cells: (number | undefined)[] = []; let start = 0;
  sizes.forEach(({ width, height }, index) => {
    if (width > cols) throw new Error(`Base UI: Invalid grid item width at index ${index}. Reduce the item span to fit within the grid columns.`);
    if (dense) start = 0;
    for (;;) {
      const targets: number[] = [];
      for (let x = 0; x < width; x++) for (let y = 0; y < height; y++) targets.push(start + x + y * cols);
      if (start % cols + width <= cols && targets.every((cell) => cells[cell] == null)) { for (const cell of targets) cells[cell] = index; break; }
      start++;
    }
  });
  return [...cells];
}
export function getGridCellIndexOfCorner(index: number, sizes: readonly GridItemSize[], cells: (number | undefined)[], cols: number, corner: 'tl' | 'tr' | 'bl' | 'br'): number {
  if (index === -1) return -1;
  const first = cells.indexOf(index), item = sizes[index];
  return corner === 'tl' ? first : corner === 'tr' ? first + (item?.width ?? 1) - 1 : corner === 'bl' ? first + ((item?.height ?? 1) - 1) * cols : cells.lastIndexOf(index);
}
export function getGridCellIndices(indices: (number | undefined)[], cells: (number | undefined)[]): number[] { return cells.flatMap((index, cell) => indices.includes(index) ? [cell] : []); }
