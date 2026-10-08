import { describe, expect, it, vi } from 'vitest';
import { advanceTimers, createRenderer, fireEvent, screen } from '../../../test';
import { Select } from '../index';

const { render } = createRenderer();

// Pinned SelectScrollArrow/UpArrow/DownArrow tests stub native scroll metrics
// to exercise the timer/edge algorithm; real geometry remains in browser tests.
async function scrollable(initial: number, height = 600, clientHeight = 200, offsets = [0, 40, 80, 120, 160, 200, 240, 280, 320, 360]) {
  let offset = initial;
  let writes = 0;
  const view = await render(() => <Select.Root open><Select.Positioner alignItemWithTrigger={false}>
    <Select.ScrollUpArrow keepMounted data-testid="up" />
    <Select.List ref={element => {
      if (!element) return;
      Object.defineProperties(element, {
        scrollTop: { configurable: true, get: () => offset, set: (value: number) => { offset = value; writes++; } },
        scrollHeight: { configurable: true, value: height }, clientHeight: { configurable: true, value: clientHeight },
      });
    }}>
      {offsets.map((top, index) => <Select.Item value={index} ref={element => {
        if (element) Object.defineProperties(element, { offsetTop: { configurable: true, value: top }, offsetHeight: { configurable: true, value: 40 } });
      }}>Item {index}</Select.Item>)}
    </Select.List>
    <Select.ScrollDownArrow keepMounted data-testid="down" />
  </Select.Positioner></Select.Root>);
  fireEvent.scroll(screen.getByRole('listbox'));
  return { ...view, offset: () => offset, writes: () => writes };
}

describe('Select scroll arrows source hover and fractional boundaries', () => {
  it('does not postpone an existing step for continuous movement, and stops on leave', async () => {
    const view = await scrollable(0);
    vi.useFakeTimers();
    try {
      const down = screen.getByTestId('down');
      fireEvent.mouseMove(down, { movementY: 1 });
      await advanceTimers(30);
      fireEvent.mouseMove(down, { movementX: 1, movementY: 1 });
      await advanceTimers(15);
      expect(view.offset()).toBeGreaterThan(0);
      const stopped = view.offset();
      fireEvent.mouseLeave(down);
      await advanceTimers(400);
      expect(view.offset()).toBe(stopped);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it('ignores stationary mousemove', async () => {
    const view = await scrollable(0);
    vi.useFakeTimers();
    try {
      fireEvent.mouseMove(screen.getByTestId('down'), { movementX: 0, movementY: 0 });
      await advanceTimers(80);
      expect(view.offset()).toBe(0);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
  it.each([
    ['up', 0.4, 600, 200, [0, 40, 80], 0],
    ['down', 390, 600, 200, [0, 40, 80, 120, 160, 200, 240, 280, 320, 360], 400],
    ['down', 19.5, 100.5, 60, [0, 40, 80], 40.5],
    ['up', 100, 600, 200, [300, 340, 380], 0],
  ] as const)('reaches the true %s boundary from %s and stops writing', async (direction, initial, height, client, offsets, target) => {
    const view = await scrollable(initial, height, client, [...offsets]);
    vi.useFakeTimers();
    try {
      fireEvent.mouseMove(screen.getByTestId(direction), { movementY: direction === 'up' ? -1 : 1 });
      await advanceTimers(80);
      expect(view.offset()).toBe(target);
      const writes = view.writes();
      await advanceTimers(400);
      expect(view.writes()).toBe(writes);
      view.unmount();
    } finally { vi.useRealTimers(); }
  });
});
