// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { clamp } from '../../utils/clamp';
import { getFormatter } from '../../utils/formatNumber';
import { parseNumber } from './parse';

const STEP_EPSILON_FACTOR = 1e-10;
const MAX_FLOATING_POINT_CLEANUP_DELTA = 1e-10;
type NumberFormatOptionsWithRounding = Intl.NumberFormatOptions & {
  roundingIncrement?: number;
  roundingMode?: string;
  roundingPriority?: string;
};

export function hasNumberFormatRoundingOptions(format?: NumberFormatOptionsWithRounding): format is NumberFormatOptionsWithRounding {
  return format?.maximumFractionDigits != null || format?.minimumFractionDigits != null ||
    format?.maximumSignificantDigits != null || format?.minimumSignificantDigits != null ||
    format?.roundingIncrement != null || format?.roundingMode != null || format?.roundingPriority != null;
}

export function removeFloatingPointErrors(value: number, format?: NumberFormatOptionsWithRounding) {
  if (!Number.isFinite(value)) return value;
  if (!hasNumberFormatRoundingOptions(format)) {
    const roundedValue = parseFloat(value.toPrecision(15));
    const tolerance = Math.min(Number.EPSILON * Math.max(1, Math.abs(value)), MAX_FLOATING_POINT_CLEANUP_DELTA);
    return Math.abs(roundedValue - value) <= tolerance ? roundedValue : value;
  }
  const formatter = getFormatter('en-US', {
    ...format, signDisplay: 'auto', currencySign: 'standard',
    notation: format.notation === 'compact' ? 'standard' : format.notation, useGrouping: false,
  });
  const roundedText = formatter.format(value);
  const roundedValue = parseNumber(roundedText, 'en-US', format);
  return roundedValue !== null && formatter.format(roundedValue) === roundedText ? roundedValue : value;
}

function snapToStep(value: number, base: number, step: number, nearest: boolean) {
  const stepSize = Math.abs(step);
  const direction = Math.sign(step);
  const rawSteps = value - base + stepSize * STEP_EPSILON_FACTOR * direction;
  if (nearest) return base + Math.round(rawSteps / step) * step;
  return base + (direction > 0 ? Math.floor(rawSteps / stepSize) : Math.ceil(rawSteps / stepSize)) * stepSize;
}

export function toValidatedNumber(value: number | null, step: number | undefined,
  minWithDefault: number, maxWithDefault: number, minWithZeroDefault: number,
  format: NumberFormatOptionsWithRounding | undefined, snapOnStep: boolean, small: boolean, shouldClamp: boolean) {
  if (value === null) return value;
  let nextValue = value;
  if (step != null && snapOnStep && step !== 0) {
    const base = small || minWithDefault === Number.MIN_SAFE_INTEGER ? minWithZeroDefault : minWithDefault;
    nextValue = snapToStep(nextValue, base, step, small);
  }
  if (shouldClamp) nextValue = clamp(nextValue, minWithDefault, maxWithDefault);
  // Only arithmetic gets binary-noise cleanup; parsed input preserves all representable digits.
  if (step == null && !hasNumberFormatRoundingOptions(format)) return nextValue;
  const rounded = removeFloatingPointErrors(nextValue, format);
  return shouldClamp ? clamp(rounded, minWithDefault, maxWithDefault) : rounded;
}
