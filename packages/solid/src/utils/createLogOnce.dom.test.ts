import { beforeEach, expect, it } from 'vitest';
import { expectDiagnostic } from '../../../../test/harness/diagnostics';
import { createLogOnce, reset } from './createLogOnce';
import { warn } from './warn';
import { error } from './error';
beforeEach(reset);
it('source custom prefix, no prefix and joined messages; retains real console diagnostics', async () => {
  await expectDiagnostic({ message: /^My Library: message$/ }, () => {
    const log = createLogOnce('warn', 'My Library'); log('message'); log('message');
  });
  await expectDiagnostic({ message: /^message$/ }, () => createLogOnce('error')('message'));
  await expectDiagnostic({ message: /^first second$/ }, () => createLogOnce('warn')('first', 'second'));
});
it('source deduplicates severity independently, shares instances and logs again after reset', async () => {
  await expectDiagnostic({ message: /^message$/, count: 2 }, () => {
    createLogOnce('warn')('message'); createLogOnce('warn')('message'); createLogOnce('error')('message');
  });
  await expectDiagnostic({ message: /^message$/ }, () => { reset(); createLogOnce('warn')('message'); });
  await expectDiagnostic({ message: /^Base UI: message$/, count: 2 }, () => { warn('message'); error('message'); });
  expect(typeof reset).toBe('function');
});
