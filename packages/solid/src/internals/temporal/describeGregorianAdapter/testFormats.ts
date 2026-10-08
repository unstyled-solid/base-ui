import { it, expect } from 'vitest';
import type { TemporalAdapterFormats } from '..';
import type { DescribeGregorianAdapterParameters } from './describeGregorianAdapter.types';

export function testFormats<T>({ adapter }: DescribeGregorianAdapterParameters<T>) {
  const expectFormattedDate = (format: keyof TemporalAdapterFormats, expected: string) => {
    const date = adapter.date('2020-01-01T15:08:09.000Z', 'utc');
    expect(adapter.format(date, format)).toBe(expected);
  };
  it('should correctly format standalone hardcoded formats', () => {
    expectFormattedDate('yearPadded', '2020');
    expectFormattedDate('monthPadded', '01');
    expectFormattedDate('dayOfMonthPadded', '01');
    expectFormattedDate('hours24hPadded', '15');
    expectFormattedDate('hours12hPadded', '03');
    expectFormattedDate('minutesPadded', '08');
    expectFormattedDate('secondsPadded', '09');
    expectFormattedDate('dayOfMonth', '1');
    expectFormattedDate('weekday', 'Wednesday');
    expectFormattedDate('weekday3Letters', 'Wed');
    expectFormattedDate('meridiem', 'PM');
  });
}
