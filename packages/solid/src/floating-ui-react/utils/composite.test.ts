import { describe, expect, it } from 'vitest';
import { createGridCellMap, getGridCellIndexOfCorner, getGridNavigatedIndex, getMaxListIndex, getMinListIndex, getNextListIndex, isListIndexDisabled, type ListStepOptions } from './composite';

// Source: floating-ui-react/utils/composite.test.ts at 19511bb.
it('always treats natively disabled elements as disabled, unlike aria-disabled ones', () => {
  const nativeDisabled = document.createElement('button');
  nativeDisabled.disabled = true;
  const ariaDisabled = document.createElement('button');
  ariaDisabled.setAttribute('aria-disabled', 'true');
  document.body.append(nativeDisabled, ariaDisabled);
  try {
    const list = [nativeDisabled, ariaDisabled];
    expect(isListIndexDisabled(list, 0)).toBe(true);
    expect(isListIndexDisabled(list, 1)).toBe(true);
    expect(isListIndexDisabled(list, 0, [])).toBe(true);
    expect(isListIndexDisabled(list, 1, [])).toBe(false);
    expect(isListIndexDisabled(list, 0, () => false)).toBe(true);
    expect(isListIndexDisabled(list, 1, () => false)).toBe(false);
  } finally {
    nativeDisabled.remove(); ariaDisabled.remove();
  }
});

describe('source getNextListIndex', () => {
  function nextIndex(count: number, currentIndex: number, options: Omit<ListStepOptions, 'minIndex' | 'maxIndex'>) {
    const list = Array.from({ length: count }, () => document.body.appendChild(document.createElement('div')));
    try {
      const listRef = { current: list };
      return getNextListIndex(list, currentIndex, {
        ...options,
        minIndex: getMinListIndex(listRef, options.disabledIndices),
        maxIndex: getMaxListIndex(listRef, options.disabledIndices),
      });
    } finally {
      list.forEach((item) => item.remove());
    }
  }
  const step = { loopFocus: true, allowEscape: false };
  it('steps to the adjacent index', () => {
    expect(nextIndex(3, 0, { ...step, decrement: false })).toEqual({ index: 1, wrapped: false });
    expect(nextIndex(3, 1, { ...step, decrement: true })).toEqual({ index: 0, wrapped: false });
  });
  it('wraps at either end when looping', () => {
    expect(nextIndex(3, 2, { ...step, decrement: false })).toEqual({ index: 0, wrapped: true });
    expect(nextIndex(3, 0, { ...step, decrement: true })).toEqual({ index: 2, wrapped: true });
  });
  it('stays at either end without looping', () => {
    const options = { loopFocus: false, allowEscape: false };
    expect(nextIndex(3, 2, { ...options, decrement: false }).index).toBe(2);
    expect(nextIndex(3, 0, { ...options, decrement: true }).index).toBe(0);
  });
  it('leaves the list at either end when escaping is allowed', () => {
    const options = { loopFocus: true, allowEscape: true };
    expect(nextIndex(3, 2, { ...options, decrement: false }).index).toBe(-1);
    expect(nextIndex(3, 0, { ...options, decrement: true }).index).toBe(-1);
  });
  it('enters the list at the far end from outside it', () => {
    const options = { loopFocus: true, allowEscape: true };
    expect(nextIndex(3, -1, { ...options, decrement: false }).index).toBe(0);
    expect(nextIndex(3, -1, { ...options, decrement: true }).index).toBe(2);
  });
  it('skips disabled indices', () => {
    expect(nextIndex(4, 0, { ...step, decrement: false, disabledIndices: [1, 2] }).index).toBe(3);
  });
});

it('composite grid reserves spanning cells and starts from the movement-facing corner', () => {
  const sizes = [{ width: 2, height: 2 }, { width: 1, height: 1 }, { width: 1, height: 1 }];
  const cells = createGridCellMap(sizes, 3, false);
  expect(cells).toEqual([0, 0, 1, 0, 0, 2]);
  expect(getGridCellIndexOfCorner(0, sizes, cells, 3, 'br')).toBe(4);
  expect(getGridCellIndexOfCorner(0, sizes, cells, 3, 'tr')).toBe(1);
});

it('composite grid infers uneven role rows and clamps to an available column', () => {
  const root = document.createElement('div');
  root.innerHTML = '<div role="row"><button>A</button><button>B</button><button>C</button></div><div role="row"><button>D</button><button>E</button></div>';
  document.body.append(root);
  const items = [...root.querySelectorAll('button')];
  const next = getGridNavigatedIndex(items, { event: new KeyboardEvent('keydown', { key: 'ArrowDown' }), orientation: 'both', loopFocus: true, rtl: false, cols: 3, disabledIndices: [], minIndex: 0, maxIndex: 4, prevIndex: 2 });
  expect(next).toBe(4);
  root.remove();
});

it('composite list escape differs from wrapping and disabled candidates are skipped', () => {
  const items = [null, null, null];
  expect(getNextListIndex(items, 2, { decrement: false, loopFocus: true, allowEscape: true, disabledIndices: [1], minIndex: 0, maxIndex: 2 })).toEqual({ index: -1, wrapped: false });
  expect(getNextListIndex(items, 2, { decrement: false, loopFocus: true, allowEscape: false, disabledIndices: [1], minIndex: 0, maxIndex: 2 })).toEqual({ index: 0, wrapped: true });
});
