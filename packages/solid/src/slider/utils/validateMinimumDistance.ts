export function validateMinimumDistance(values: number | readonly number[], step: number, minStepsBetweenValues: number) {
  if (!Array.isArray(values)) return true;
  for (let i = 0; i < values.length - 1; i += 1) {
    if (!(Math.abs(values[i] - values[i + 1]) >= step * minStepsBetweenValues)) return false;
  }
  return true;
}
