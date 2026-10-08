import { describe, expect, it } from 'vitest';
import { closestSnapPointIndex, getSnapPointSwipeMovement, resolveSnapPointValue, resolveSnapPoints, resolveActiveSnapPoint, resolveSnapRelease, resolveSwipeReleaseStrength } from './snapPoints';

describe('Drawer snap geometry — pinned useDrawerSnapPoints and DrawerViewport', () => {
  it.each([[100, -50, -50], [0, 20, 20], [100, -100, -100], [0, -150, -Math.sqrt(150)], [100, -250, -Math.sqrt(150) - 100]])('damps overshoot %s/%s', (base, delta, expected) => {
    expect(getSnapPointSwipeMovement(base, delta)).toBeCloseTo(expected);
    if (base + delta >= 0) expect(getSnapPointSwipeMovement(base, delta)).toBe(expected);
  });
  it('keeps first nearest ties and handles empty points', () => {
    expect(closestSnapPointIndex([100, 200, 300], 240)).toBe(1);
    expect(closestSnapPointIndex([100, 200], 150)).toBe(0);
    expect(closestSnapPointIndex([], 100)).toBe(-1);
  });
  it.each([[0.5, 400], [1, 800], [148, 148], ['148px', 148], [' 30rem ', 480], [-1, 0], ['-10px', -10], ['50%', null], ['auto', null], [Infinity, null], [NaN, null]] as const)('resolves %s', (value, expected) => {
    expect(resolveSnapPointValue(value, 800, 16)).toBe(expected);
  });
  it('rejects unavailable viewport geometry', () => {
    for (const height of [0, -1, NaN, Infinity]) expect(resolveSnapPointValue(1, height, 16)).toBeNull();
  });
  it('clamps to content and viewport and retains the last duplicate within one pixel', () => {
    expect(resolveSnapPoints([0.25, '200.5px', 0.5, 1], 800, 400)).toEqual([
      { value: '200.5px', height: 200.5, offset: 199.5 }, { value: 1, height: 400, offset: 0 },
    ]);
    expect(resolveSnapPoints([1], 800, 1000)[0].offset).toBe(200);
  });
  it('resolves an active deduplicated value to the nearest height', () => {
    const points = resolveSnapPoints([0.5, 1], 800, 400);
    expect(resolveActiveSnapPoint(0.5, points, 800, 400)?.value).toBe(1);
    expect(resolveActiveSnapPoint(null, points, 800, 400)).toBeUndefined();
  });
  const points = resolveSnapPoints([0.25, 0.5, 1], 800, 800);
  const release = { points, popupHeight: 800, currentOffset: 0, delta: 20, velocity: 1, releaseVelocity: 1, sequential: true, attributed: true };
  it('advances at least one adjacent point with velocity but permits distance to cross multiple points', () => {
    expect(resolveSnapRelease(release)).toEqual({ point: points[1], close: false });
    expect(resolveSnapRelease({ ...release, delta: 610 })).toEqual({ point: points[0], close: false });
  });
  it('dismisses a fling from the last sequential point', () => {
    expect(resolveSnapRelease({ ...release, currentOffset: 600 })?.close).toBe(true);
  });
  it('does not dismiss an unattributed gesture', () => {
    expect(resolveSnapRelease({ ...release, sequential: false, attributed: false })?.close).toBe(false);
  });
  it('ignores release reversals and dismisses non-sequential outward flings', () => {
    expect(resolveSnapRelease({ ...release, sequential: false, releaseVelocity: -1 })?.close).toBe(true);
  });
  it('bounds release durations and ignores slow or completed releases', () => {
    expect(resolveSwipeReleaseStrength(800, 0, 1, 4)).toBeCloseTo(0.1 + 120 / 280 * 0.9);
    expect(resolveSwipeReleaseStrength(800, 790, 4, 4)).toBe(0.1);
    expect(resolveSwipeReleaseStrength(800, 0, 0.3, 0)).toBe(1);
    expect(resolveSwipeReleaseStrength(800, 0, 0.2, 0)).toBeNull();
    expect(resolveSwipeReleaseStrength(800, 800, 1, 1)).toBeNull();
  });
});
