// Adapted from Base UI (MIT), pinned source recorded in tracking/foundations/filter.json.
export function stringifyLocale(locale?: Intl.LocalesArgument): string {
  if (Array.isArray(locale)) {
    return locale.map((value) => stringifyLocale(value)).join(',');
  }
  if (locale == null) {
    return '';
  }
  return String(locale);
}
