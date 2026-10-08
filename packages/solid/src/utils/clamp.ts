export function clamp(val: number, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER): number {
  return Math.max(min, Math.min(val, max));
}
