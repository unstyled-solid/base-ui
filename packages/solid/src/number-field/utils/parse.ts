// Adapted from Base UI (MIT), 19511bb171f3b360b006c94cf6d07e53cb446505.
import { getFormatter } from '../../utils/formatNumber';

const HAN_NUMERALS = '零〇一二三四五六七八九';
const NON_ASCII_DIGIT_RE = /[٠-٩۰-۹０-９]/g;
const HAN_RE = /[零〇一二三四五六七八九]/g;
export const PERCENTAGES = ['%', '٪', '％', '﹪'];
export const PERMILLE = ['‰', '؉'];
export const FULLWIDTH_DECIMAL = '．';
export const FULLWIDTH_GROUP = '，';
export const PERCENT_RE = /[%٪％﹪]/;
export const PERMILLE_RE = /[‰؉]/;
export const ARABIC_PERSIAN_DETECT_RE = /[٠-٩۰-۹]/;
export const HAN_DETECT_RE = /[零〇一二三四五六七八九]/;
export function isNumeralChar(char: string) {
  return /[0-9٠-٩۰-۹０-９零〇一二三四五六七八九]/.test(char);
}
export const BASE_NON_NUMERIC_SYMBOLS = ['.', ',', FULLWIDTH_DECIMAL, FULLWIDTH_GROUP, '٫', '٬'] as const;
export const SPACE_SEPARATOR_RE = /\p{Zs}/u;
export const FORMAT_CONTROL_DETECT_RE = /\p{Cf}/u;
export const PLUS_SIGNS_WITH_ASCII = ['+', '＋', '﹢'];
export const MINUS_SIGNS_WITH_ASCII = ['-', '−', '－', '‒', '–', '—', '﹣'];
export const ANY_MINUS_RE = /[-−－‒–—﹣]/gu;
export const ANY_PLUS_RE = /[+＋﹢]/gu;
export const ANY_MINUS_DETECT_RE = /[-−－‒–—﹣]/;
export const ANY_PLUS_DETECT_RE = /[+＋﹢]/;
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function shiftDecimal(value: number, exponentDelta: number) {
  const [coefficient, exponent = '0'] = String(value).split('e');
  return Number(`${coefficient}e${Number(exponent) + exponentDelta}`);
}

export function getFormatParts(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  return getFormatter(locale, options).formatToParts(11111.1);
}

export function getNumberLocaleDetails(locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  const result: Partial<Record<Intl.NumberFormatPartTypes, string | undefined>> = {};
  getFormatParts(locale, options).forEach((part) => { result[part.type] = part.value; });
  let decimal = '.';
  getFormatter(locale).formatToParts(0.1).forEach((part) => {
    if (part.type === 'decimal') decimal = part.value;
  });
  return { ...result, decimal };
}

export function parseNumber(formattedNumber: string, locale?: Intl.LocalesArgument, options?: Intl.NumberFormatOptions) {
  let input = formattedNumber.replace(/\p{Cf}/gu, '').trim();
  input = input.replace(ANY_MINUS_RE, '-').replace(ANY_PLUS_RE, '+');
  let isNegative = false;
  const takeSign = (_match: string, sign: string) => {
    if (sign === '-') isNegative = true;
    return '';
  };
  input = input.replace(/([+-])\s*$/, takeSign).replace(/^\s*([+-])/, takeSign);
  let computedLocale = locale;
  if (computedLocale === undefined) {
    if (ARABIC_PERSIAN_DETECT_RE.test(input)) computedLocale = 'ar';
    else if (HAN_DETECT_RE.test(input)) computedLocale = 'zh';
  }
  const { group, decimal, currency, exponentSeparator } = getNumberLocaleDetails(computedLocale, options);
  const unitParts = getFormatter(computedLocale, options).formatToParts(1)
    .filter((p) => p.type === 'unit').map((p) => escapeRegExp(p.value));
  const unitRegex = unitParts.length ? new RegExp(unitParts.join('|'), 'g') : null;
  let groupRegex: RegExp | null = null;
  if (group) {
    groupRegex = /\p{Zs}/u.test(group) ? /\p{Zs}/gu
      : group === "'" || group === '’' ? /['’]/g : new RegExp(escapeRegExp(group), 'g');
  }
  const replacements: Array<[RegExp | null, string | ((m: string) => string)]> = [
    [groupRegex, ''], [new RegExp(escapeRegExp(decimal), 'g'), '.'],
    [/[．٫]/g, '.'], [/[，٬]/g, ''],
    [currency ? new RegExp(escapeRegExp(currency), 'g') : null, ''],
    [unitRegex, ''], [/[%٪％﹪]/g, ''], [/[‰؉]/g, ''],
    [exponentSeparator ? new RegExp(escapeRegExp(exponentSeparator), 'g') : null, 'e'],
    [NON_ASCII_DIGIT_RE, (ch) => String(ch.charCodeAt(0) % 16)],
    [HAN_RE, (ch) => String(Math.max(HAN_NUMERALS.indexOf(ch) - 1, 0))],
  ];
  let unformatted = replacements.reduce((acc, [regex, replacement]) => {
    if (!regex) return acc;
    return typeof replacement === 'string' ? acc.replace(regex, replacement) : acc.replace(regex, replacement);
  }, input);
  const lastDot = unformatted.lastIndexOf('.');
  if (lastDot !== -1) {
    unformatted = `${unformatted.slice(0, lastDot).replace(/\./g, '')}.${unformatted.slice(lastDot + 1).replace(/\./g, '')}`;
  }
  if (/^[-+]?Infinity$/i.test(input) || input.includes('∞')) return null;
  let num = parseFloat((isNegative ? '-' : '') + unformatted);
  const isUnitPercent = options?.style === 'unit' && options.unit === 'percent';
  if (PERMILLE_RE.test(formattedNumber)) num = shiftDecimal(num, -3);
  else if (!isUnitPercent && (PERCENT_RE.test(formattedNumber) || options?.style === 'percent')) num = shiftDecimal(num, -2);
  return Number.isFinite(num) ? num : null;
}
