import type { TemporalAdapter, TemporalTimezone } from '..';

export interface DescribeGregorianAdapterParameters<T> {
  adapter: TemporalAdapter<T>;
  adapterFr: TemporalAdapter<T>;
  adapterTZ?: TemporalAdapter<T>;
  setDefaultTimezone: ((timezone: TemporalTimezone | undefined) => void) | null;
  createDateInFrenchLocale: (dateStr: string) => T;
  createAdapterWithLocale: (localeCode: AdapterLocaleCode) => TemporalAdapter<T>;
}
export type AdapterLocaleCode = 'en-US' | 'he' | 'en-IN' | 'ar-SA' | 'hi' | 'ar-EG';
