// Adapted from Base UI (MIT), pinned at 19511bb171f3b360b006c94cf6d07e53cb446505.
import { clamp } from '../../utils/clamp';
export type DrawerSnapPoint = number | string;
export type DrawerSwipeDirection = 'up' | 'down' | 'left' | 'right';
export interface ResolvedDrawerSnapPoint { value: DrawerSnapPoint; height: number; offset: number }

export function getSnapPointSwipeMovement(baseOffset: number, movementValue: number): number {
  const nextOffset = baseOffset + movementValue;
  return nextOffset >= 0 ? movementValue : -Math.sqrt(-nextOffset) - baseOffset;
}

export function resolveSnapPointValue(value: DrawerSnapPoint, viewportHeight: number, rootFontSize: number): number | null {
  if (!Number.isFinite(viewportHeight) || viewportHeight <= 0) return null;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return value <= 1 ? clamp(value, 0, 1) * viewportHeight : value;
  }
  const trimmed = value.trim();
  const parsed = Number.parseFloat(trimmed);
  if (!Number.isFinite(parsed)) return null;
  if (trimmed.endsWith('px')) return parsed;
  if (trimmed.endsWith('rem')) return parsed * rootFontSize;
  return null;
}

export function closestSnapPointIndex(values: readonly number[], target: number): number {
  let index = -1;
  let distance = Infinity;
  values.forEach((value, i) => {
    const next = Math.abs(value - target);
    if (next < distance) { index = i; distance = next; }
  });
  return index;
}

export function resolveSnapPoints(values: readonly DrawerSnapPoint[] | undefined, viewportHeight: number, popupHeight: number, rootFontSize = 16): ResolvedDrawerSnapPoint[] {
  if (!values?.length || viewportHeight <= 0 || popupHeight <= 0) return [];
  const resolved: ResolvedDrawerSnapPoint[] = [];
  for (let i = values.length - 1; i >= 0; i--) {
    const height = resolveSnapPointValue(values[i], viewportHeight, rootFontSize);
    if (height === null) continue;
    const clamped = clamp(height, 0, Math.min(popupHeight, viewportHeight));
    if (resolved.some(point => Math.abs(point.height - clamped) <= 1)) continue;
    resolved.push({ value: values[i], height: clamped, offset: Math.max(0, popupHeight - clamped) });
  }
  return resolved.reverse();
}

export function resolveActiveSnapPoint(value: DrawerSnapPoint | null, points: readonly ResolvedDrawerSnapPoint[], viewportHeight: number, popupHeight: number, rootFontSize = 16) {
  if (value === null) return undefined;
  const exact = points.find(point => Object.is(point.value, value));
  if (exact) return exact;
  const height = resolveSnapPointValue(value, viewportHeight, rootFontSize);
  if (height === null) return undefined;
  return points[closestSnapPointIndex(points.map(point => point.height), clamp(height, 0, Math.min(popupHeight, viewportHeight)))];
}

export interface SnapRelease {
  points: readonly ResolvedDrawerSnapPoint[];
  popupHeight: number;
  currentOffset: number;
  delta: number;
  velocity: number;
  releaseVelocity: number;
  sequential: boolean;
  attributed: boolean;
}
/** Geometry only. The caller requests snap/open separately, honoring each cancellation. */
export function resolveSnapRelease(input: SnapRelease): { point: ResolvedDrawerSnapPoint; close: boolean } | null {
  const { points, popupHeight, currentOffset, delta, sequential, attributed } = input;
  if (!points.length || popupHeight <= 0) return null;
  const dragDirection = Math.sign(delta);
  let velocity = input.releaseVelocity;
  if (dragDirection !== 0 && Math.abs(delta) >= 10 && Math.sign(velocity) !== 0 && Math.sign(velocity) !== dragDirection) velocity = input.velocity;
  const dragTarget = clamp(currentOffset + delta, 0, popupHeight);
  const target = sequential ? dragTarget : clamp(dragTarget + (Math.abs(velocity) >= 0.5 ? clamp(velocity, -4, 4) * 300 : 0), 0, popupHeight);
  const ordered = sequential ? [...points].sort((a, b) => a.offset - b.offset) : points;
  const offsets = ordered.map(point => point.offset);
  let point = ordered[closestSnapPointIndex(offsets, target)];
  let effectiveTarget = target;
  if (sequential) {
    const current = closestSnapPointIndex(offsets, currentOffset);
    if (dragDirection !== 0 && Math.sign(velocity) === dragDirection && Math.abs(velocity) >= 0.5) {
      const adjacent = clamp(current + dragDirection, 0, ordered.length - 1);
      if (adjacent !== current) {
        const next = ordered[adjacent];
        if (dragDirection > 0 ? target < next.offset : target > next.offset) { point = next; effectiveTarget = next.offset; }
      } else if (dragDirection > 0) return { point, close: attributed };
    }
  } else if (velocity >= 0.5 && delta > 0) return { point, close: attributed };
  return { point, close: attributed && Math.abs(effectiveTarget - popupHeight) < Math.abs(effectiveTarget - point.offset) };
}

export function resolveSwipeReleaseStrength(size: number, translation: number, velocity: number, releaseVelocity: number): number | null {
  const remaining = Math.max(0, size - translation);
  const speed = Math.abs(releaseVelocity) > 0 ? releaseVelocity : velocity;
  if (size <= 0 || remaining <= 0 || speed <= 0.2) return null;
  const duration = clamp(remaining / clamp(speed, 0.2, 4), 80, 360);
  return 0.1 + ((duration - 80) / 280) * 0.9;
}
