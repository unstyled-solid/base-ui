import type { TemporalAdapter } from '..';
export const TEST_DATE_ISO_STRING = '2018-10-30T11:44:25.750Z';
export const TEST_DATE_LOCALE_STRING = '2018-10-30';

export function getAdapterWeekendDays<T>(adapter: TemporalAdapter<T>) {
  const monday = adapter.date('2018-10-29T12:00:00.000Z', 'UTC');
  return [1, 2, 3, 4, 5, 6, 7].filter((day) => adapter.isWeekend(adapter.addDays(monday, day - 1)));
}
export const hasIntlWeekInfo = 'getWeekInfo' in Intl.Locale.prototype || 'weekInfo' in Intl.Locale.prototype;
const stubWeekInfo = { firstDay: 1, weekend: [2, 3] };
export function stubIntlWeekInfo(api: 'method' | 'accessor' | 'none') {
  const prototype = Intl.Locale.prototype;
  const keys = ['getWeekInfo', 'weekInfo'];
  const descriptors = keys.map((key) => Object.getOwnPropertyDescriptor(prototype, key));
  keys.forEach((key) => Reflect.deleteProperty(prototype, key));
  if (api === 'method') {
    Object.defineProperty(prototype, 'getWeekInfo', { configurable: true, writable: true, value: () => stubWeekInfo });
  } else if (api === 'accessor') {
    Object.defineProperty(prototype, 'weekInfo', { configurable: true, get: () => stubWeekInfo });
  }
  return () => {
    keys.forEach((key, index) => {
      Reflect.deleteProperty(prototype, key);
      const descriptor = descriptors[index];
      if (descriptor) Object.defineProperty(prototype, key, descriptor);
    });
  };
}
