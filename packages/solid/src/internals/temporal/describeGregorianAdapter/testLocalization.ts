import { it, expect } from 'vitest';
import type { DescribeGregorianAdapterParameters } from './describeGregorianAdapter.types';
export function testLocalization<T>({ adapter }: DescribeGregorianAdapterParameters<T>) {
  it('Method: getCurrentLocaleCode', () => {
    expect(adapter.getCurrentLocaleCode()).toMatch(/en/);
  });
}
