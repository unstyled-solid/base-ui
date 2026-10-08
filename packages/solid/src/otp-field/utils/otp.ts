// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
interface OTPValidationConfig {
  slotPattern: string;
  getRootPattern: (length: number) => string;
  regexp: RegExp;
  inputMode: 'numeric' | 'text';
}

export type OTPValidationType = 'numeric' | 'alpha' | 'alphanumeric' | 'none';

const OTP_VALIDATION_CONFIG: Record<Exclude<OTPValidationType, 'none'>, OTPValidationConfig> = {
  numeric: {
    slotPattern: '\\d{1}', getRootPattern: (length) => `\\d{${length}}`,
    regexp: /[^\d]/g, inputMode: 'numeric',
  },
  alpha: {
    slotPattern: '[a-zA-Z]{1}', getRootPattern: (length) => `[a-zA-Z]{${length}}`,
    regexp: /[^a-zA-Z]/g, inputMode: 'text',
  },
  alphanumeric: {
    slotPattern: '[a-zA-Z0-9]{1}', getRootPattern: (length) => `[a-zA-Z0-9]{${length}}`,
    regexp: /[^a-zA-Z0-9]/g, inputMode: 'text',
  },
};

export function getOTPValidationConfig(validationType: OTPValidationType) {
  return validationType === 'none' ? null : OTP_VALIDATION_CONFIG[validationType];
}

export function stripOTPWhitespace(value: string | null | undefined) {
  return (value ?? '').replace(/\s/g, '');
}

export function normalizeOTPValueWithDetails(
  value: string | null | undefined,
  length: number,
  validationType: OTPValidationType,
  normalizeValue?: (value: string) => string,
): readonly [value: string, didRejectCharacters: boolean] {
  const strippedValue = stripOTPWhitespace(value);
  const validation = getOTPValidationConfig(validationType);
  const filter = (text: string) => validation ? text.replace(validation.regexp, '') : text;
  let normalizedValue = filter(strippedValue);
  let didRejectCharacters = strippedValue.length > normalizedValue.length;
  if (normalizeValue) {
    const customNormalizedValue = normalizeValue(normalizedValue);
    didRejectCharacters ||= normalizedValue.length > customNormalizedValue.length;
    normalizedValue = filter(customNormalizedValue);
    didRejectCharacters ||= customNormalizedValue.length > normalizedValue.length;
  }
  const maxLength = length < 0 ? 0 : length;
  const characters = Array.from(normalizedValue);
  return [characters.slice(0, maxLength).join(''), didRejectCharacters || characters.length > maxLength];
}

export function normalizeOTPValue(
  value: string | null | undefined, length: number, validationType: OTPValidationType,
  normalizeValue?: (value: string) => string,
) {
  return normalizeOTPValueWithDetails(value, length, validationType, normalizeValue)[0];
}

export function replaceOTPValue(
  currentValue: string, index: number, nextValue: string, length: number,
  validationType: OTPValidationType, normalizeValue?: (value: string) => string,
) {
  const normalizedValue = normalizeOTPValue(nextValue, length, validationType, normalizeValue);
  const prefix = currentValue.slice(0, index);
  const suffix = currentValue.slice(index + normalizedValue.length);
  return normalizeOTPValue(`${prefix}${normalizedValue}${suffix}`, length, validationType, normalizeValue);
}

export function removeOTPCharacter(currentValue: string, index: number) {
  if (index < 0 || index >= currentValue.length) return currentValue;
  return `${currentValue.slice(0, index)}${currentValue.slice(index + 1)}`;
}
