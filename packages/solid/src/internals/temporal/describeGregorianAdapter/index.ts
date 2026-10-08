import { describe } from 'vitest';
import './addVitestMatchers';
import { testComputations } from './testComputations';
import { testFormats } from './testFormats';
import { testLocalization } from './testLocalization';
import type { DescribeGregorianAdapterParameters } from './describeGregorianAdapter.types';

export function describeGregorianAdapter<T>(parameters: DescribeGregorianAdapterParameters<T>) {
  describe('Gregorian adapter methods', () => {
    describe(parameters.adapter.lib, () => {
      testComputations(parameters);
      testLocalization(parameters);
      testFormats(parameters);
    });
  });
}
