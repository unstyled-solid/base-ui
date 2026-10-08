// Adapted from Base UI, MIT, 19511bb171f3b360b006c94cf6d07e53cb446505.
export function getDecimalPrecision(num: number) {
  if (num === 0) return 0;
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split('e-');
    const decimal = parts[0].split('.')[1];
    return (decimal ? decimal.length : 0) + parseInt(parts[1], 10);
  }
  return num.toString().split('.')[1]?.length ?? 0;
}
export function roundValueToStep(value: number, step: number, min: number) {
  const nearest = Math.round((value - min) / step) * step + min;
  return Number(nearest.toFixed(Math.max(getDecimalPrecision(step), getDecimalPrecision(min))));
}
